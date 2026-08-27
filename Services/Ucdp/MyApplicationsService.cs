using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using System.Globalization;

namespace ResearchSuite.Services.Ucdp
{
    public class MyApplicationsService : IMyApplicationsService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppSettings _appSettings;
        private readonly IMemoryCache _memoryCache;
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        public MyApplicationsService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> appSettings, IMemoryCache memoryCache, Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
            _memoryCache = memoryCache;
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<List<ReadApplicationResource>> GetMyApplications(int? userId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/GetMyApplications/" + userId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ReadApplicationResource>>(url, "GET", "");
                return response ?? new List<ReadApplicationResource>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public string ConvertTwoDecimals(string toConvert)
        {

            if (toConvert.Contains("."))
            {
                return toConvert;
            }
            decimal totalCost;

            decimal.TryParse(toConvert, out totalCost);

            return totalCost.ToString("0.00");
        }

        public async Task<ApplicationDetailsViewModel> ApplicationPDF(int applicationId)
        {

            List<ApplicationSupportRequiredViewModel> applicationsSupportReq = new List<ApplicationSupportRequiredViewModel>();
            List<ApplicationsProjectsViewModel> applicationsProjects = new List<ApplicationsProjectsViewModel>();
            ApplicationDetailsViewModel applicationDetails = new ApplicationDetailsViewModel();
            FundingCallsModel fundingCalls = new FundingCallsModel();
            List<ProjectsViewModel> projectsList = new List<ProjectsViewModel>();
            List<ApplicationDetailsViewModel> allApplications = new List<ApplicationDetailsViewModel>();



            ApplicationDetailsViewModel results = new ApplicationDetailsViewModel();

            List<UploadDocumentViewModel> documentList = new List<UploadDocumentViewModel>();
            var temporaryAppointees = new List<TemporaryAppointeeViewModel>();
            var payments = new List<PaymentsViewModel>();
            var careerDevelopmentPayments = new List<PaymentsViewModel>();

            results = await APICaller.AuthenticatedApiCallAsync<string, ApplicationDetailsViewModel>($"{_appSettings.ResearchGateway}Applications/DownloadCompleteApplications/{applicationId}", "GET", "");

            if (results == null || results.Id == 0)
            {
                return null;
            }

            fundingCalls = await APICaller.AuthenticatedApiCallAsync<string, FundingCallsModel>($"{_appSettings.ResearchGateway}FundingCalls/{results.FundingCallDetailsId}", "GET", "") ?? new FundingCallsModel();

            //projectsList = await APICaller.AuthenticatedApiCallAsync<string, List<ProjectsViewModel>>($"{_appSettings.ResearchGateway}Projects/", "GET", "");

            if (results != null)
            {
                applicationsProjects = await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationsProjectsViewModel>>($"{_appSettings.ResearchGateway}ApplicationsProjects/" + results.Id, "GET", "");

                documentList = await APICaller.AuthenticatedApiCallAsync<string, List<UploadDocumentViewModel>>($"{_appSettings.ResearchGateway}Documents/" + results.Id, "GET", "");

                applicationsSupportReq = await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationSupportRequiredViewModel>>($"{_appSettings.ResearchGateway}ApplicationsSupportRequired/" + results.Id, "GET", "");

                temporaryAppointees = await APICaller.AuthenticatedApiCallAsync<string, List<TemporaryAppointeeViewModel>>(
                    $"{_appSettings.ResearchGateway}TemporaryAppointees/GetTemporaryAppointees/" + results.Id, "GET", "")
                    ?? new List<TemporaryAppointeeViewModel>();

                payments = await APICaller.AuthenticatedApiCallAsync<string, List<PaymentsViewModel>>(
                    $"{_appSettings.ResearchGateway}Payments/GetPayments/" + results.Id, "GET", "")
                    ?? new List<PaymentsViewModel>();

                careerDevelopmentPayments = await APICaller.AuthenticatedApiCallAsync<string, List<PaymentsViewModel>>(
                    $"{_appSettings.ResearchGateway}Payments/GetCareerDevelopmentPayments/" + results.Id, "GET", "")
                    ?? new List<PaymentsViewModel>();
            }

            applicationDetails.FundingCallDetails = fundingCalls;

            if (results != null)
            {
                applicationDetails.Id = results.Id;
                applicationDetails.FundingStartDate = results.FundingStartDate;
                applicationDetails.FundingEndDate = results.FundingEndDate;
                applicationDetails.CostCentreName = results.CostCentreName;
                applicationDetails.CostCentreNumber = results.CostCentreNumber;
                applicationDetails.PreviousFundingYear = results.PreviousFundingYear;
                applicationDetails.PreviousFundingAmount = string.IsNullOrEmpty(results.PreviousFundingAmount) ? "0" : results.PreviousFundingAmount.Replace(" ", "");
                applicationDetails.PreviousFundingOutcome = results.PreviousFundingOutcome;
                applicationDetails.ApplicantCategory = results.ApplicantCategory;
                applicationDetails.AppointmentCategory = results.AppointmentCategory;
                applicationDetails.LastSavedStep = results.LastSavedStep;
                applicationDetails.FundingCallDetailsId = results.FundingCallDetailsId;
                applicationDetails.UserId = results.UserId;
                applicationDetails.SelectedProjects = applicationsProjects;
                applicationDetails.SelectedSupportRequired = applicationsSupportReq;
                applicationDetails.StudyingTowards = results.StudyingTowards;
                applicationDetails.FirstYearRegistration = results.FirstYearRegistration;
                applicationDetails.PlannedGraduationYear = results.PlannedGraduationYear;
                applicationDetails.Describe = results.Describe;
                applicationDetails.AppointmentDescribe = results.AppointmentDescribe;
                applicationDetails.SupportRequired = results.SupportRequired;
                applicationDetails.supportRequiredItem = results.SupportRequired != null ? results.SupportRequired[0] : "";
                applicationDetails.AppointmentOption = results.AppointmentOption;
                applicationDetails.appointmentItem = results.AppointmentOption != null ? results.AppointmentOption[0] : "";
                applicationDetails.FinancialSupport = results.FinancialSupport;
                applicationDetails.financialSupportItem = results.FinancialSupport != null ? results.FinancialSupport[0] : "";
                applicationDetails.CareerFinancialSupport = results.CareerFinancialSupport;
                applicationDetails.careerFinancialSupportItem = results.CareerFinancialSupport != null ? results.CareerFinancialSupport[0] : "";
                applicationDetails.CareerTeachingRelief = results.CareerTeachingRelief;
                applicationDetails.careerTeachingReliefItem = results.CareerTeachingRelief != null ? results.CareerTeachingRelief[0] : "";
                applicationDetails.FinancialMotivation = results.FinancialMotivation;
                applicationDetails.OtherFunding = string.IsNullOrEmpty(results.OtherFunding) ? "0" : results.OtherFunding.Replace(" ", "");
                applicationDetails.FacultyContibution = string.IsNullOrEmpty(results.FacultyContibution) ? "0" : results.FacultyContibution.Replace(" ", "");
                applicationDetails.DHETFundsRequested = string.IsNullOrEmpty(results.DHETFundsRequested) ? "0" : results.DHETFundsRequested.Replace(" ", "");
                applicationDetails.ApplicantProgress = results.ApplicantProgress;
                applicationDetails.OutputMeasure = results.OutputMeasure;
                applicationDetails.DepartmentContribution = string.IsNullOrEmpty(results.DepartmentContribution) ? "0" : results.DepartmentContribution.Replace(" ", "");
                applicationDetails.ResearchFundsContribution = string.IsNullOrEmpty(results.ResearchFundsContribution) ? "0" : results.ResearchFundsContribution.Replace(" ", "");
                applicationDetails.TotalCost = string.IsNullOrEmpty(results.TotalCost) ? "0" : ConvertTwoDecimals(results.TotalCost.Replace(" ", ""));
                applicationDetails.UploadedDocs = documentList;
                applicationDetails.UserDetails = results.UserDetails;
                applicationDetails.PreviousFunding = results.PreviousFundingYear == null ? "No" : "Yes";
                applicationDetails.FundAdminApprovedAmount = string.IsNullOrEmpty(results.FundAdminApprovedAmount) ? "0" : ConvertTwoDecimals(results.FundAdminApprovedAmount.Replace(" ", ""));
                applicationDetails.FundAdminComment = results.FundAdminComment;
                applicationDetails.SIAComment = results.SIAComment;
                applicationDetails.ApprovedAmount = string.IsNullOrEmpty(results.ApprovedAmount) ? "0" : ConvertTwoDecimals(results.ApprovedAmount.Replace(" ", ""));
                applicationDetails.LastModifierUsername = !string.IsNullOrEmpty(results.ApprovedAmount) && results.ApprovedAmount != "0.00" ? results.LastModifierUsername : "";
                applicationDetails.TemporaryAppointees = temporaryAppointees;
                applicationDetails.Payments = payments;
                applicationDetails.CareerDevelopmentPayments = careerDevelopmentPayments;
            }

            return applicationDetails;
        }

        public async Task<ActionResult<List<ReadDocumentResource>>> GetDocsListByApplicationsId(int applicationId)
        {
            var documentList = await APICaller.AuthenticatedApiCallAsync<string, List<ReadDocumentResource>>($"{_appSettings.ResearchGateway}Documents/GetDocumentsListByApplicationsId/" + applicationId, "GET", "");
            return documentList;
        }

        public async Task<ActionResult<byte[]>> GetDocument(int documentId)
        {
            var results = await APICaller.AuthenticatedApiCallAsync<string, byte[]>($"{_appSettings.ResearchGateway}Documents/GetDocumentV2/" + documentId, "GET", "");

            return results;
        }

        public async Task<ApplicationDetailsViewModel> GetAwardLetter(string referenceNumber)
        {
            ApplicationDetailsViewModel application = new ApplicationDetailsViewModel();

            application = await APICaller.AuthenticatedApiCallAsync<string, ApplicationDetailsViewModel>($"{_appSettings.ResearchGateway}DocumentSignOff/GetMyApplicationsByReff/" + referenceNumber, "GET", "");

            if (application == null)
            {
                // Log it, and decide what makes sense for your app:
                // throw a specific exception, or return an empty/default view model
                throw new InvalidOperationException($"No application found for reference number '{referenceNumber}'.");
            }

            application.ApprovedAmount = string.IsNullOrEmpty(application.ApprovedAmount) ? "0" : string.Format("{0:N}", decimal.Parse(application.ApprovedAmount.Replace(" ", ""), CultureInfo.InvariantCulture)).Replace(',', '.');


            return application;
        }

        public async Task<string> GetCommentsByApplicationId(int applicationsId)
        {
            return await APICaller.AuthenticatedApiCallAsync<string, string>(
                $"{_appSettings.ResearchGateway}Applications/GetCommentsByApplicationId/{applicationsId}",
                "GET",
                ""
            );
        }

    }
}
