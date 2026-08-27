using DocumentFormat.OpenXml.Office2010.PowerPoint;
using ResearchSuite.Dtos.UCDP;

namespace ResearchSuite.Services.Interfaces
{
    public interface IApplicationsDashboardService
    {
        Task<MeDto> Me();
        Task<List<ApplicationRowDto>> Inbox();
        Task<List<ApplicationRowDto>> My();
        Task<List<ApplicationRowDto>> Processed(string mode = "IProcessed");
        Task<RefreshResultDto> RefreshApprovers();
        Task<List<ApplicationRowDto>> HistoryMyTeam();
    }

}
