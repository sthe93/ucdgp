using System.Globalization;
using System.Text;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using ResearchSuite.Dtos.Suite;
using ResearchSuite.Helpers;
using ResearchSuite.Helpers.common;
using ResearchSuite.Helpers.Ucdp;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Models.UCDP.Enums;
using ResearchSuite.Models.UCDP.Shared;
using ResearchSuite.Services.Interfaces;
using UDCG.Application.Feature.Application.Resources;


namespace ResearchSuite.Controllers.UCDPControllers
{

    public class ApplicationsController(ILoginService loginservice, IUcdpService ucdpService, IProjectService projectService, IMyApplicationsService myApplicationsService, IApplicationsService applicationsService, IOptions<AppSettings> appSettings, ILogger<ApplicationsController> logger) : Controller
    {
        private readonly ILoginService _loginservice = loginservice;
        private readonly IUcdpService _ucdpService = ucdpService;
        private readonly IProjectService _projectService = projectService;
        private readonly IMyApplicationsService _myApplicationsService = myApplicationsService;
        private readonly IApplicationsService _applicationsService = applicationsService;
        private readonly AppSettings _appSettings = appSettings.Value;

        private bool QueryStringContainsTestValueNew => HttpContext.Request.Query.ContainsKey("test") &&
        HttpContext.Request.Query["test"].ToString().Equals("new", StringComparison.OrdinalIgnoreCase);

        private bool QueryStringContainsTestValueNewWithId => HttpContext.Request.Query.ContainsKey("test") &&
            HttpContext.Request.Query["test"].ToString().Equals("newwithid", StringComparison.OrdinalIgnoreCase);

        private string ApplicationId => HttpContext.Request.Query["ApplicationId"].ToString().ToLower();
        private readonly ILogger<ApplicationsController> _logger;


        public IActionResult Index()
        {
            return View();
        }

        [Authorize]
        public async Task<IActionResult> Apply(int? fundingCallId, int? applicationId, string? mode = null, string? returnUrl = null)
        {
            string username = UserHelper.GetUsername(User);

            if (string.IsNullOrWhiteSpace(username))
                return RedirectToAction("Login", "Account");

            var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);

            var employee = HttpContext.Session.GetObjectFromJson<EmployeeBioDto>(SessionKeys.EmployeeProfile);

            if (employee == null)
            {
                HttpContext.Session.Remove(SessionKeys.UcdpProfileSynced);
            }

            var requestedMode = string.IsNullOrWhiteSpace(mode) ? "edit" : mode.Trim().ToLowerInvariant();

            ViewBag.ReturnUrl = returnUrl;

            // OPEN EXISTING APPLICATION
            if (applicationId.HasValue && applicationId.Value > 0)
            {
                var existingApplication = await GetApplication(applicationId.Value);

                if (existingApplication == null || existingApplication.Id <= 0)
                    return NotFound();

                var statusId = existingApplication.ApplicationStatusId;

                var isEditableStatus = statusId == 1 || statusId == 10;
                var normalizedMode = (requestedMode == "edit" && isEditableStatus) ? "edit" : "view";

                ViewBag.Mode = normalizedMode;
                ViewBag.IsReadOnly = normalizedMode == "view";
                ViewBag.IsEditMode = normalizedMode == "edit";

                HttpContext.Session.SetString("CurrentApplicationId", existingApplication.Id.ToString());

                return View("~/Views/UCDP/Applications/Apply.cshtml", existingApplication);
            }

            // NEW APPLICATION / RESUME BY FUNDING CALL
            if (!fundingCallId.HasValue || fundingCallId.Value <= 0)
                return BadRequest("Funding call or application is required.");

            ViewBag.Mode = "edit";
            ViewBag.IsReadOnly = false;
            ViewBag.IsEditMode = true;

            int? userid = currentUser?.UserId;
            if (userid <= 0)
                return RedirectToAction("Index", "Home");

            string logginRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdp")?.Value;

            List<ApplicationSupportRequiredViewModel> applicationsSupportReq = new List<ApplicationSupportRequiredViewModel>();
            List<ApplicationsProjectsViewModel> applicationsProjects = new List<ApplicationsProjectsViewModel>();
            ApplicationDetailsViewModel applicationDetails = new ApplicationDetailsViewModel();
            FundingCallsModel fundingCalls = new FundingCallsModel();
            List<ProjectsViewModel> projectsList = new List<ProjectsViewModel>();

            var selectedFundingCallId = fundingCallId.GetValueOrDefault();

            if (selectedFundingCallId <= 0)
                return BadRequest("Funding call or application is required.");

            var fundingCallsList = await _ucdpService.GetFundingCalls();
            fundingCalls = fundingCallsList?.FirstOrDefault(fc => fc.Id == selectedFundingCallId) ?? new FundingCallsModel();

            SearchApplicationViewModel searchViewModel = new SearchApplicationViewModel
            {
                FundingCallId = selectedFundingCallId,
                UserId = userid.GetValueOrDefault()
            };

            var resultsList = await _ucdpService.SearchApplications(searchViewModel);
            var results = resultsList?.FirstOrDefault();

            if (results != null)
            {
                applicationsProjects = await _applicationsService.GetApplicationsProjects(results.Id);
            }

            List<ReadApplicationResource> readApplicationResource =
                await _ucdpService.GetMyPreviousApplications(userid);

            var fundedApps = readApplicationResource
                .Where(app => (app.ApplicationStartDate >= new DateTime(2026, 05, 01) && app.ApplicationStatus.ApplicationStatusId == 28) ||
                (app.ApplicationStartDate < new DateTime(2026, 05, 01) && (app.ApplicationStatus.ApplicationStatusId == 28 || app.ApplicationStatus.ApplicationStatusId == 8)))
                .ToList();

            var previousFundedList = new List<PreviousFundingViewModel>();

            if (fundedApps.Any())
            {
                var latestFundingDate = fundedApps.Max(app => app.FundingStartDate);

                previousFundedList = fundedApps
                    .Where(app => app.FundingStartDate == latestFundingDate)
                    .Select(app => new PreviousFundingViewModel
                    {
                        ApplicationDetails = app
                    })
                    .Take(1)
                    .ToList();
            }

            applicationDetails.previousFundingViewModel = previousFundedList;
            applicationDetails.FundingCallDetails = fundingCalls;
            applicationDetails.UserDetails = currentUser;
            applicationDetails.UserId = currentUser?.UserId ?? 0;
            applicationDetails.FundingCallDetailsId = fundingCalls?.Id ?? 0;

            if (results != null)
            {
                MapApplicationDetails(applicationDetails, results);
                applicationDetails.SelectedProjects = applicationsProjects;
                applicationDetails.SelectedSupportRequired = applicationsSupportReq;

                if (applicationDetails.Id > 0)
                {
                    HttpContext.Session.SetString("CurrentApplicationId", applicationDetails.Id.ToString());
                    applicationDetails.TemporaryAppointees = await _applicationsService.GetTemporaryAppointees(applicationDetails.Id) ?? new List<TemporaryAppointeeViewModel>();
                    applicationDetails.Payments = await _applicationsService.GetPayments(applicationDetails.Id) ?? new List<PaymentsViewModel>();
                    applicationDetails.UploadedDocs = await _applicationsService.GetApplicationDocuments(applicationDetails.Id) ?? new List<UploadDocumentViewModel>();
                }
            }
            else
            {
                applicationDetails.TemporaryAppointees = new List<TemporaryAppointeeViewModel>();
                applicationDetails.Payments = new List<PaymentsViewModel>();
                applicationDetails.UploadedDocs = new List<UploadDocumentViewModel>();
            }

            PopulateProject1DocumentModels(applicationDetails);

            if (QueryStringContainsTestValueNew)
            {
                HttpContext.Session.SetString("CurrentApplicationId", ApplicationId);
                return View("~/Views/UCDP/Applications/Test.cshtml", applicationDetails);
            }
            else if (QueryStringContainsTestValueNewWithId)
            {
                HttpContext.Session.SetString("CurrentApplicationId", ApplicationId);
                var currentApplicationId = HttpContext.Session.GetString("CurrentApplicationId");

                if (currentApplicationId.Contains(","))
                {
                    var array = currentApplicationId.Split(",");
                    currentApplicationId = array[0];
                }

                applicationDetails = await GetApplication(int.Parse(currentApplicationId));
                return View("~/Views/UCDP/Applications/Test.cshtml", applicationDetails);
            }
            else
            {
                return View("~/Views/UCDP/Applications/Apply.cshtml", applicationDetails);
            }
        }


        //to be removed after testing
        public async Task<IActionResult> FinancialImplication()
        {
            var applicationDetails = await GetApplication(5758);
            applicationDetails.AccomChooseCheapestModel.IsChecked = applicationDetails.AccomChooseCheapest;
            applicationDetails.FlightsChooseCheapestModel.IsChecked = applicationDetails.FlightsChooseCheapest;

            var isUCDGHODRole = UserHelper.IsUCDGHOD(HttpContext.User.FindFirst("StaffNumber")?.Value,
                                applicationDetails.CurrentApproverStaffNumber, applicationDetails.ApplicationStatusId);

            var isUCDGViceDeanRole = UserHelper.IsUCDGViceDean(HttpContext.User.FindFirst("StaffNumber")?.Value,
                                     applicationDetails.CurrentApproverStaffNumber, applicationDetails.ApplicationStatusId);

            if (isUCDGHODRole || isUCDGViceDeanRole || (applicationDetails.ApplicationStatusId != 1 && applicationDetails.ApplicationStatusId != 10))
            {
                applicationDetails.AccomChooseCheapestModel.IsEditMode = true;
                applicationDetails.FlightsChooseCheapestModel.IsEditMode = true;
            }

            return View("~/Views/UCDP/Applications/Partials/_StepFinancialmplication.cshtml", applicationDetails);
        }

        public async Task<IActionResult> UploadQuoteDocuments(UploadDocumentViewModel model)
        {
            var files = Request.Form.Files;
            List<UploadDocumentViewModel> documentsToUpload = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {
                var uploadDocumentViewModel = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    uploadDocumentViewModel.Filename = Path.GetFileName(file.FileName);
                    uploadDocumentViewModel.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    uploadDocumentViewModel.DocumentExtention = Path.GetExtension(file.FileName);
                    uploadDocumentViewModel.UploadType = EnumExtensions.GetEnumDescription<ProgressReportUploadTypeEnum>(Convert.ToInt32(model.UploadType));
                    uploadDocumentViewModel.ApplicationId = model.Id;
                }
                ;
                documentsToUpload.Add(uploadDocumentViewModel);
            }
            var addedDocuments = await _applicationsService.PostDocuments(documentsToUpload);
            return Json(new { status = "Saved", message = addedDocuments });
        }

        public async Task<IActionResult> SubmitApplication([FromForm] ApplicationSubmissionModel model)
        {
            var result = await _applicationsService.SubmitApplication(model);
            return Json(new { status = "Saved" });
        }

        public async Task<IActionResult> ApproveApplication(UpdateApplicationStatusResource model)
        {
            return await UpdateApplicationStatus(model, "Approved", WorkFlowStatuses.Approved);
        }

        public async Task<IActionResult> DeclineApplication(UpdateApplicationStatusResource model)
        {
            return await UpdateApplicationStatus(model, "Declined", WorkFlowStatuses.Declined);
        }


        public async Task<IActionResult> ReturnApplicationForInformation(UpdateApplicationStatusResource model)
        {
            return await UpdateApplicationStatus(model, "Returned for Info", WorkFlowStatuses.ReturnedForInformation);
        }

        public async Task<IActionResult> UpdateApplicationStatus(UpdateApplicationStatusResource model, string status, int workFlowStatus)
        {
            string username = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "Username")?.Value;
            string userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var currentRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdg")?.Value;

            _ = bool.TryParse(model.IsTemporaryHODApprover, out bool isTempHOD);
            _ = bool.TryParse(model.IsTemporaryViceDeanApprover, out bool isTempViceDean);
            _ = bool.TryParse(model.IsTemporaryFundAdminApprover, out bool isTempFundAdmin);
            _ = bool.TryParse(model.IsTemporarySiaDirectorApprover, out bool isTempSiaDirector);

            JwtHelper.IsUCDGHODRole = (UserHelper.IsUCDGHOD(HttpContext.User.FindFirst("StaffNumber")?.Value,
                model.CurrentApproverStaffNumber, model.ApplicationStatusId)) || isTempHOD;

            JwtHelper.IsUCDGViceDeanRole = UserHelper.IsUCDGViceDean(HttpContext.User.FindFirst("StaffNumber")?.Value,
                model.CurrentApproverStaffNumber, model.ApplicationStatusId) || isTempViceDean;

            JwtHelper.IsUCDGFundAdminRole = isTempFundAdmin;
            JwtHelper.IsUCDGSiaDirectorRole = isTempSiaDirector;

            model.CurrentUsername = username;
            model.UserId = Convert.ToInt32(userId);
            model.UpdateStatus = workFlowStatus;
            model.StatusName = status;
            model.RoleName = GetRoleName(currentRole);

            try
            {
                var result = await _applicationsService.UpdateApplicationStatus(model);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                                 ex,
                                 "An error occurred while updating application {ApplicationId} status to {Status}",
                                 model.ApplicationId,
                                 status);

                Response.StatusCode = StatusCodes.Status500InternalServerError;

                return Json(new
                {
                    status = "Failed",
                    message = "The application status could not be updated. Please try again."
                });
            }
            finally
            {
                JwtHelper.IsUCDGHODRole = false;
                JwtHelper.IsUCDGViceDeanRole = false;
                JwtHelper.IsUCDGFundAdminRole = false;
                JwtHelper.IsUCDGSiaDirectorRole = false;
            }

            return Json(new { status = "Saved" });
        }

        private string GetRoleName(string currentRole)
        {
            if (JwtHelper.IsUCDGHODRole)
            {
                return "HOD";
            }
            else if (JwtHelper.IsUCDGViceDeanRole)
            {
                return "Executive / Vice Dean";
            }
            else if (JwtHelper.IsUCDGFundAdminRole)
            {
                return "Fund Administrator";
            }
            else if (JwtHelper.IsUCDGSiaDirectorRole)
            {
                return "SIA Director";
            }
            else
            {
                return currentRole;
            }
        }

        [HttpGet]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            var results = await _applicationsService.DeleteDocument(documentId);
            return Ok(results);
        }

        public async Task<IActionResult> ViewDocument(int documentId)
        {
            var results = await _applicationsService.GetDocument(documentId);

            if (string.IsNullOrWhiteSpace(results))
                return NotFound("Document not found.");

            // Trim outer quotes if API returned a JSON string with quotes
            var cleaned = results.Trim();
            if ((cleaned.StartsWith("\"") && cleaned.EndsWith("\"")) || (cleaned.StartsWith("'") && cleaned.EndsWith("'")))
                cleaned = cleaned.Substring(1, cleaned.Length - 2);

            // If the string is a data URI (data:application/pdf;base64,....) extract base64 part
            var base64 = cleaned;
            var base64Marker = "base64,";
            var idx = cleaned.IndexOf(base64Marker, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
                base64 = cleaned.Substring(idx + base64Marker.Length);

            try
            {
                var bytes = Convert.FromBase64String(base64);
                var stream = new MemoryStream(bytes);

                // Set headers so browser shows inline in iframe and doesn't cache
                Response.Headers["Content-Disposition"] = $"inline; filename=document_{documentId}.pdf";
                Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                Response.Headers["Pragma"] = "no-cache";
                Response.Headers["Expires"] = "0";

                return new FileStreamResult(stream, "application/pdf");
            }
            catch (FormatException)
            {
                // Not valid base64 — return original for debugging (text/plain so it doesn't try to render JSON in iframe)
                return Content(results, "text/plain");
            }
        }

        public async Task<ApplicationDetailsViewModel> GetApplication(int applicationId)
        {
            var username = UserHelper.GetUsername(User);
            var userId = UserHelper.GetUserId(User);
            // Prepare holders

            var fundingCall = new FundingCallsModel();
            var projectsList = new List<ProjectsViewModel>();
            var applicationsProjects = new List<ApplicationsProjectsViewModel>();
            //var currentUserDetails = new ReadUserViewModelResource();
            var documentList = new List<UploadDocumentViewModel>();
            var applicationsSupportReq = new List<ApplicationSupportRequiredViewModel>();
            var applicationDetails = new ApplicationDetailsViewModel();

            // Fetch data via injected services (caller will wire the services to APIs)
            ApplicationDetailsViewModel results = null;
            results = await _ucdpService.GetApplicationById(applicationId);

            if (results != null)
            {
                fundingCall = await _ucdpService.GetFundingCallById(results.FundingCallDetailsId);
            }

            projectsList = await _projectService.GetProjects();
            //currentUserDetails = (await _applicationsService.GetTemporaryApproverApplications(Int32.Parse(userId))).FirstOrDefault();
            applicationsProjects = await _applicationsService.GetApplicationsProjects(applicationId);
            documentList = await _applicationsService.GetApplicationDocuments(applicationId);

            var temporaryAppointees = await _applicationsService.GetTemporaryAppointees(applicationId) ?? new List<TemporaryAppointeeViewModel>();

            var payments = await _applicationsService.GetPayments(applicationId) ?? new List<PaymentsViewModel>();


            applicationDetails.FundingCallDetails = fundingCall;
            applicationDetails.UserDetails = results?.UserDetails;

            if (results != null)
            {
                MapApplicationDetails(applicationDetails, results);

                applicationDetails.SelectedProjects = applicationsProjects;
                applicationDetails.SelectedSupportRequired = applicationsSupportReq;
                applicationDetails.UploadedDocs = documentList;
                applicationDetails.TemporaryAppointees = temporaryAppointees;
                applicationDetails.Payments = payments;

                applicationDetails.CurrentUserRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdp")?.Value;
                applicationDetails.LastModifierUsername = results.LastModifierUsername;
                applicationDetails.AccomChooseCheapest = results.AccomChooseCheapest;
                applicationDetails.AccomCheapestExplanation = results.AccomCheapestExplanation;
                applicationDetails.FlightsChooseCheapest = results.FlightsChooseCheapest;
                applicationDetails.FlightsCheapestExplanation = results.FlightsCheapestExplanation;
                applicationDetails.OtherFundingSource = results.OtherFundingSource;
                applicationDetails.CurrentApproverStaffNumber = results.CurrentApproverStaffNumber;

                applicationDetails.FundingCallDetails = fundingCall;
                applicationDetails.FundingCallDetailsId = fundingCall?.Id ?? results.FundingCallDetailsId;

                var ownerUserId = applicationDetails.UserDetails?.UserId ?? applicationDetails.UserId;

                List<ReadApplicationResource> readApplicationResource = await _ucdpService.GetMyPreviousApplications(ownerUserId);
                var fundedApps = readApplicationResource.Where(app => (app.ApplicationStartDate >= new DateTime(2026, 05, 01) && app.ApplicationStatus.ApplicationStatusId == 28) ||
                (app.ApplicationStartDate < new DateTime(2026, 05, 01) && (app.ApplicationStatus.ApplicationStatusId == 28 || app.ApplicationStatus.ApplicationStatusId == 8))).ToList();

                var previousFundedList = new List<PreviousFundingViewModel>();

                if (fundedApps.Any())
                {
                    var latestFundingDate = fundedApps.Max(app => app.FundingStartDate);

                    previousFundedList = fundedApps
                        .Where(app => app.FundingStartDate == latestFundingDate)
                        .Select(app => new PreviousFundingViewModel
                        {
                            ApplicationDetails = app
                        })
                        .Take(1)
                        .ToList();
                }

                applicationDetails.previousFundingViewModel = previousFundedList;
                applicationDetails.PreviousFundingOutcome = results.PreviousFundingOutcome;


                PopulateProject1DocumentModels(applicationDetails);
            }
            else
            {
                applicationDetails.SelectedProjects = new List<ApplicationsProjectsViewModel>();
                applicationDetails.SelectedSupportRequired = new List<ApplicationSupportRequiredViewModel>();
                applicationDetails.UploadedDocs = new List<UploadDocumentViewModel>();
                applicationDetails.TemporaryAppointees = new List<TemporaryAppointeeViewModel>();
                applicationDetails.Payments = new List<PaymentsViewModel>();
                applicationDetails.previousFundingViewModel = new List<PreviousFundingViewModel>();

            }

            return applicationDetails;

            // Local helper: safely format numeric string to two decimals using invariant culture and dot decimal separator.
            static string ConvertTwoDecimals(string input)
            {
                if (string.IsNullOrWhiteSpace(input))
                    return "0";

                // Remove spaces and try parse with invariant culture
                if (decimal.TryParse(input, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var v))
                    return v.ToString("N2", System.Globalization.CultureInfo.InvariantCulture).Replace(",", ".");
                // Try parse with current culture fallback
                if (decimal.TryParse(input, out var v2))
                    return v2.ToString("N2", System.Globalization.CultureInfo.InvariantCulture).Replace(",", ".");

                return input;
            }

        }

        private void MapApplicationDetails(ApplicationDetailsViewModel target, ApplicationDetailsViewModel source)
        {
            if (target == null || source == null)
                return;

            target.Id = source.Id;
            target.ApplicationStatusId = source.ApplicationStatusId;
            target.FundingStartDate = source.FundingStartDate;
            target.FundingEndDate = source.FundingEndDate;
            target.CostCentreName = source.CostCentreName;
            target.CostCentreNumber = source.CostCentreNumber;
            target.PreviousFundingYear = source.PreviousFundingYear;
            target.PreviousFundingAmount = string.IsNullOrEmpty(source.PreviousFundingAmount) ? "0" : source.PreviousFundingAmount.Replace(" ", "");
            target.PreviousFundingOutcome = source.PreviousFundingOutcome;
            target.ApplicantCategory = source.ApplicantCategory;
            target.AppointmentCategory = source.AppointmentCategory;
            target.LastSavedStep = source.LastSavedStep;
            target.FundingCallDetailsId = source.FundingCallDetailsId;
            target.UserId = source.UserId;
            target.FundingBudgetAvailable = source.FundingBudgetAvailable;

            target.StudyingTowards = source.StudyingTowards;
            target.FirstYearRegistration = source.FirstYearRegistration;
            target.PlannedGraduationYear = source.PlannedGraduationYear;
            target.FieldOfStudy = source.FieldOfStudy;
            target.TitleOfThesis = source.TitleOfThesis;
            target.Describe = source.Describe;
            target.AppointmentDescribe = source.AppointmentDescribe;

            target.SupportRequired = source.SupportRequired != null && source.SupportRequired.Length > 0 && !string.IsNullOrWhiteSpace(source.SupportRequired[0])
                ? source.SupportRequired[0].Split(',', StringSplitOptions.RemoveEmptyEntries) : Array.Empty<string>();

            target.supportRequiredItem = target.SupportRequired.FirstOrDefault() ?? "";

            target.AppointmentOption = source.AppointmentOption;
            target.appointmentItem = source.AppointmentOption != null && source.AppointmentOption.Length > 0 ? source.AppointmentOption[0] : "";

            target.FinancialSupport = source.FinancialSupport;
            target.financialSupportItem = source.FinancialSupport != null && source.FinancialSupport.Length > 0 ? source.FinancialSupport[0] : "";

            target.CareerFinancialSupport = source.CareerFinancialSupport;
            target.careerFinancialSupportItem = source.CareerFinancialSupport != null && source.CareerFinancialSupport.Length > 0 ? source.CareerFinancialSupport[0] : "";

            target.CareerTeachingRelief = source.CareerTeachingRelief;
            target.careerTeachingReliefItem = source.CareerTeachingRelief != null && source.CareerTeachingRelief.Length > 0 ? source.CareerTeachingRelief[0] : "";

            target.FinancialMotivation = source.FinancialMotivation;
            target.OtherFunding = string.IsNullOrEmpty(source.OtherFunding) ? "0" : source.OtherFunding.Replace(" ", "");
            target.FacultyContibution = string.IsNullOrEmpty(source.FacultyContibution) ? "0" : source.FacultyContibution.Replace(" ", "");
            target.DHETFundsRequested = string.IsNullOrEmpty(source.DHETFundsRequested) ? "0" : source.DHETFundsRequested.Replace(" ", "");
            target.ApplicantProgress = source.ApplicantProgress;
            target.OutputMeasure = source.OutputMeasure;
            target.DepartmentContribution = string.IsNullOrEmpty(source.DepartmentContribution) ? "0" : source.DepartmentContribution.Replace(" ", "");
            target.ResearchFundsContribution = string.IsNullOrEmpty(source.ResearchFundsContribution) ? "0" : source.ResearchFundsContribution.Replace(" ", "");
            target.TotalCost = string.IsNullOrEmpty(source.TotalCost) ? "0" : source.TotalCost.Replace(" ", "");
            target.OtherFundingSource = source.OtherFundingSource;
            target.AccomCheapestExplanation = source.AccomCheapestExplanation;
            target.AccomChooseCheapest = source.AccomChooseCheapest;
            target.FlightsCheapestExplanation = source.FlightsCheapestExplanation;
            target.FlightsChooseCheapest = source.FlightsChooseCheapest;
            target.AccomChooseCheapestModel.IsChecked = source.AccomChooseCheapest;
            target.FlightsChooseCheapestModel.IsChecked = source.FlightsChooseCheapest;
            target.AccomChooseCheapestModel.IsEditMode = UserHelper.DisableQuoteCheck(User, source.TemporaryApproverViewModel, source.CurrentApproverStaffNumber, source.ApplicationStatusId);
            target.FlightsChooseCheapestModel.IsEditMode = UserHelper.DisableQuoteCheck(User, source.TemporaryApproverViewModel, source.CurrentApproverStaffNumber, source.ApplicationStatusId);

            target.ApprovedAmount = string.IsNullOrEmpty(source.ApprovedAmount) ? "0" : source.ApprovedAmount;
            target.FundAdminApprovedAmount = string.IsNullOrEmpty(source.FundAdminApprovedAmount) ? "0" : source.FundAdminApprovedAmount;
            target.FundAdminComment = source.FundAdminComment;
            target.SIAComment = source.SIAComment;
            target.LastModifierUsername = source.LastModifierUsername;

            target.TemporaryApproverViewModel = source.TemporaryApproverViewModel;
        }

        private static string ConvertTwoDecimals(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "0";

            if (decimal.TryParse(input, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var v))
                return v.ToString("N2", System.Globalization.CultureInfo.InvariantCulture).Replace(",", ".");

            if (decimal.TryParse(input, out var v2))
                return v2.ToString("N2", System.Globalization.CultureInfo.InvariantCulture).Replace(",", ".");

            return input;
        }
        [HttpPost]
        public async Task<IActionResult> ApplicationCareerDevelopment(ApplicationDetailsViewModel details)
        {
            var apiUrl = $"{_appSettings.ResearchGateway}";

            details.LastSavedStep = ApplicationStepsEnum.CareerDevelopment.GetDescription();

            var postedDetails = new ApplicationDetailsViewModel();

            var paymentViewModel = new PaymentsViewModel();

            if (details.Id != 0)
            {

                postedDetails = await APICaller.AuthenticatedApiCallAsync<ApplicationDetailsViewModel, ApplicationDetailsViewModel>(apiUrl + "Applications/", HttpMethod.Post.ToString(), details);
            }

            if (details.Id != 0)
            {
                paymentViewModel = await APICaller.AuthenticatedApiCallAsync<string, PaymentsViewModel>(apiUrl + "Payments/UpdateCareerDevelopmentPayments/" + details.Id, HttpMethod.Get.ToString(), "");
            }


            if (postedDetails != null)
            {
                return Json(new { status = "Saved", message = postedDetails });
            }
            else
            {
                return Json(new { status = "Error", message = "Error Occurred while saving" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UploadCareerDevelopmentTeachingFiles()
        {
            var FileName = "";
            var files = Request.Form.Files;

            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            if (string.IsNullOrWhiteSpace(applicationId))
            {
                applicationId = Request.Form["Id"].FirstOrDefault();
            }

            if (string.IsNullOrWhiteSpace(applicationId))
            {
                return BadRequest("Application ID is missing.");
            }

            if (applicationId.Contains(","))
            {
                applicationId = applicationId.Split(",")[0];
            }

            if (!int.TryParse(applicationId, out var parsedApplicationId))
            {
                return BadRequest("Invalid Application ID.");
            }

            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();

            foreach (var file in files)
            {
                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {
                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.CareerDevelopmentTeaching.GetDescription();
                    UploadDocumentSession.ApplicationId = parsedApplicationId;
                }

                DocumentUlpoadSessionList.Add(UploadDocumentSession);
            }

            var apiUrl = $"{_appSettings.ResearchGateway}";
            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(
                    apiUrl + "Documents/PostDocuments",
                    HttpMethod.Post.ToString(),
                    DocumentUlpoadSessionList
                );
            }

            return Json(documentList);
        }

        [HttpPost]
        public async Task<IActionResult> UploadCareerDevelopmentWorkShopFiles()
        {
            var FileName = "";
            var files = Request.Form.Files;
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");


            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.CareerDevelopmentWorkshop.GetDescription();
                    UploadDocumentSession.ApplicationId = Convert.ToInt32(applicationId);
                }
                ;

                DocumentUlpoadSessionList.Add(UploadDocumentSession);

            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(apiUrl + "Documents/PostDocuments", HttpMethod.Post.ToString(), DocumentUlpoadSessionList);
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");
        }

        //[HttpGet]
        //public async Task<ActionResult> DeleteDocument(int documentId)
        //{
        //    string apiUrl = $"{_appSettings.ResearchGateway}";

        //    List<UploadDocumentViewModel> documentList = new List<UploadDocumentViewModel>();

        //    if (documentId != 0)
        //    {
        //        documentList = await APICaller.AuthenticatedApiCallAsync<string, List<UploadDocumentViewModel>>(apiUrl + "Documents/DeleteDocument/" + documentId, HttpMethod.Get.ToString(), "");
        //    }

        //    var results = JsonConvert.SerializeObject(documentList);

        //    return Content(results, "application/json");
        //}


        [HttpPost]
        public async Task<IActionResult> UploadCareerDevelopmentInviteFiles()
        {
            var FileName = "";
            var files = Request.Form.Files;
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.CareerDevelopmentInvite.GetDescription();
                    UploadDocumentSession.ApplicationId = Convert.ToInt32(applicationId);
                }
                ;

                DocumentUlpoadSessionList.Add(UploadDocumentSession);

            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(apiUrl + "Documents/PostDocuments", HttpMethod.Post.ToString(), DocumentUlpoadSessionList);
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");


        }

        [HttpPost]
        public async Task<IActionResult> UploadImprovingStaffResearchOtherCostsDoc()
        {
            var FileName = "";
            var files = Request.Form.Files;
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.ResearchCareerOtherCosts.GetDescription();
                    UploadDocumentSession.ApplicationId = Convert.ToInt32(applicationId);
                }
                ;

                DocumentUlpoadSessionList.Add(UploadDocumentSession);

            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(apiUrl + "Documents/PostDocuments", HttpMethod.Post.ToString(), DocumentUlpoadSessionList);
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> UploadImprovingStaffResearchTotalCostBreakdownDoc()
        {
            var FileName = "";
            var files = Request.Form.Files;
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.ResearchCareerTotalCostBreakdown.GetDescription();
                    UploadDocumentSession.ApplicationId = Convert.ToInt32(applicationId);
                }
                ;

                DocumentUlpoadSessionList.Add(UploadDocumentSession);

            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(apiUrl + "Documents/PostDocuments", HttpMethod.Post.ToString(), DocumentUlpoadSessionList);
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> AddPayment([FromBody] PaymentsViewModel payment)
        {
            if (payment == null)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Payment details are required."
                });
            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var paymentList = new List<PaymentsViewModel>
            {
                new PaymentsViewModel
                {
                    Id = payment.Id,
                    Type = payment.Type,
                    HoursPerWeek = payment.HoursPerWeek,
                    TotalNumberOfHours = payment.TotalNumberOfHours,
                    MonthTotal = payment.MonthTotal,
                    StartDate = payment.StartDate,
                    EndDate = payment.EndDate,
                    NumberOfWeeks = payment.NumberOfWeeks,
                    RatePerHour = payment.RatePerHour,
                    ApplicationsId = payment.ApplicationsId,
                    Step = payment.Step
                }
            };

            var apiResult = await APICaller.AuthenticatedApiCallAsync<List<PaymentsViewModel>, List<PaymentsViewModel>>(apiUrl + "Payments/", HttpMethod.Post.ToString(), paymentList);

            if (apiResult == null)
            {
                return Json(new
                {
                    status = "error",
                    message = "Payment could not be saved. The API returned no result.",
                    results = new List<PaymentsViewModel>()
                });
            }

            return Json(new
            {
                status = "success",
                message = "Payment Added Successfully",
                results = apiResult.DistinctBy(x => x.Id).ToList()
            });
        }

        [HttpGet]
        public async Task<ActionResult> RemovePayment(int id)
        {
            var apiUrl = $"{_appSettings.ResearchGateway}";

            var apiResponse = string.Empty;
            using (var httpClient = new HttpClient())
            {
                if (id != 0)
                {
                    apiResponse = await APICaller.AuthenticatedApiCallAsync<string, string>(apiUrl + "Payments/DeletePayment/" + id, HttpMethod.Get.ToString(), "");
                }
            }

            return Ok(apiResponse);

        }

        [HttpPost]
        public async Task<IActionResult> UploadCareerDevelopmentAccommodationFiles()
        {
            var FileName = "";
            var files = Request.Form.Files;
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.ResearchCareerAccommodation.GetDescription();
                    UploadDocumentSession.ApplicationId = Convert.ToInt32(applicationId);
                }
                ;

                DocumentUlpoadSessionList.Add(UploadDocumentSession);

            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(apiUrl + "Documents/PostDocuments", HttpMethod.Post.ToString(), DocumentUlpoadSessionList);
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");


        }

        [HttpPost]
        public async Task<IActionResult> UploadImprovingStaffResearchFlights()
        {
            var FileName = "";
            var files = Request.Form.Files;
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            var DocumentUlpoadSessionList = new List<UploadDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new UploadDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    FileName = Path.GetFileName(file.Name);
                    UploadDocumentSession.UploadType = UploadTypeEnum.ResearchCareerFlights.GetDescription();
                    UploadDocumentSession.ApplicationId = Convert.ToInt32(applicationId);
                }
                ;

                DocumentUlpoadSessionList.Add(UploadDocumentSession);

            }

            var apiUrl = $"{_appSettings.ResearchGateway}";

            var documentList = new List<UploadDocumentViewModel>();

            if (DocumentUlpoadSessionList.Count > 0)
            {
                documentList = await APICaller.AuthenticatedApiCallAsync<List<UploadDocumentViewModel>, List<UploadDocumentViewModel>>(apiUrl + "Documents/PostDocuments", HttpMethod.Post.ToString(), DocumentUlpoadSessionList);
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");
        }

        [HttpGet]
        public async Task<IActionResult> GetCareerDevelopmentPayments(int applicationId)
        {
            string apiUrl = $"{_appSettings.ResearchGateway}";

            List<PaymentsViewModel> paymentsList = new List<PaymentsViewModel>();

            using (var httpClient = new HttpClient())
            {
                if (applicationId != 0)
                {
                    paymentsList = await APICaller.AuthenticatedApiCallAsync<string, List<PaymentsViewModel>>(apiUrl + "Payments/GetCareerDevelopmentPayments/" + applicationId, HttpMethod.Get.ToString(), "");
                }
            }

            var results = JsonConvert.SerializeObject(paymentsList);

            return Content(results, "application/json");
        }

        public async Task<IActionResult> GetDocs(int applicationId)
        {
            string apiUrl = $"{_appSettings.ResearchGateway}";

            List<UploadDocumentViewModel> documentList = new List<UploadDocumentViewModel>();

            using (var httpClient = new HttpClient())
            {
                if (applicationId != 0)
                {
                    documentList = await APICaller.AuthenticatedApiCallAsync<string, List<UploadDocumentViewModel>>(apiUrl + "Documents/" + applicationId, HttpMethod.Get.ToString(), "");
                }
            }

            var results = JsonConvert.SerializeObject(documentList);

            return Content(results, "application/json");
        }
        [Microsoft.AspNetCore.Mvc.HttpPost]
        public async Task<IActionResult> GetCostCentreDetails(string costCentre)
        {
            try
            {
                var results = await _ucdpService.GetCostCentreDetailsV2(costCentre);

                if (results == null || !results.Any())
                {
                    return Json(new { status = "Invalid", statusMsg = "Cost centre number not found" });
                }

                var costDetails = results.First();

                string costCentreDetails = JsonConvert.SerializeObject(costDetails);
                return Content(costCentreDetails, "application/json");
            }
            catch (Exception msg)
            {
                ViewBag.Message = msg.Message.ToString();
                return View(ViewBag.Message);
            }
        }



        [HttpPost]
        public async Task<IActionResult> UploadMotivationLetter(int fundingCallId)
        {
            var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);
            int? userId = currentUser?.UserId;

            var files = Request.Form.Files;
            var uploadList = new List<MotivationLetterReadModel>();

            foreach (var file in files)
            {
                using (var reader = new BinaryReader(file.OpenReadStream()))
                {
                    var uploadItem = new MotivationLetterReadModel
                    {
                        Filename = Path.GetFileName(file.FileName),
                        DocumentFile = reader.ReadBytes((int)file.Length),
                        DocumentExtention = Path.GetExtension(file.FileName),
                        UploadType = UploadTypeEnum.MotivationLetter.GetDescription(),
                        // ApplicationId = applicationId,
                        FundingCallId = fundingCallId,
                        UserId = userId
                    };

                    uploadList.Add(uploadItem);
                }
            }

            if (uploadList.Count == 0)
                return Content(JsonConvert.SerializeObject(new List<MotivationLetterResponse>()), "application/json");

            var documentList = await _ucdpService.CreateLinkUserMotivationLetter(uploadList);
            var firstDoc = documentList.FirstOrDefault();

            return Content(JsonConvert.SerializeObject(firstDoc), "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> UploadMotivationLetterByApplicationId(int applicationId)
        {
            var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);
            int? userId = currentUser?.UserId;

            var files = Request.Form.Files;
            var uploadList = new List<MotivationLetterReadModel>();

            var application = await _ucdpService.GetApplicationById(applicationId);

            foreach (var file in files)
            {
                using (var reader = new BinaryReader(file.OpenReadStream()))
                {
                    var uploadItem = new MotivationLetterReadModel
                    {
                        Filename = Path.GetFileName(file.FileName),
                        DocumentFile = reader.ReadBytes((int)file.Length),
                        DocumentExtention = Path.GetExtension(file.FileName),
                        UploadType = UploadTypeEnum.MotivationLetter.GetDescription(),
                        FundingCallId = application.FundingCallDetailsId,
                        ApplicationId = application.Id,
                        UserId = application.UserId
                    };
                    uploadList.Add(uploadItem);
                }
            }

            if (uploadList.Count == 0)
                return Content(JsonConvert.SerializeObject(new List<MotivationLetterResponse>()), "application/json");

            var documentList = await _ucdpService.CreateLinkUserMotivationLetter(uploadList);
            var firstDoc = documentList.FirstOrDefault();

            return Content(JsonConvert.SerializeObject(firstDoc), "application/json");
        }

        [Microsoft.AspNetCore.Mvc.HttpGet]
        public async Task<IActionResult> GetMotivationLetterByUserId(int userId)
        {

            var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);

            var tempDocument = await _ucdpService.GetLinkUserMotivationLetter(currentUser.UserId, 0);


            var results = JsonConvert.SerializeObject(tempDocument);

            return Content(results, "application/json");
        }


        [HttpPost]
        public async Task<IActionResult> ApplicationDetails([FromForm] ApplicationDetailsViewModel details)
        {
            try
            {
                var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);

                if (currentUser == null)
                {
                    return Json(new
                    {
                        status = "Not Saved",
                        message = "Current user session could not be found."
                    });
                }

                if (!string.IsNullOrWhiteSpace(details.PreviousFundingAmount))
                {
                    details.PreviousFundingAmount = details.PreviousFundingAmount.Replace("R", "").Trim();
                }

                if (!DateTime.TryParseExact(details.FundingStartDateValue, "dd MMM yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dtStartDateFunding))
                {
                    return Json(new
                    {
                        status = "Not Saved",
                        message = "Funding start date is invalid."
                    });
                }

                if (!DateTime.TryParseExact(details.FundingEndDateValue, "dd MMM yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dtEndDateFunding))
                {
                    return Json(new
                    {
                        status = "Not Saved",
                        message = "Funding end date is invalid."
                    });
                }

                details.StartDate = DateTime.Now;
                details.LastSavedStep = ApplicationStepsEnum.ApplicantDetails.GetDescription();
                details.ApplicationStatusId = 1;
                details.FundingStartDate = dtStartDateFunding;
                details.FundingEndDate = dtEndDateFunding;

                var saveApplicantDetails = await _ucdpService.ApplicationDetails(details, currentUser);

                if (saveApplicantDetails == null)
                {
                    return Json(new
                    {
                        status = "Not Saved",
                        message = "Application details could not be saved."
                    });
                }

                HttpContext.Session.SetObjectAsJson("CurrentApplicationId", saveApplicantDetails.Id);

                return Json(new
                {
                    applicationId = saveApplicantDetails.Id,
                    status = "Saved",
                    message = saveApplicantDetails
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "Not Saved",
                    message = ex.Message
                });
            }
        }



        [HttpGet]
        public async Task<IActionResult> ViewMotivationLetterById(int documentId)
        {
            var document = await _ucdpService.ViewMotivationLetterById(documentId);

            if (document == null || document.DocumentFile == null || document.DocumentFile.Length == 0)
                return NotFound("Document not found.");

            var fileName = string.IsNullOrWhiteSpace(document.Filename)
                ? "MotivationLetter.pdf"
                : document.Filename;

            Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";

            return File(document.DocumentFile, "application/pdf");
        }


        [Microsoft.AspNetCore.Mvc.HttpPost]
        public async Task<IActionResult> DeleteMotivationLetter(int documentId)
        {
            var tempDocument = await _ucdpService.DeleteMotivationLetter(documentId);

            var results = JsonConvert.SerializeObject(tempDocument);

            return Content(results, "application/json");
        }

        [HttpPost]
        public async Task<IActionResult> ApplicationImprovementStaffQualifications(ApplicationDetailsViewModel details)
        {
            if (string.IsNullOrWhiteSpace(details.StudyingTowards))
                return Json(new { status = "Error", message = "Studying towards is required." });

            if (string.IsNullOrWhiteSpace(details.FieldOfStudy))
                return Json(new { status = "Error", message = "Field of study is required." });

            if (string.IsNullOrWhiteSpace(details.FirstYearRegistration))
                return Json(new { status = "Error", message = "Year of 1st registration is required." });

            if (string.IsNullOrWhiteSpace(details.PlannedGraduationYear))
                return Json(new { status = "Error", message = "Planned graduation year is required." });

            if (string.IsNullOrWhiteSpace(details.Describe))
                return Json(new { status = "Error", message = "Description of your research or qualification is required." });

            if (details.SupportRequired == null || !details.SupportRequired.Any())
                return Json(new { status = "Error", message = "Select at least one support requirement." });

            details.LastSavedStep = ApplicationStepsEnum.CareerDevelopment.GetDescription();

            ApplicationDetailsViewModel postedDetails = null;
            var appointees = new List<TemporaryAppointeeViewModel>();
            var payments = new List<PaymentsViewModel>();

            if (details.Id != 0)
            {
                postedDetails = await _applicationsService.SaveImprovementStaffQualifications(details);

                if (postedDetails != null && postedDetails.Id > 0)
                {
                    // await _applicationsService.UpdateTemporaryAppointee(postedDetails.Id);
                    // await _applicationsService.UpdateImprovementOfStaffQualificationsPayments(postedDetails.Id);

                    appointees = await _applicationsService.GetTemporaryAppointees(postedDetails.Id);
                    payments = await _applicationsService.GetPayments(postedDetails.Id);
                }
            }

            if (postedDetails != null)
            {
                return Json(new
                {
                    status = "Saved",
                    message = postedDetails,
                    appointees = appointees,
                    payments = payments
                });
            }

            return Json(new { status = "Error", message = "Error occurred while saving" });
        }

        private int GetCurrentApplicationIdFromSession()
        {
            var applicationId = HttpContext.Session.GetString("CurrentApplicationId");

            if (string.IsNullOrWhiteSpace(applicationId))
                return 0;

            if (applicationId.Contains(","))
            {
                applicationId = applicationId.Split(",")[0];
            }

            return int.TryParse(applicationId, out var parsedId) ? parsedId : 0;
        }

        private async Task<IActionResult> UploadDocumentsByType(string uploadType)
        {
            var files = Request.Form.Files;

            var applicationId = GetCurrentApplicationIdFromSession();

            if (applicationId <= 0 && int.TryParse(Request.Form["Id"], out var postedId))
            {
                applicationId = postedId;
            }

            if (applicationId <= 0)
                return BadRequest("Application id not found.");

            if (files == null || files.Count == 0)
                return BadRequest("No files were uploaded.");

            var documentUploadList = new List<UploadDocumentViewModel>();

            foreach (var file in files)
            {
                await using var stream = file.OpenReadStream();
                using var memoryStream = new MemoryStream();
                await stream.CopyToAsync(memoryStream);

                documentUploadList.Add(new UploadDocumentViewModel
                {
                    Filename = Path.GetFileName(file.FileName),
                    DocumentFile = memoryStream.ToArray(),
                    DocumentExtention = Path.GetExtension(file.FileName),
                    UploadType = uploadType,
                    ApplicationId = applicationId
                });
            }

            var documentList = await _applicationsService.UploadDocuments(documentUploadList);

            return Json(documentList);
        }

        [HttpPost]
        public async Task<IActionResult> UploadImprovementStaffProofOfRegistrationFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.ProofOfReg.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadImprovementStaffSupervisorLetterFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.SupervisorLetter.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadImprovementStaffCostBreakdownFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.TotalCostBreakdown.GetDescription());
        }
        [HttpPost]
        public async Task<IActionResult> UploadProject1TeachingReliefFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.ReliefDocuments.GetDescription());
        }
        [HttpPost]
        public async Task<IActionResult> UploadProject1ResearchAssistanceFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.ResearchAssistance.GetDescription());
        }
        [HttpPost]
        public async Task<IActionResult> UploadListofProject1FinancialSupportFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.FinancialSupport.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadProject5ProofOfInvitationFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.MobilityProgrammes.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadProject5AccommodationFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.MobilityProgrammesAccommodation.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadProject5FlightsFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.MobilityProgrammesFlight.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadProject5OtherCostsFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.MobilityProgrammesOtherCosts.GetDescription());
        }

        [HttpPost]
        public async Task<IActionResult> UploadProject5TotalCostBreakdownFiles()
        {
            return await UploadDocumentsByType(UploadTypeEnum.MobilityProgrammesTotalCostBrakedown.GetDescription());
        }

        private DocumentUploadSectionViewModel BuildDocumentUploadModel(string sectionId, string labelText, string inputId, string inputName, string uploadButtonId,
            string tableId, string uploadUrl, bool isRequired, string uploadType, bool isHidden = false, bool isMultiple = false, int maxFiles = 1, string acceptedFileTypes = ".pdf",
            string? tooltip = null, List<UploadDocumentViewModel>? existingDocuments = null)
        {
            return new DocumentUploadSectionViewModel
            {
                SectionId = sectionId,
                LabelText = labelText,
                InputId = inputId,
                InputName = inputName,
                UploadButtonId = uploadButtonId,
                TableId = tableId,
                UploadUrl = uploadUrl,
                Tooltip = tooltip,
                IsRequired = isRequired,
                IsHidden = isHidden,
                IsMultiple = isMultiple,
                MaxFiles = maxFiles,
                AcceptedFileTypes = acceptedFileTypes,
                ExistingDocuments = existingDocuments ?? new List<UploadDocumentViewModel>(),
                UploadType = uploadType
            };
        }

        private void PopulateProject1DocumentModels(ApplicationDetailsViewModel applicationDetails)
        {
            var uploadedDocs = applicationDetails.UploadedDocs ?? new List<UploadDocumentViewModel>();

            applicationDetails.Project1ProofOfRegistrationUpload = BuildDocumentUploadModel(
                sectionId: "Project1ProofOfRegistrationSection",
                labelText: "Proof of Registration",
                inputId: "Project1ProofOfRegistrationDoc",
                inputName: "Project1ProofOfRegistrationDoc",
                uploadButtonId: "Project1ProofOfRegistrationDocBtn",
                tableId: "ListofProject1ProofOfRegistrationFiles",
                uploadUrl: Url.Action("UploadImprovementStaffProofOfRegistrationFiles", "Applications"),

                isRequired: true,
                tooltip: "Upload proof of registration in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.ProofOfReg.GetDescription())
                    .ToList(),
                 uploadType: UploadTypeEnum.ProofOfReg.GetDescription()
            );

            applicationDetails.Project1SupervisorLetterUpload = BuildDocumentUploadModel(
                sectionId: "Project1SupervisorLetterSection",
                labelText: "Supervisor Letter",
                inputId: "Project1SupervisorLetterDoc",
                inputName: "Project1SupervisorLetterDoc",
                uploadButtonId: "Project1SupervisorLetterDocBtn",
                tableId: "ListofProject1SupervisorLetterFiles",
                uploadUrl: Url.Action("UploadImprovementStaffSupervisorLetterFiles", "Applications"),

                isRequired: true,
                tooltip: "Upload the supervisor support letter in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.SupervisorLetter.GetDescription())
                    .ToList(),
                uploadType: UploadTypeEnum.SupervisorLetter.GetDescription()
            );

            applicationDetails.Project1CostBreakdownUpload = BuildDocumentUploadModel(
                sectionId: "Project1CostBreakdownSection",
                labelText: "Cost Breakdown",
                inputId: "Project1CostBreakdownDoc",
                inputName: "Project1CostBreakdownDoc",
                uploadButtonId: "Project1CostBreakdownDocBtn",
                tableId: "ListofProject1CostBreakdownFiles",
                uploadUrl: Url.Action("UploadImprovementStaffCostBreakdownFiles", "Applications")
                           ?? "/Applications/UploadImprovementStaffCostBreakdownFiles",
                isRequired: true,
                tooltip: "Download the standard template, complete it, and upload the finished cost breakdown.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.TotalCostBreakdown.GetDescription())
                    .ToList(),
                uploadType: UploadTypeEnum.TotalCostBreakdown.GetDescription()
            );

            applicationDetails.Project1TeachingReliefUpload = BuildDocumentUploadModel(
                sectionId: "Project1TeachingReliefSection",
                labelText: "Teaching Relief",
                inputId: "Project1TeachingReliefDoc",
                inputName: "Project1TeachingReliefDoc",
                uploadButtonId: "Project1TeachingReliefDocBtn",
                tableId: "ListofProject1TeachingReliefFiles",
                uploadUrl: Url.Action("UploadProject1TeachingReliefFiles", "Applications")
                           ?? "/Applications/UploadProject1TeachingReliefFiles",
                isRequired: true,
                maxFiles: 10,
                tooltip: "Upload the teaching relief in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.ReliefDocuments.GetDescription())
                    .ToList(),
                uploadType: UploadTypeEnum.ReliefDocuments.GetDescription()
            );

            applicationDetails.Project1ResearchAssistanceUpload = BuildDocumentUploadModel(
                sectionId: "Project1ResearchAssistanceSection",
                labelText: "Research Assistance",
                inputId: "Project1ResearchAssistanceDoc",
                inputName: "Project1ResearchAssistanceDoc",
                uploadButtonId: "Project1ResearchAssistanceDocBtn",
                tableId: "ListofProject1ResearchAssistanceFiles",
                uploadUrl: Url.Action("UploadProject1ResearchAssistanceFiles", "Applications")
                           ?? "/Applications/UploadProject1ResearchAssistanceFiles",
                isRequired: true,
                tooltip: "Upload the research assistance in PDF format.",
                maxFiles: 5,
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.ResearchAssistance.GetDescription())
                    .ToList(),
                 uploadType: UploadTypeEnum.ResearchAssistance.GetDescription()
            );

            applicationDetails.Project1FinancialSupportUpload = BuildDocumentUploadModel(
                sectionId: "Project1FinancialSupportSection",
                labelText: "Financial Support",
                inputId: "Project1FinancialSupportDoc",
                inputName: "Project1FinancialSupportDoc",
                uploadButtonId: "Project1FinancialSupportDocBtn",
                tableId: "ListofProject1FinancialSupportFiles",
                uploadUrl: Url.Action("UploadListofProject1FinancialSupportFiles", "Applications")
                           ?? "/Applications/UploadListofProject1FinancialSupportFiles",
                isRequired: true,
                maxFiles: 10,
                tooltip: "Upload financial support in PDF format",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.FinancialSupport.GetDescription())
                    .ToList(),
                uploadType: UploadTypeEnum.FinancialSupport.GetDescription()
            );

            applicationDetails.Project5ProofOfInvitationUpload = BuildDocumentUploadModel(
               sectionId: "Project5ProofOfInvitationSection",
               labelText: "Proof of Invitation",
               inputId: "Project5ProofOfInvitationDoc",
               inputName: "Project5ProofOfInvitationDoc",
               uploadButtonId: "Project5ProofOfInvitationDocBtn",
               tableId: "ListofProject5ProofOfInvitationFiles",
               uploadUrl: Url.Action("UploadProject5ProofOfInvitationFiles", "Applications")
                          ?? "/Applications/UploadProject5ProofOfInvitationFiles",
               isRequired: true,
               isMultiple: false,
               maxFiles: 1,
               tooltip: "Upload proof of invitation in PDF format.",
               existingDocuments: uploadedDocs
                .Where(x => x.UploadType == UploadTypeEnum.MobilityProgrammes.GetDescription())
                .ToList(),
               uploadType: UploadTypeEnum.MobilityProgrammes.GetDescription()
            );

            applicationDetails.Project5AccommodationUpload = BuildDocumentUploadModel(
                sectionId: "Project5AccommodationSection",
                labelText: "Accommodation",
                inputId: "Project5AccommodationDoc",
                inputName: "Project5AccommodationDoc",
                uploadButtonId: "Project5AccommodationDocBtn",
                tableId: "ListofProject5AccommodationFiles",
                uploadUrl: Url.Action("UploadProject5AccommodationFiles", "Applications")
                           ?? "/Applications/UploadProject5AccommodationFiles",
                isRequired: false,
                isMultiple: true,
                maxFiles: 3,
                tooltip: "Upload accommodation documents in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.MobilityProgrammesAccommodation.GetDescription())
                    .ToList(),
                 uploadType: UploadTypeEnum.MobilityProgrammesAccommodation.GetDescription()
            );

            applicationDetails.Project5FlightsUpload = BuildDocumentUploadModel(
                sectionId: "Project5FlightsSection",
                labelText: "Flights",
                inputId: "Project5FlightsDoc",
                inputName: "Project5FlightsDoc",
                uploadButtonId: "Project5FlightsDocBtn",
                tableId: "ListofProject5FlightsFiles",
                uploadUrl: Url.Action("UploadProject5FlightsFiles", "Applications")
                           ?? "/Applications/UploadProject5FlightsFiles",
                isRequired: false,
                isMultiple: true,
                maxFiles: 3,
                tooltip: "Upload flight documents in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.MobilityProgrammesFlight.GetDescription())
                    .ToList(),
                uploadType: UploadTypeEnum.MobilityProgrammesFlight.GetDescription()
            );

            applicationDetails.Project5OtherCostsUpload = BuildDocumentUploadModel(
                sectionId: "Project5OtherCostsSection",
                labelText: "Other Costs",
                inputId: "Project5OtherCostsDoc",
                inputName: "Project5OtherCostsDoc",
                uploadButtonId: "Project5OtherCostsDocBtn",
                tableId: "ListofProject5OtherCostsFiles",
                uploadUrl: Url.Action("UploadProject5OtherCostsFiles", "Applications")
                           ?? "/Applications/UploadProject5OtherCostsFiles",
                isRequired: false,
                isMultiple: false,
                maxFiles: 1,
                tooltip: "Upload other cost document in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.MobilityProgrammesOtherCosts.GetDescription())
                    .ToList(),
                uploadType: UploadTypeEnum.MobilityProgrammesOtherCosts.GetDescription()
            );

            applicationDetails.Project5TotalCostBreakdownUpload = BuildDocumentUploadModel(
                sectionId: "Project5TotalCostBreakdownSection",
                labelText: "Total Cost Breakdown",
                inputId: "Project5TotalCostBreakdownDoc",
                inputName: "Project5TotalCostBreakdownDoc",
                uploadButtonId: "Project5TotalCostBreakdownDocBtn",
                tableId: "ListofProject5TotalCostBreakdownFiles",
                uploadUrl: Url.Action("UploadProject5TotalCostBreakdownFiles", "Applications")
                           ?? "/Applications/UploadProject5TotalCostBreakdownFiles",
                isRequired: true,
                isMultiple: false,
                maxFiles: 1,
                tooltip: "Upload total cost breakdown in PDF format.",
                existingDocuments: uploadedDocs
                    .Where(x => x.UploadType == UploadTypeEnum.MobilityProgrammesTotalCostBrakedown.GetDescription())
                    .ToList(),
                 uploadType: UploadTypeEnum.MobilityProgrammesTotalCostBrakedown.GetDescription()
            );

        }

        [HttpPost]
        public async Task<IActionResult> ApproveProjects(ApplicationDetailsViewModel details)
        {
            var apiUrl = $"{_appSettings.ResearchGateway}";

            var myStringList = new List<string>();
            foreach (string s in details.ProjectId)
            {
                var projectList = s.Split(",");
                foreach (string prj in projectList)
                {
                    if (!myStringList.Contains(prj))
                    {
                        myStringList.Add(prj);
                    }
                }
            }

            details.ProjectId = myStringList.ToArray();

            var postedDetails = new ApplicationDetailsViewModel();

            details.LastSavedStep = ApplicationStepsEnum.ApproveProjects.GetDescription();

            postedDetails = await APICaller.AuthenticatedApiCallAsync<ApplicationDetailsViewModel, ApplicationDetailsViewModel>(apiUrl + "Applications/", HttpMethod.Post.ToString(), details);

            if (postedDetails != null)
            {
                return Json(new { status = "Saved", message = postedDetails });
            }
            else
            {
                return Json(new { status = "Error", message = "Error Occurred while saving" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetTemporaryAppointees(int applicationsId)
        {
            if (applicationsId <= 0)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Invalid application id."
                });
            }

            var items = await _applicationsService.GetTemporaryAppointees(applicationsId);

            return Json(new
            {
                status = "Success",
                message = items ?? new List<TemporaryAppointeeViewModel>()
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetPayments(int applicationsId)
        {
            if (applicationsId <= 0)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Invalid application id."
                });
            }

            var items = await _applicationsService.GetPayments(applicationsId);

            return Json(new
            {
                status = "Success",
                message = items ?? new List<PaymentsViewModel>()
            });

        }
        [HttpGet]
        public async Task<IActionResult> DeleteTemporaryAppointee(int temporaryAppointeeId, int applicationsId)
        {
            if (temporaryAppointeeId <= 0)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Invalid temporary appointee id."
                });
            }

            var deleted = await _applicationsService.DeleteTemporaryAppointee(temporaryAppointeeId);

            if (!deleted)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Could not delete temporary appointee."
                });
            }

            var items = applicationsId > 0 ? await _applicationsService.GetTemporaryAppointees(applicationsId) : new List<TemporaryAppointeeViewModel>();

            return Json(new
            {
                status = "Success",
                message = "Temporary appointee deleted successfully.",
                data = items
            });
        }
        [HttpGet]
        public async Task<IActionResult> DeletePayment(int paymentId, int applicationsId)
        {
            if (paymentId <= 0)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Invalid payment id."
                });
            }

            var deleted = await _applicationsService.DeletePayment(paymentId);

            if (!deleted)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Could not delete payment."
                });
            }

            var items = applicationsId > 0 ? await _applicationsService.GetPayments(applicationsId) : new List<PaymentsViewModel>();

            return Json(new
            {
                status = "Success",
                message = "Payment deleted successfully.",
                data = items
            });
        }
        [HttpPost]
        public async Task<IActionResult> UpdateTemporaryAppointee([FromForm] TemporaryAppointeeViewModel model)
        {
            if (model == null || model.ApplicationsId <= 0)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Invalid application id."
                });
            }

            var saved = await _applicationsService.SaveStaffImprovementTemporaryAppointee(model);

            if (saved == null)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Could not save temporary appointee.",
                    data = new List<TemporaryAppointeeViewModel>()
                });
            }

            var items = await _applicationsService.GetTemporaryAppointees(model.ApplicationsId);

            return Json(new
            {
                status = "Success",
                message = model.Id > 0
                    ? "Temporary appointee updated successfully."
                    : "Temporary appointee added successfully.",
                data = items ?? new List<TemporaryAppointeeViewModel>()
            });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateImprovementOfStaffQualificationsPayments([FromBody] PaymentsViewModel model)
        {
            if (model == null || model.ApplicationsId <= 0)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Invalid application id."
                });
            }

            var saved = await _applicationsService.SaveImprovementOfStaffQualificationsPayment(model);

            if (saved == null)
            {
                return Json(new
                {
                    status = "Error",
                    message = "Could not save payment.",
                    data = new List<PaymentsViewModel>()
                });
            }

            var items = await _applicationsService.GetPayments(model.ApplicationsId);

            return Json(new
            {
                status = "Success",
                message = model.Id > 0
                    ? "Payment updated successfully."
                    : "Payment added successfully.",
                data = items ?? new List<PaymentsViewModel>()
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetStaffByIdNumber(string idNumber)
        {
            if (string.IsNullOrWhiteSpace(idNumber))
            {
                return Json(new
                {
                    status = "Invalid",
                    message = "ID or passport number is required."
                });
            }

            var result = await _applicationsService.GetStaffByIdNumber(idNumber.Trim());

            if (result == null)
            {
                return Json(new
                {
                    status = "Invalid",
                    message = "Could not verify staff status."
                });
            }

            var hasStaffNumber = !string.IsNullOrWhiteSpace(result.StaffNumber);
            var staffStatus = hasStaffNumber ? "UJ Staff" : "Non-UJ Staff";

            return Json(new
            {
                status = hasStaffNumber ? "Valid" : "Invalid",
                message = hasStaffNumber ? "Staff member found." : "No matching staff member found.",
                staffStatus = staffStatus,
                data = result
            });
        }

        public FileResult GetTraffifPlan()
        {
            try
            {

                string filePath = string.Format("{0}\\wwwroot\\file\\Tariff Plan.pdf", Environment.CurrentDirectory);

                byte[] FileBytes = System.IO.File.ReadAllBytes(filePath);

                return File(FileBytes, "application/pdf");
            }
            catch (Exception msg)
            {
                //_logger.Log(LogLevel.Error, msg.Message.ToString());
                return null;
            }
        }
    }
}
