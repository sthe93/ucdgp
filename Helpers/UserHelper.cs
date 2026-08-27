using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc.Rendering;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Models.UCDP.Enums;
using System.Globalization;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Serilog;

namespace ResearchSuite.Helpers
{
    public static class UserHelper
    {
        public static string GetFullName(ClaimsPrincipal user)
        {
            var first = ToProperCase(GetFirstName(user));
            var last = ToProperCase(GetLastName(user));

            if (!string.IsNullOrWhiteSpace(first) || !string.IsNullOrWhiteSpace(last))
                return $"{first} {last}".Trim();

            return GetUsername(user) ?? "Guest";
        }

        public static string ToProperCase(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            var lowerWords = new HashSet<string> { "of", "and", "the", "in", "on", "at", "for", "by", "with" };
            var words = input.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            for (int i = 0; i < words.Length; i++)
            {
                if (i == 0 || !lowerWords.Contains(words[i]))
                    words[i] = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(words[i]);
            }

            return string.Join(' ', words);
        }


        public static List<string> GetAccessibleApps(ClaimsPrincipal user)
        {
            var apps = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "oross",
                "ucdp",
                "ucdg"
            };

            var appClaim = user?.FindFirst("app")?.Value;
            if (!string.IsNullOrWhiteSpace(appClaim))
            {
                foreach (var a in appClaim.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    apps.Add(a.ToLowerInvariant());
            }

            return apps.ToList();
        }


        public static bool HasAccessToApp(ClaimsPrincipal user, string appName)
        {
            if (user?.Identity?.IsAuthenticated != true)
                return false;

            appName = (appName ?? "").Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(appName))
                return false;

            // 1) Prefer namespaced roles (ClaimTypes.Role: "ucdp:admin", "oross:user", etc.)
            var hasNamespacedRole = user.FindAll(ClaimTypes.Role)
                .Any(c => c.Value.StartsWith(appName + ":", StringComparison.OrdinalIgnoreCase));

            if (hasNamespacedRole)
                return true;

            // 2) Fallback to legacy role_{app} claim (csv)
            var legacy = user.FindFirst($"role_{appName}")?.Value;
            if (!string.IsNullOrWhiteSpace(legacy))
            {
                var anyRole = legacy
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Any();

                if (anyRole)
                    return true;
            }

            return false;
        }

        public static bool HasRole(ClaimsPrincipal user, string appName, string role)
        {
            if (user?.Identity?.IsAuthenticated != true)
                return false;

            appName = (appName ?? "").Trim().ToLowerInvariant();
            role = (role ?? "").Trim();

            if (string.IsNullOrWhiteSpace(appName) || string.IsNullOrWhiteSpace(role))
                return false;

            var namespaced = user.FindAll(ClaimTypes.Role)
                .Any(c => string.Equals(c.Value, $"{appName}:{role}", StringComparison.OrdinalIgnoreCase));

            if (namespaced)
                return true;

            var appRoles = GetRolesForApp(user, appName);
            return appRoles.Contains(role);
        }

        public static string? GetFaculty(ClaimsPrincipal user) => user.FindFirst("Faculty")?.Value;
        public static string? GetFacultyId(ClaimsPrincipal user) => user.FindFirst("FacultyId")?.Value;

        public static string GetRoleForApp(ClaimsPrincipal user, string appName)
        {
            if (string.IsNullOrWhiteSpace(appName))
                return "Unknown";

            // Map new controller/module names to the claim name from the token
            var appClaimMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    { "ucdp", "UCDP" },
                    { "oross", "OROSS" }
                };

            var claimAppName = appClaimMap.ContainsKey(appName) ? appClaimMap[appName] : appName;

            var claimType = $"role_{claimAppName.ToLowerInvariant()}";
            var roleClaim = user.FindFirst(claimType)?.Value;

            if (string.IsNullOrWhiteSpace(roleClaim))
                return "Unknown";

            return ToProperCase(roleClaim);
        }


        public static string NormalizeFacultyName(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            string normalized = input.Trim().ToLowerInvariant();

            // Manual mappings for known aliases
            var mappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { "engineering", "engineering and built environment" },
        { "faculty of engineering", "engineering and built environment" },
        { "faculty of engineering and the built environment", "engineering and built environment" },
        { "engineering & built environment", "engineering and built environment" },
        { "engineering and built environment", "engineering and built environment" }
    };

            foreach (var kvp in mappings)
            {
                if (normalized.Contains(kvp.Key))
                    return kvp.Value;
            }

            // Fallback normalization
            normalized = Regex.Replace(normalized, "([a-z])([A-Z])", "$1 $2"); // space between glued words
            normalized = normalized
                .Replace("faculty of", "")
                .Replace("the", "")
                .Replace("&", "and")
                .Replace(",", " ")
                .Replace("  ", " ")
                .Trim();

            normalized = Regex.Replace(normalized, @"\s{2,}", " ");

            return normalized;
        }

        public static string NormalizeSdgText(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "";

            // Remove "SDG", "SDG ", and number prefixes like "9." or "SDG 9:"
            input = input.Trim();

            // Remove "SDG" prefix if present
            if (input.StartsWith("SDG", StringComparison.OrdinalIgnoreCase))
                input = input.Substring(3).TrimStart(':', ' ');

            // Remove numeric prefix like "9." or "9:"
            var colonIndex = input.IndexOf(':');
            var dotIndex = input.IndexOf('.');
            int cutIndex = (colonIndex > 0 && colonIndex < 4) ? colonIndex : (dotIndex > 0 && dotIndex < 4) ? dotIndex : -1;

            if (cutIndex > 0)
                input = input.Substring(cutIndex + 1).Trim();

            return input;
        }
        public static int GetFacultyIdFromText(string input, IEnumerable<SelectListItem> facultyOptions)
        {
            if (string.IsNullOrWhiteSpace(input)) return 0;

            string normalizedInput = NormalizeFacultyName(input);

            foreach (var item in facultyOptions)
            {
                if (string.IsNullOrWhiteSpace(item.Value)) continue;

                string normalizedOption = NormalizeFacultyName(item.Text);
                if (string.Equals(normalizedInput, normalizedOption, StringComparison.OrdinalIgnoreCase))
                {
                    return int.Parse(item.Value);
                }
            }

            return 0;
        }

        public static int GetSdgIdFromText(string input, IEnumerable<SelectListItem> sdgOptions)
        {
            if (string.IsNullOrWhiteSpace(input)) return 0;

            string normalizedInput = NormalizeSdgText(input).ToLowerInvariant();

            foreach (var item in sdgOptions)
            {
                if (string.IsNullOrWhiteSpace(item.Value)) continue;

                string optionText = NormalizeSdgText(item.Text).ToLowerInvariant();
                if (normalizedInput == optionText)
                {
                    return int.Parse(item.Value);
                }
            }
            return 0;
        }

        public static HashSet<string> GetRolesForApp(ClaimsPrincipal user, string appName)
        {
            var roles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (user?.Identity?.IsAuthenticated != true)
                return roles;

            appName = (appName ?? "").Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(appName))
                return roles;

            var csv = user.FindFirst($"role_{appName}")?.Value;
            if (string.IsNullOrWhiteSpace(csv))
                return roles;

            foreach (var r in csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                roles.Add(r);

            return roles;
        }

        public static string? GetUsername(ClaimsPrincipal user)
        {
            Log.Information("GetUsername(ClaimsPrincipal user)");
            Log.Information("Attempting to retrieve username from claims for user: {User}", user?.Identity?.Name ?? "Unknown");
            Log.Information("Attempting to retrieve username from claims for user: {User}", user?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown");
            Log.Information("Attempting to retrieve username from claims for user: {User}", user?.FindFirst("Username")?.Value ?? "Unknown");

            return user?.Identity?.Name
                ?? user?.FindFirst(ClaimTypes.Name)?.Value
                ?? user?.FindFirst("Username")?.Value;
        }

        public static int GetUserId(ClaimsPrincipal user)
        {
            var raw = user?.FindFirst("userId")?.Value
           ?? user?.FindFirst("UserId")?.Value;

            return int.TryParse(raw, out var id) ? id : 0;
        }

        public static string? GetStaffNumber(ClaimsPrincipal user)
        {
            return user?.FindFirst("staffNumber")?.Value;
        }

        public static string? GetFirstName(ClaimsPrincipal user)
        {
            return user?.FindFirst("FirstName")?.Value;
        }

        public static string? GetLastName(ClaimsPrincipal user)
        {
            return user?.FindFirst("LastName")?.Value;
        }

        public static bool IsUCDGHOD(string staffNumber, string currentApproverNumer, int applicationStatusId)
        {
            if (staffNumber == currentApproverNumer && applicationStatusId == (int)ApplicationStatusEnum.PendingApprovalByHOD) {
                return true;
            }
            return false;
        }

        public static bool IsUCDGViceDean(string staffNumber, string currentApproverNumer, int applicationStatusId)
        {
            if (staffNumber == currentApproverNumer && applicationStatusId == (int)ApplicationStatusEnum.PendingApprovalbyViceDean)
            {
                return true;
            }
            return false;
        }

        public static bool IsTempHOD(ClaimsPrincipal user, List<TempApproverViewModel> tempApproverViewModels) {
            var userId = GetUserId(user);
            if (tempApproverViewModels == null) { return false; }
            return tempApproverViewModels.Any(x => x.UserId == userId && x.RoleName == "First Line Manager (Temporary)");
        }

        public static bool IsTempViceDean(ClaimsPrincipal user, List<TempApproverViewModel> tempApproverViewModels)
        {
            var userId = GetUserId(user);
            if (tempApproverViewModels == null) { return false; }
            return tempApproverViewModels.Any(x => x.UserId == userId && x.RoleName == "Second Line Manager (Temporary)");
        }

        public static bool IsTempFundAdministrator(ClaimsPrincipal user, List<TempApproverViewModel> tempApproverViewModels)
        {
            var userId = GetUserId(user);
            if (tempApproverViewModels == null) { return false; }
            return tempApproverViewModels.Any(x => x.UserId == userId && x.RoleName == "Fund Administrator (Temporary)");
        }

        public static bool IsTempSiaDirector(ClaimsPrincipal user, List<TempApproverViewModel> tempApproverViewModels)
        {
            var userId = GetUserId(user);
            if (tempApproverViewModels == null) { return false; }
            return tempApproverViewModels.Any(x => x.UserId == userId && x.RoleName == "SIA Director (Temporary)");
        }

        public static bool DisableQuoteCheck(ClaimsPrincipal user, List<TempApproverViewModel> tempApproverViewModels,
            string currentApproverNumer, int applicationStatusId) {

            var staffNumber = GetStaffNumber(user);
            var userRoles = GetRolesForApp(user, "ucdg");

            var isHOD = IsUCDGHOD(staffNumber, currentApproverNumer, applicationStatusId);
            var isViceDean = IsUCDGViceDean(staffNumber, currentApproverNumer, applicationStatusId);
            var isFundAdmin = userRoles.Any(r => r.Equals("fund administrator", StringComparison.OrdinalIgnoreCase));
            var isSiaDirector = userRoles.Any(r => r.Equals("sia director", StringComparison.OrdinalIgnoreCase));
            var isTempHOD = IsTempHOD(user, tempApproverViewModels);
            var isTempViceTeam = IsTempViceDean(user, tempApproverViewModels);
            var isTempFundAdmin = IsTempFundAdministrator(user, tempApproverViewModels);
            var isTempSiaDirector = IsTempSiaDirector(user, tempApproverViewModels);

            var disableCheckControl = isHOD || isViceDean || isFundAdmin || isSiaDirector || isTempHOD || isTempViceTeam || isTempFundAdmin || isTempSiaDirector;
            return disableCheckControl;
        }

        public static bool IsMyApplication(ClaimsPrincipal user, ApplicationDetailsViewModel model) {
            var userId = GetUserId(user);
            if (model.UserDetails == null)
            {
                return true;
            }
            else if (model.UserDetails.UserId == userId)
            {
                return true;
            }
            else {
                return false;
            }
        }

    }
}
