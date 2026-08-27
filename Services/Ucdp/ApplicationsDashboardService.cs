using Microsoft.Extensions.Options;
using ResearchSuite.Dtos.UCDP;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Services.Ucdp
{

    public class ApplicationsDashboardService : IApplicationsDashboardService
    {
        private readonly AppSettings _appSettings;

        public ApplicationsDashboardService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public async Task<MeDto> Me()
        {
            var baseUrl = _appSettings.ResearchGateway?.TrimEnd('/');
            var url = $"{baseUrl}/ApplicationsDashboard/me";
            var res = await APICaller.AuthenticatedApiCallAsync<string, MeDto>(url, "GET", "");
            return res ?? new MeDto();
        }

        public async Task<List<ApplicationRowDto>> Inbox()
        {
            var baseUrl = _appSettings.ResearchGateway?.TrimEnd('/');
            var url = $"{baseUrl}/ApplicationsDashboard/inbox";
            return await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationRowDto>>(url, "GET", "")
                   ?? new List<ApplicationRowDto>();
        }

        public async Task<List<ApplicationRowDto>> My()
        {
            var baseUrl = _appSettings.ResearchGateway?.TrimEnd('/');
            var url = $"{baseUrl}/ApplicationsDashboard/my";
            var a = await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationRowDto>>(url, "GET", "")
                   ?? new List<ApplicationRowDto>();
            return a;
        }

        public async Task<List<ApplicationRowDto>> Processed(string mode = "IProcessed")
        {
            var baseUrl = _appSettings.ResearchGateway?.TrimEnd('/');
            var url = $"{baseUrl}/ApplicationsDashboard/processed?mode={Uri.EscapeDataString(mode)}";
            return await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationRowDto>>(url, "GET", "")
                   ?? new List<ApplicationRowDto>();
        }

        public async Task<RefreshResultDto> RefreshApprovers()
        {
            var baseUrl = _appSettings.ResearchGateway?.TrimEnd('/');
            var url = $"{baseUrl}/ApplicationsDashboard/admin/refresh-approvers";
            return await APICaller.AuthenticatedApiCallAsync<string, RefreshResultDto>(url, "POST", "")
                   ?? new RefreshResultDto();
        }

        public async Task<List<ApplicationRowDto>> HistoryMyTeam()
        {
            var baseUrl = _appSettings.ResearchGateway?.TrimEnd('/');
            var url = $"{baseUrl}/ApplicationsDashboard/history/myteam";
            return await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationRowDto>>(url, "GET", "")
                   ?? new List<ApplicationRowDto>();
        }
    }
}
