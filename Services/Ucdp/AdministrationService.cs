using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Office2010.Word;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using ResearchSuite.Dtos.Oross;
using ResearchSuite.Dtos.UCDP;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using System;
using System.Composition;

namespace ResearchSuite.Services.Ucdp
{
    public class AdministrationService : IAdministrationService
    {
        private readonly AppSettings _appSettings;

        public AdministrationService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public async Task<List<ReadApplicationResource>> GetProgressReportPending()
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetProgressReportPending";
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<ReadApplicationResource>>(url, "GET", "");
            return response ?? new List<ReadApplicationResource>();
        }

        public async Task<List<ProgressReportDetailsViewModel>> GetProgressReportSubmitted()
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetProgressReportSubmitted";
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProgressReportDetailsViewModel>>(url, "GET", "");
            return response ?? new List<ProgressReportDetailsViewModel>();
        }

        public async Task<List<ProgressReportCommentsViewModel>> GetCommentsByReportId(int reportId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetCommentsByReportId/" + reportId;
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProgressReportCommentsViewModel>>(url, "GET", "");
            return response ?? new List<ProgressReportCommentsViewModel>();
        }

        public async Task<ProgressReportDetailsViewModel> ViewProgressReport(int applicationId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/ViewProgressReport/" + applicationId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, ProgressReportDetailsViewModel>(url, "GET", 0);
            return response ?? new ProgressReportDetailsViewModel();
        }

        public async Task<List<CreateDocumentViewModel>> GetProgressReportDocuments(int applicationId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetProgressReportDocuments/" + applicationId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, List<CreateDocumentViewModel>>(url, "GET", 0);
            return response ?? new List<CreateDocumentViewModel>();
        }

        public async Task<string> ViewDocument(int documentId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetProgressReportDocument/" + documentId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, string>(url, "GET", 0);
            return response ?? "";
        }

        public async Task<FundingCallsModel> GetFundingCalls(int fundingCallId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetFundingCalls/" + fundingCallId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, FundingCallsModel>(url, "GET", 0);
            return response ?? new FundingCallsModel();
        }

        public async Task<ApplicationDetailsViewModel> SearchCompleteApplications(SearchApplicationViewDto searchViewDto)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/SearchCompleteApplications";
            var response = await APICaller.AuthenticatedApiCallAsync<SearchApplicationViewDto, ApplicationDetailsViewModel>(url, "POST", searchViewDto);
            return response ?? new ApplicationDetailsViewModel();
        }

        public async Task<ProgressReportDetailsViewModel> GetProgressReportDetails(int applicationDetailsId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetProgressReportDetails/" + applicationDetailsId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, ProgressReportDetailsViewModel>(url, "GET", 0);
            return response ?? new ProgressReportDetailsViewModel();
        }

        public async Task<FundingCallsModel> GetFundingCall(int fundingCallId)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/GetFundingCall/" + fundingCallId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, FundingCallsModel>(url, "GET", 0);
            return response ?? new FundingCallsModel();
        }

        public async Task<ProgressReportDetailsViewModel> AddProgressReport(ProgressReportDetailsViewModel details)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/AddProgressReport";
            var response = await APICaller.AuthenticatedApiCallAsync<ProgressReportDetailsViewModel, ProgressReportDetailsViewModel>(url, "POST", details);
            return response ?? new ProgressReportDetailsViewModel();
        }

        public async Task<ProgressReportDetailsViewModel> UpdateProgressDetails(ProgressReportDetailsViewModel details)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/UpdateProgressReport";
            var response = await APICaller.AuthenticatedApiCallAsync<ProgressReportDetailsViewModel, ProgressReportDetailsViewModel>(url, "POST", details);
            return response ?? new ProgressReportDetailsViewModel();
        }

        public async Task<List<CreateDocumentViewModel>> UploadProgressReportDocuments(List<CreateDocumentViewModel> files)
        {
            var url = $"{_appSettings.ResearchGateway}Documents/UploadProgressReportDocuments";
            var response = await APICaller.AuthenticatedApiCallAsync<List<CreateDocumentViewModel>, List<CreateDocumentViewModel>>(url, "POST", files);
            return response ?? throw new Exception("Documents couldn't not be saved.");
        }

        public async Task<List<CreateDocumentViewModel>> DeleteProgressReportDocument(int documentId)
        {
            var url = $"{_appSettings.ResearchGateway}Documents/DeleteProgressReportDocument/" + documentId;
            var response = await APICaller.AuthenticatedApiCallAsync<int, List<CreateDocumentViewModel>>(url, "GET", 0);
            return response ?? throw new Exception("Documents couldn't not be deleted.");
        }

        public async Task<ProgressReportCommentsViewModel> AddComments(ProgressReportCommentsViewModel comments)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/AddComments";
            var response = await APICaller.AuthenticatedApiCallAsync<ProgressReportCommentsViewModel, ProgressReportCommentsViewModel>(url, "POST", comments);
            return response ?? throw new Exception("Comments counld not be saved.");
        }

        public async Task<ProgressReportDetailsViewModel> UpdateRFIProgressReport(ProgressReportDetailsViewModel report)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/RFIProgressReport";
            var response = await APICaller.AuthenticatedApiCallAsync<ProgressReportDetailsViewModel, ProgressReportDetailsViewModel>(url, "POST", report);
            return response ?? throw new Exception("Status could not be updated.");
        }

        public async Task<ProgressReportDetailsViewModel> FinaliseProgressReport(ProgressReportDetailsViewModel report)
        {
            var url = $"{_appSettings.ResearchGateway}Administration/FinalizeProgressReport";
            var response = await APICaller.AuthenticatedApiCallAsync<ProgressReportDetailsViewModel, ProgressReportDetailsViewModel>(url, "POST", report);
            return response ?? throw new Exception("Status could not be updated.");
        }
    }
}
