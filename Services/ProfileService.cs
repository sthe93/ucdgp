using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Options;
using ResearchSuite.Dtos.Suite;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppSettings _settings;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        public ProfileService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> options, IConfiguration configuration)
        {
            _settings = options.Value;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }
        public async Task<EmployeeBioDto> SyncAndGetProfileAsync(string username)
        {
            string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
            var syncUrl = $"{_settings.ResearchGateway}Users/SyncProfile?username={username}";
            var employee = await APICaller.AuthenticatedApiCallAsync<object, EmployeeBioDto>(syncUrl, "POST", null);
            return employee;
        }

    }
}
