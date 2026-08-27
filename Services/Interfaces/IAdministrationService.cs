using ResearchSuite.Dtos.UCDP;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;

namespace ResearchSuite.Services.Interfaces
{
    public interface IAdministrationService
    {
        Task<List<ReadApplicationResource>> GetProgressReportPending();
        Task<List<ProgressReportDetailsViewModel>> GetProgressReportSubmitted();
        Task<List<ProgressReportCommentsViewModel>> GetCommentsByReportId(int reportId);
        Task<ProgressReportDetailsViewModel> ViewProgressReport(int applicationId);
        Task<List<CreateDocumentViewModel>> GetProgressReportDocuments(int applicationId);
        Task<string> ViewDocument(int documentId);
        Task<FundingCallsModel> GetFundingCalls(int fundingCallId);
        Task<ApplicationDetailsViewModel> SearchCompleteApplications(SearchApplicationViewDto searchViewDto);
        Task<ProgressReportDetailsViewModel> GetProgressReportDetails(int applicationDetailsId);
        Task<FundingCallsModel> GetFundingCall(int fundingCallId);
        Task<ProgressReportDetailsViewModel> AddProgressReport(ProgressReportDetailsViewModel details);
        Task<ProgressReportDetailsViewModel> UpdateProgressDetails(ProgressReportDetailsViewModel details);
        Task<List<CreateDocumentViewModel>> UploadProgressReportDocuments(List<CreateDocumentViewModel> files);
        Task<List<CreateDocumentViewModel>> DeleteProgressReportDocument(int documentId);
        Task<ProgressReportCommentsViewModel> AddComments(ProgressReportCommentsViewModel comments);
        Task<ProgressReportDetailsViewModel> UpdateRFIProgressReport(ProgressReportDetailsViewModel comments);
        Task<ProgressReportDetailsViewModel> FinaliseProgressReport(ProgressReportDetailsViewModel report);
    }
}
