using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

public static class JwtHelper
{
    public const string UCDGHODRole = "HOD";
    public const string UCDGViceDeanRole = "Executive / Vice Dean";
    public const string UCDGFundAdminRole = "Fund Administrator";
    public const string UCDGSiaDirectorRole = "SIA Director";

    public static bool IsUCDGHODRole = false;
    public static bool IsUCDGViceDeanRole = false;
    public static bool IsUCDGFundAdminRole = false;
    public static bool IsUCDGSiaDirectorRole = false;

    public sealed class GatewayAccessInfo
    {
        public string App { get; set; } = "";
        public string RoleOross { get; set; } = "";
        public string RoleUcdg { get; set; } = "";
    }

    public static GatewayAccessInfo ExtractGatewayAccessInfo(string token)
    {
        var result = new GatewayAccessInfo();

        if (string.IsNullOrWhiteSpace(token))
            return result;

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        var userDataClaim = jwt.Claims.FirstOrDefault(c => c.Type == "userData")?.Value;
        if (string.IsNullOrWhiteSpace(userDataClaim))
            return BuildDefaultAccess(result);

        using var doc = JsonDocument.Parse(userDataClaim);

        if (!doc.RootElement.TryGetProperty("Applications", out var appsProp) ||
            appsProp.ValueKind != JsonValueKind.Array)
        {
            return BuildDefaultAccess(result);
        }

        var userApps = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
        {
            ["oross"] = new(),
            ["ucdg"] = new()
        };

        foreach (var app in appsProp.EnumerateArray())
        {
            if (!app.TryGetProperty("AppName", out var appNameProp))
                continue;

            var appName = appNameProp.GetString()?.Trim()?.ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(appName))
                continue;

            var roles = ExtractRoles(app);

            if (!userApps.TryGetValue(appName, out var existingRoles))
                existingRoles = new List<string>();

            existingRoles.AddRange(roles);

            userApps[appName] = existingRoles
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        FinalizeOrossRoles(userApps);
        FinalizeUcdgRoles(userApps);

        result.App = string.Join(",", userApps.Keys);
        result.RoleOross = string.Join(",", userApps["oross"]);
        result.RoleUcdg = string.Join(",", userApps["ucdg"]);

        return result;
    }

    private static GatewayAccessInfo BuildDefaultAccess(GatewayAccessInfo result)
    {
        result.App = "oross,ucdg";
        result.RoleOross = "user";
        result.RoleUcdg = "Applicant";
        return result;
    }

    private static List<string> ExtractRoles(JsonElement appJson)
    {
        var roles = new List<string>();

        if (!appJson.TryGetProperty("Roles", out var rolesProp) &&
            !appJson.TryGetProperty("Role", out rolesProp))
            return roles;

        if (rolesProp.ValueKind == JsonValueKind.String)
        {
            var raw = rolesProp.GetString();
            if (!string.IsNullOrWhiteSpace(raw))
            {
                roles.AddRange(raw
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
            }
        }
        else if (rolesProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in rolesProp.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                {
                    var role = item.GetString()?.Trim();
                    if (!string.IsNullOrWhiteSpace(role))
                        roles.Add(role);
                }
            }
        }

        return roles
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static void FinalizeOrossRoles(Dictionary<string, List<string>> userApps)
    {
        if (!userApps.TryGetValue("oross", out var roles) || roles == null)
            roles = new List<string>();

        if (roles.Count == 0)
            roles.Add("user");

        userApps["oross"] = roles
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static void FinalizeUcdgRoles(Dictionary<string, List<string>> userApps)
    {
        if (!userApps.TryGetValue("ucdg", out var roles) || roles == null)
            roles = new List<string>();

        if (roles.Count == 0)
            roles.Add("Applicant");

        var isAdmin = roles.Any(r => r.Equals("admin", StringComparison.OrdinalIgnoreCase));
        var hasApplicant = roles.Any(r => r.Equals("applicant", StringComparison.OrdinalIgnoreCase));

        if (isAdmin && !hasApplicant)
            roles.Add("Applicant");

        userApps["ucdg"] = roles
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}