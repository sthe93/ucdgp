using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;

namespace ResearchSuite.Services.Interfaces
{
    public interface IApplicationsService
    {
        Task<List<ReadUserViewModelResource>> GetTemporaryApproverApplications(int userId);
        Task<List<UploadDocumentViewModel>> GetApplicationDocuments(int applicationId);
        Task<List<ApplicationSupportRequiredViewModel>> GetApplicationSupportRequired(int applicationId);
        Task<List<ApplicationsProjectsViewModel>> GetApplicationsProjects(int applicationId);

        Task<List<UploadDocumentViewModel>> UploadDocuments(List<UploadDocumentViewModel> documents);
        Task<ApplicationDetailsViewModel> SaveImprovementStaffQualifications(ApplicationDetailsViewModel details);
        Task<bool> UpdateTemporaryAppointee(int applicationId);
        Task<PaymentsViewModel> SaveImprovementOfStaffQualificationsPayment(PaymentsViewModel model);
        Task<List<UploadDocumentViewModel>> PostDocuments(List<UploadDocumentViewModel> files);
        Task<string> GetDocument(int documentId);
        Task<List<UploadDocumentViewModel>> DeleteDocument(int documentId);
        Task<bool> SubmitApplication(ApplicationSubmissionModel model);
        Task<bool> UpdateApplicationStatus(UpdateApplicationStatusResource model);
        Task<List<TemporaryAppointeeViewModel>> GetTemporaryAppointees(int applicationsId);
        Task<List<PaymentsViewModel>> GetPayments(int applicationsId);
        Task<bool> DeletePayment(int paymentId);
        Task<bool> DeleteTemporaryAppointee(int temporaryAppointeeId);
        Task<TemporaryAppointeeViewModel> SaveStaffImprovementTemporaryAppointee(TemporaryAppointeeViewModel model);
        Task<ReadUserViewModelResource?> GetStaffByIdNumber(string idNumber);
    }
}
