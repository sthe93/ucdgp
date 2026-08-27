using System.Net.Http;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Services.Ucdp
{
    public class ApplicationsService : IApplicationsService
    {
        private readonly AppSettings _appSettings;
        private readonly IMemoryCache _memoryCache;
        private readonly string _baseUrl;
        public ApplicationsService(IOptions<AppSettings> appSettings, IMemoryCache memoryCache)
        {
            ;
            _appSettings = appSettings.Value;
            _memoryCache = memoryCache;
            _baseUrl = _appSettings.ResearchGateway.EndsWith("/") ? _appSettings.ResearchGateway : _appSettings.ResearchGateway + "/";
        }

        private string BuildUrl(string endpoint) => $"{_baseUrl}{endpoint}";
        public async Task<List<UploadDocumentViewModel>> GetApplicationDocuments(int applicationId)
        {
            return await APICaller.AuthenticatedApiCallAsync<int, List<UploadDocumentViewModel>>(BuildUrl($"Documents/{applicationId}"), "GET", 0) ?? new List<UploadDocumentViewModel>();
        }

        public async Task<List<ApplicationsProjectsViewModel>> GetApplicationsProjects(int applicationId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}ApplicationsProjects/{applicationId}";
                var response = await APICaller.AuthenticatedApiCallAsync<int, List<ApplicationsProjectsViewModel>>(url, "GET", 0);
                return response ?? new List<ApplicationsProjectsViewModel>();

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<ApplicationSupportRequiredViewModel>> GetApplicationSupportRequired(int applicationId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/ApplicationSupportRequired/" + applicationId;
                var response = await APICaller.AuthenticatedApiCallAsync<int, List<ApplicationSupportRequiredViewModel>>(url, "GET", 0);
                return response ?? new List<ApplicationSupportRequiredViewModel>();

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<string> GetDocument(int documentId)
        {
            var url = $"{_appSettings.ResearchGateway}Documents/GetDocumentV2/{documentId}";
            var response = await APICaller.AuthenticatedApiCallAsync<int, string>(url, "GET", 0);
            return response ?? "";
        }


        public async Task<List<ReadUserViewModelResource>> GetTemporaryApproverApplications(int userId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/GetTemporaryApproverApplications/{userId}";
                var response = await APICaller.AuthenticatedApiCallAsync<int, List<ReadUserViewModelResource>>(url, "GET", 0);
                return response ?? new List<ReadUserViewModelResource>();

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<ApplicationDetailsViewModel> SaveImprovementStaffQualifications(ApplicationDetailsViewModel details)
        {
            try
            {
                var url = BuildUrl($"Applications/ApplicationImprovementStaffQualifications");
                var response = await APICaller.AuthenticatedApiCallAsync<ApplicationDetailsViewModel, ApplicationDetailsViewModel>(url, "POST", details);
                return response;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> UpdateTemporaryAppointee(int applicationsId)
        {
            return await APICaller.AuthenticatedApiCallAsync<string, bool>(BuildUrl($"TemporaryAppointees/UpdateTemporaryAppointee/{applicationsId}"), "GET", "");
        }

        public async Task<TemporaryAppointeeViewModel> SaveStaffImprovementTemporaryAppointee(TemporaryAppointeeViewModel model)
        {
            return await APICaller.AuthenticatedApiCallAsync<TemporaryAppointeeViewModel, TemporaryAppointeeViewModel>(BuildUrl("TemporaryAppointees/SaveStaffImprovementTemporaryAppointee"),
                "POST", model);
        }
        public async Task<PaymentsViewModel> SaveImprovementOfStaffQualificationsPayment(PaymentsViewModel model)
        {
            return await APICaller.AuthenticatedApiCallAsync<PaymentsViewModel, PaymentsViewModel>(BuildUrl("Payments/SaveImprovementOfStaffQualificationsPayment"), "POST", model);
        }


        public async Task<List<UploadDocumentViewModel>> PostDocuments(List<UploadDocumentViewModel> files)
        {
            var url = $"{_appSettings.ResearchGateway}Documents/PostDocuments";
            var response = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(url, "POST", files);
            return response ?? throw new Exception("Documents could not be saved.");
        }

        public async Task<bool> SubmitApplication(ApplicationSubmissionModel model)
        {
            var url = $"{_appSettings.ResearchGateway}Applications/SubmitApplication";
            var response = await APICaller.AuthenticatedApiCallAsync<ApplicationSubmissionModel, bool>(url, "POST", model);
            return response ? response : throw new Exception("Application could not be saved.");
        }

        public async Task<List<UploadDocumentViewModel>> UploadDocuments(List<UploadDocumentViewModel> documents)
        {
            if (documents == null || !documents.Any())
                return new List<UploadDocumentViewModel>();

            return await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(BuildUrl("Documents/PostDocuments"), HttpMethod.Post.ToString(), documents);
        }
        public async Task<bool> UpdateApplicationStatus(UpdateApplicationStatusResource model)
        {
            var url = $"{_appSettings.ResearchGateway}Applications/UpdateApplicationStatus";
            var response = await APICaller.AuthenticatedApiCallAsync<UpdateApplicationStatusResource, bool>(url, "POST", model);
            return response ? response : throw new Exception("Application could not be saved.");
        }
        public async Task<List<UploadDocumentViewModel>> DeleteDocument(int documentId)
        {
            return await APICaller.AuthenticatedApiCallAsync<string, List<UploadDocumentViewModel>>(
                BuildUrl($"Documents/DeleteDocument/{documentId}"), "GET", "") ?? new List<UploadDocumentViewModel>();
        }

        public async Task<List<TemporaryAppointeeViewModel>> GetTemporaryAppointees(int applicationsId)
        {
            return await APICaller.AuthenticatedApiCallAsync<string, List<TemporaryAppointeeViewModel>>(BuildUrl($"TemporaryAppointees/GetTemporaryAppointees/{applicationsId}"), "GET", "") ?? new List<TemporaryAppointeeViewModel>();
        }

        public async Task<List<PaymentsViewModel>> GetPayments(int applicationsId)
        {
            return await APICaller.AuthenticatedApiCallAsync<string, List<PaymentsViewModel>>(BuildUrl($"Payments/GetPayments/{applicationsId}"), "GET", "") ?? new List<PaymentsViewModel>();
        }

        public async Task<bool> DeletePayment(int paymentId)
        {
            var result = await APICaller.AuthenticatedApiCallAsync<object, int>(BuildUrl($"Payments/DeletePayment/{paymentId}"), "GET", null);
            return result > 0;
        }

        public async Task<bool> DeleteTemporaryAppointee(int temporaryAppointeeId)
        {
            return await APICaller.AuthenticatedApiCallAsync<string, bool>(BuildUrl($"TemporaryAppointees/DeleteTemporaryAppointee/{temporaryAppointeeId}"), "GET", "");
        }

        public async Task<ReadUserViewModelResource?> GetStaffByIdNumber(string idNumber)
        {
            if (string.IsNullOrWhiteSpace(idNumber))
                return null;

            return await APICaller.AuthenticatedApiCallAsync<string, ReadUserViewModelResource>(BuildUrl($"users/GetStaffByIdNumber/{idNumber}"), "GET", "");
        }


    }
}
