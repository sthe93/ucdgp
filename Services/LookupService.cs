using Microsoft.Extensions.Options;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Oross;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Services
{
    public class LookupService : ILookupService
    {
        public LookupService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> appSettings)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
        }

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppSettings _appSettings;
        public async Task<List<LookupDto>> GetLookups(int lookupTypeId)
        {
            string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
            var url = $"{_appSettings.ResearchGateway}Lookups/LookupTypeId/{lookupTypeId}";
            var response = await APICaller.HttpCallJsonAsync<int, List<LookupDto>>(url, "POST", lookupTypeId, token);
            return response;
        }
    }
}
