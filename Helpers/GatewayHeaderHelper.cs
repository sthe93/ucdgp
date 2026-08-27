using System.Security.Claims;

namespace ResearchSuite.Helpers
{
    public static class GatewayHeaderHelper
    {
        public static void ApplyHeaders(HttpRequestMessage request, JwtHelper.GatewayAccessInfo accessInfo)
        {
            if (accessInfo == null) return;

            if (!string.IsNullOrWhiteSpace(accessInfo.App))
            {
                request.Headers.Remove("app");
                request.Headers.Add("app", accessInfo.App);
            }

            if (!string.IsNullOrWhiteSpace(accessInfo.RoleOross))
            {
                request.Headers.Remove("role_oross");
                request.Headers.Add("role_oross", accessInfo.RoleOross);
            }

            if (!string.IsNullOrWhiteSpace(accessInfo.RoleUcdg))
            {
                request.Headers.Remove("role_ucdg");

                if (JwtHelper.IsUCDGHODRole)
                {
                    request.Headers.Add("role_ucdg", JwtHelper.UCDGHODRole);
                }
                else if (JwtHelper.IsUCDGViceDeanRole)
                {
                    request.Headers.Add("role_ucdg", JwtHelper.UCDGViceDeanRole);
                }
                else if (JwtHelper.IsUCDGFundAdminRole)
                {
                    request.Headers.Add("role_ucdg", JwtHelper.UCDGFundAdminRole);
                }
                else if (JwtHelper.IsUCDGSiaDirectorRole)
                {
                    request.Headers.Add("role_ucdg", JwtHelper.UCDGSiaDirectorRole);
                }
                else
                {
                    request.Headers.Add("role_ucdg", accessInfo.RoleUcdg);
                }
            }
        }

    }
}
