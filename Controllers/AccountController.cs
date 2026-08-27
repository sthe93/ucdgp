using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Models;
using ResearchSuite.Services.Interfaces;
using Serilog;

namespace ResearchSuite.Controllers
{
    public class AccountController(ILoginService loginservice) : Controller
    {
        private readonly ILoginService _loginservice = loginservice;

        public IActionResult Index() => RedirectToAction("Login");

        [RequireHttps]
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login()
        {
            if (User.Identity?.IsAuthenticated == true)
                return RedirectToAction("Index", "Home");
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var token = await _loginservice.Login(model.Username, model.Password);
            if (string.IsNullOrEmpty(token))
            {
                ModelState.AddModelError("", "Invalid username or password");
                return View(model);
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var claimsList = new List<Claim>
            {
                new Claim(ClaimTypes.Name, model.Username.Trim()),
                new Claim("Username", model.Username.Trim())
            };
            Log.Information("User info added to claims list {Username}.", model.Username.Trim());

            var userDataJson = jwtToken.Claims.FirstOrDefault(c => c.Type == "userData")?.Value;


            if (!string.IsNullOrWhiteSpace(userDataJson))
            {
                try
                {
                    Log.Information("userDataJson has data. Processing userData claim for user {Username}.", model.Username.Trim());
                    claimsList.Add(new Claim("userData", userDataJson));

                    var userData = JsonDocument.Parse(userDataJson).RootElement;

                    var firstName = userData.GetProperty("FirstName").GetString();
                    var lastName = userData.GetProperty("LastName").GetString();
                    var userId = userData.GetProperty("UserId").GetInt32();

                    string? staffNumber = null;
                    if (userData.TryGetProperty("StaffNumber", out var snProp) && snProp.ValueKind == JsonValueKind.String)
                        staffNumber = snProp.GetString();

                    if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
                    {
                        ModelState.AddModelError("", "Invalid username: first name or last name is missing.");
                        return View(model);
                    }

                    claimsList.Add(new Claim("FirstName", firstName));
                    claimsList.Add(new Claim("LastName", lastName));
                    claimsList.Add(new Claim("userId", userId.ToString()));
                    claimsList.Add(new Claim("UserId", userId.ToString()));

                    if (!string.IsNullOrWhiteSpace(staffNumber))
                        claimsList.Add(new Claim("staffNumber", staffNumber));

                    string facultyId = "";
                    string faculty = "";

                    var userApps = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
                    {
                        ["oross"] = new(),
                        ["ucdg"] = new()
                    };

                    if (userData.TryGetProperty("Applications", out var appsJson) && appsJson.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var appJson in appsJson.EnumerateArray())
                        {
                            var rawApp = appJson.GetProperty("AppName").GetString()?.Trim();
                            if (string.IsNullOrWhiteSpace(rawApp))
                                continue;

                            var appKey = rawApp.ToLowerInvariant();
                            var roles = ExtractRolesFromToken(appJson);

                            if (!userApps.TryGetValue(appKey, out var existing))
                                existing = new List<string>();

                            existing.AddRange(roles);
                            userApps[appKey] = existing.Distinct(StringComparer.OrdinalIgnoreCase).ToList();

                            var (hasTemp, tempScopesList) = ExtractTempScopes(appJson);
                            if (hasTemp)
                            {
                                HttpContext.Session.SetString($"tempScopes_{appKey}", JsonSerializer.Serialize(tempScopesList));
                                claimsList.Add(new Claim($"hasTempRole_{appKey}", "1"));

                                var tempTypes = tempScopesList
                                    .Select(x => x.RoleType)
                                    .Where(x => !string.IsNullOrWhiteSpace(x))
                                    .Distinct(StringComparer.OrdinalIgnoreCase)
                                    .ToList();

                                if (tempTypes.Count > 0)
                                    claimsList.Add(new Claim($"tempRoleTypes_{appKey}", string.Join(",", tempTypes)));
                            }

                            if (string.IsNullOrWhiteSpace(facultyId) && appJson.TryGetProperty("FacultyId", out var fid))
                            {
                                facultyId = fid.ValueKind switch
                                {
                                    JsonValueKind.Number => fid.GetInt32().ToString(),
                                    JsonValueKind.String => fid.GetString() ?? "",
                                    _ => ""
                                };
                            }

                            if (string.IsNullOrWhiteSpace(faculty) && appJson.TryGetProperty("Faculty", out var fac))
                                faculty = fac.GetString() ?? "";
                        }
                    }

                    FinalizeOrossRoles(userApps);
                    FinalizeUcdpRoles(userApps);

                    claimsList.Add(new Claim("FacultyId", facultyId));
                    claimsList.Add(new Claim("Faculty", faculty));

                    claimsList.Add(new Claim("app", string.Join(",", userApps.Keys)));
                    claimsList.Add(new Claim("role_oross", string.Join(",", userApps["oross"])));
                    claimsList.Add(new Claim("role_ucdg", string.Join(",", userApps["ucdg"])));

                    foreach (var role in userApps["oross"].Distinct(StringComparer.OrdinalIgnoreCase))
                        claimsList.Add(new Claim(ClaimTypes.Role, $"oross:{role}"));

                    foreach (var role in userApps["ucdg"].Distinct(StringComparer.OrdinalIgnoreCase))
                        claimsList.Add(new Claim(ClaimTypes.Role, $"ucdg:{role}"));

                    var primaryApp = userApps["oross"].Count > 0 ? "oross" : "ucdg";
                    var primaryRole = primaryApp == "oross"
                        ? userApps["oross"].FirstOrDefault() ?? "user"
                        : userApps["ucdg"].FirstOrDefault() ?? "Applicant";

                    claimsList.Add(new Claim("role", primaryRole));
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Error processing userData claim for user {Username}.", model.Username.Trim());
                    ModelState.AddModelError("", $"There was a problem processing your user data: {ex.Message}");
                    return View(model);
                }
            }
            else
            {
                Log.Warning("userDataJson is missing or empty for user {Username}. Adding default claims.", model.Username.Trim());
                claimsList.Add(new Claim("role", "user"));
                claimsList.Add(new Claim("app", "oross,ucdg"));
                claimsList.Add(new Claim("role_oross", "user"));
                claimsList.Add(new Claim("role_ucdg", "Applicant"));
                claimsList.Add(new Claim(ClaimTypes.Role, "oross:user"));
                claimsList.Add(new Claim(ClaimTypes.Role, "ucdg:Applicant"));
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            var identity = new ClaimsIdentity(claimsList, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity));

            Log.Information("User claims identity set");
            HttpContext.Session.SetString("token", token);

            return RedirectToAction("Index", "Home");
        }


        private static List<string> ExtractRolesFromToken(JsonElement appJson)
        {
            var roles = new List<string>();

            if (!appJson.TryGetProperty("Roles", out var rolesProp) &&
                !appJson.TryGetProperty("Role", out rolesProp))
                return roles;

            if (rolesProp.ValueKind == JsonValueKind.String)
            {
                var s = rolesProp.GetString();
                if (!string.IsNullOrWhiteSpace(s))
                    roles.AddRange(s.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
            }
            else if (rolesProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var r in rolesProp.EnumerateArray())
                {
                    if (r.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(r.GetString()))
                        roles.Add(r.GetString()!.Trim());
                }
            }

            return roles.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }

        private static void FinalizeOrossRoles(Dictionary<string, List<string>> userApps)
        {
            if (!userApps.TryGetValue("oross", out var roles) || roles == null)
                roles = new List<string>();

            if (roles.Count == 0)
                roles.Add("user");

            userApps["oross"] = roles.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }

        private static void FinalizeUcdpRoles(Dictionary<string, List<string>> userApps)
        {
            if (!userApps.TryGetValue("ucdg", out var roles) || roles == null)
                roles = new List<string>();

            // ✅ if no roles -> applicant
            if (roles.Count == 0)
                roles.Add("Applicant");

            // ✅ if admin exists -> ensure applicant
            var isAdmin = roles.Any(r => r.Equals("admin", StringComparison.OrdinalIgnoreCase));
            var hasApplicant = roles.Any(r => r.Equals("applicant", StringComparison.OrdinalIgnoreCase));
            if (isAdmin && !hasApplicant)
                roles.Add("Applicant");

            userApps["ucdg"] = roles.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }

        private static (bool hasTemp, List<TempScopeSessionVm> scopes) ExtractTempScopes(JsonElement appJson)
        {
            JsonElement tempScopes;

            if (!(appJson.TryGetProperty("tempRoleScopes", out tempScopes) ||
                  appJson.TryGetProperty("TempRoleScopes", out tempScopes)))
                return (false, new List<TempScopeSessionVm>());

            if (tempScopes.ValueKind != JsonValueKind.Array)
                return (false, new List<TempScopeSessionVm>());

            var map = new Dictionary<int, TempScopeSessionVm>();

            foreach (var scope in tempScopes.EnumerateArray())
            {
                int roleId = 0;

                if (scope.TryGetProperty("roleId", out var rid) || scope.TryGetProperty("RoleId", out rid))
                {
                    if (rid.ValueKind == JsonValueKind.Number) roleId = rid.GetInt32();
                    else if (rid.ValueKind == JsonValueKind.String && int.TryParse(rid.GetString(), out var parsed)) roleId = parsed;
                }

                if (roleId == 0) continue;

                if (!map.TryGetValue(roleId, out var vm))
                {
                    vm = new TempScopeSessionVm { RoleId = roleId };

                    if (scope.TryGetProperty("roleType", out var rt) || scope.TryGetProperty("RoleType", out rt))
                        vm.RoleType = rt.GetString() ?? "";

                    map[roleId] = vm;
                }

                if (scope.TryGetProperty("ucdgApplicationIds", out var ids) || scope.TryGetProperty("UcdgApplicationIds", out ids))
                {
                    if (ids.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var idEl in ids.EnumerateArray())
                        {
                            if (idEl.ValueKind == JsonValueKind.Number)
                                vm.UcdgApplicationIds.Add(idEl.GetInt32());
                            else if (idEl.ValueKind == JsonValueKind.String && int.TryParse(idEl.GetString(), out var parsedId))
                                vm.UcdgApplicationIds.Add(parsedId);
                        }
                    }
                }
            }

            foreach (var k in map.Keys.ToList())
                map[k].UcdgApplicationIds = map[k].UcdgApplicationIds.Distinct().ToList();

            var list = map.Values.ToList();
            return (list.Count > 0, list);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            HttpContext.Session.Clear();
            TempData.Clear();

            var pathBase = HttpContext.Request.PathBase.HasValue
                ? HttpContext.Request.PathBase.Value
                : "/";

            Response.Cookies.Delete("Cookie.AspNetCore.Cookies", new CookieOptions { Path = "/" });
            Response.Cookies.Delete(".ResearchSuite.Session", new CookieOptions { Path = "/" });

            if (pathBase != "/")
            {
                Response.Cookies.Delete("Cookie.AspNetCore.Cookies", new CookieOptions { Path = pathBase });
                Response.Cookies.Delete(".ResearchSuite.Session", new CookieOptions { Path = pathBase });
            }

            return RedirectToAction("Login", "Account");
        }

        [Authorize]
        [HttpGet]
        public IActionResult KeepAlive()
        {
            HttpContext.Session.SetString("LastActivity", DateTime.UtcNow.ToString("O"));
            return Ok(new { success = true });
        }

        [Authorize]
        [HttpGet]
        public IActionResult CheckSession()
        {
            var token = HttpContext.Session.GetString("token");

            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized(new { isValid = false, reason = "missing" });

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                if (jwtToken.ValidTo <= DateTime.UtcNow)
                    return Unauthorized(new { isValid = false, reason = "expired" });

                return Ok(new { isValid = true });
            }
            catch
            {
                return Unauthorized(new { isValid = false, reason = "invalid" });
            }
        }
    }
}