
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using NReco.PdfGenerator;
using ResearchSuite.Dtos.UCDP;
using ResearchSuite.Helpers;
using ResearchSuite.Helpers.Ucdp;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Models.UCDP.Enums;
using ResearchSuite.Services.Interfaces;
using ResearchSuite.Services.Ucdp;
using System;

namespace ResearchSuite.Controllers.UCDPControllers
{
    public class AdministrationController(ICompositeViewEngine viewEngine, IAdministrationService administrationService, IUcdpService ucdpService) : Controller
    {
        private readonly IAdministrationService _administrationService = administrationService;
        private readonly ICompositeViewEngine _viewEngine = viewEngine;
        private readonly IUcdpService _ucdpService = ucdpService;

        [HttpGet]
        public IActionResult Tariffs()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tariff-plan.pdf");
            string fileUrl = "";
            if (!System.IO.File.Exists(filePath))
            {
                // No file found, return empty result
                return Json(new { fileUrl = "" });
            }
            else {
                var fileInfo = new System.IO.FileInfo(filePath);
                fileUrl = Url.Content($"~/uploads/tariff-plan.pdf?v={fileInfo.LastWriteTimeUtc.Ticks}");
            }

            var model = new DocumentUploadViewModel
            {
                LabelText = "Tariffs paper.pdf",
                InputName = "Tariffs",
                InputId = "Tariffs",
                DocName = "Tariff Plan.pdf",
                DocUrl = fileUrl
            };
            return View("~/Views/UCDP/Administration/Tariffs.cshtml", model);
        }

        [HttpPost]
        public async Task<IActionResult> UploadTariffPlan(IFormFile tariffPlanFile)
        {
            if (tariffPlanFile == null)
                return Json(new { status = "error", message = "No file selected." });

            if (tariffPlanFile.ContentType != "application/pdf" || !tariffPlanFile.FileName.ToLower().EndsWith(".pdf"))
                return Json(new { status = "error", message = "Only PDF files are allowed." });

            if (tariffPlanFile.Length > 5 * 1024 * 1024)
                return Json(new { status = "error", message = "File exceeds 5 MB." });

            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadDir))
                Directory.CreateDirectory(uploadDir);

            // Always overwrite with a unique name, but show as "Tariff Plan.pdf"
            var uniqueFileName = "tariff-plan.pdf";
            var filePath = Path.Combine(uploadDir, uniqueFileName);

            // Remove any existing files
            foreach (var file in Directory.GetFiles(uploadDir, "*.pdf"))
                System.IO.File.Delete(file);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await tariffPlanFile.CopyToAsync(stream);
            }

            Thread.Sleep(5000);

            return Json(new { status = "ok" });
        }

        [HttpGet]
        public IActionResult Reports()
        {
            return View("~/Views/UCDP/Administration/Reports.cshtml");
        }

        [HttpGet]
        public async Task<IActionResult> GetPendingReports()
        {
            var reports = await _administrationService.GetProgressReportPending();
            return Json(reports);
        }

        [HttpGet]
        public async Task<IActionResult> GetRFIProgressReport()
        {
            var reports = await _administrationService.GetProgressReportSubmitted();
            return Json(reports.Where(r => r.Status == "RFI"));
        }

        [HttpGet]
        public async Task<IActionResult> GetSubmittedProgressReport()
        {
            var reports = await _administrationService.GetProgressReportSubmitted();
            return Json(reports.Where(r => r.Status == "New" && r.IsComplete == true));
        }

        [HttpGet]
        public async Task<IActionResult> GetFinalizedReport()
        {
            var reports = await _administrationService.GetProgressReportSubmitted();
            return Json(reports.Where(r => r.Status == "Finalized"));
        }

        [HttpGet]
        public async Task<IActionResult> GetCommentsByReportId(int reportId)
        {
            var comments = await _administrationService.GetCommentsByReportId(reportId);
            return Json(comments);
        }

        [HttpGet]
        public async Task<IActionResult> CreateReport([FromQuery] int fundingCallId)
        {
            var username = UserHelper.GetUsername(User);
            SearchApplicationViewDto searchViewDto = new SearchApplicationViewDto
            {
                FundingCallId = fundingCallId,
                Username = username,
            };

            var fundingCall = await _administrationService.GetFundingCall(fundingCallId);
            var completedApplications = await _administrationService.SearchCompleteApplications(searchViewDto);
            ProgressReportDetailsViewModel progressReportDetails = await _administrationService.GetProgressReportDetails(completedApplications.Id);

            if (progressReportDetails.Id == 0) {
                ProgressReportDetailsViewModel details = new ProgressReportDetailsViewModel();
                details.IsComplete = false;
                details.ApplicationId = Convert.ToInt32(completedApplications.Id);

                progressReportDetails = await _administrationService.AddProgressReport(details);
            }

            var applicationDetails = new ApplicationDetailsViewModel
            {
                FundingCallDetails = fundingCall,
                UserDetails = completedApplications.UserDetails,
                Id = completedApplications?.Id ?? 0,
                ApplicationStatusId = completedApplications.ApplicationStatusId,
                FundingStartDate = completedApplications.FundingStartDate,
                FundingEndDate = completedApplications.FundingEndDate,
                CostCentreName = completedApplications.CostCentreName,
                CostCentreNumber = completedApplications.CostCentreNumber,
                PreviousFundingYear = completedApplications.PreviousFundingYear,
                PreviousFundingAmount = completedApplications.PreviousFundingAmount,
                PreviousFundingOutcome = completedApplications.PreviousFundingOutcome,
                ApplicantCategory = completedApplications.ApplicantCategory,
                FundingCallDetailsId = completedApplications.FundingCallDetailsId,
                UserId = completedApplications.UserId,
                Username = username,
                ApprovedAmount = completedApplications.ApprovedAmount,
                FundAdminApprovedAmount = completedApplications.FundAdminApprovedAmount
            };

            PopulateReportDetails(progressReportDetails, applicationDetails, completedApplications);
            progressReportDetails.ApplicationDocuments = await _administrationService.GetProgressReportDocuments(applicationDetails.Id);
            progressReportDetails.MotivationalLetter = await _ucdpService.GetLinkUserMotivationLetter(progressReportDetails.UserId, fundingCallId);
            progressReportDetails.IsViewOnly = false;
            return View("~/Views/UCDP/Administration/Report.cshtml", progressReportDetails);
        }

        [HttpGet]
        public async Task<IActionResult> AdminViewReport([FromQuery] int applicationId, [FromQuery] int fundingCallId)
        {
            var report = await _administrationService.ViewProgressReport(applicationId);
            report.ApplicationDocuments = await _administrationService.GetProgressReportDocuments(applicationId);
            report.ViewReportSource = "ProgressReports";
            report.MotivationalLetter = await _ucdpService.GetLinkUserMotivationLetter(report.UserId, fundingCallId);
            return View("~/Views/UCDP/Administration/Report.cshtml", report);
        }

        [HttpGet]
        public async Task<IActionResult> ApplicantViewReport([FromQuery] int applicationId, [FromQuery] int fundingCallId)
        {
            var report = await _administrationService.ViewProgressReport(applicationId);
            report.ApplicationDocuments = await _administrationService.GetProgressReportDocuments(applicationId);
            report.MotivationalLetter = await _ucdpService.GetLinkUserMotivationLetter(report.UserId, fundingCallId);
            return View("~/Views/UCDP/Administration/Report.cshtml", report);
        }

        [HttpPost]
        public async Task<IActionResult> ReturnReportForInformation(ProgressReportCommentsViewModel comments)
        {
            var userId = UserHelper.GetUserId(User);
            comments.UserId = Convert.ToInt32(userId);
            var addedComment = await _administrationService.AddComments(comments);
            if (addedComment.ProgressReportId != 0) {
                var progressReport = new ProgressReportDetailsViewModel();
                progressReport.Id = addedComment.ProgressReportId;
                progressReport.Status = ProgressReportStatusEnum.RFI.GetDescription();
                var updatedReport = await _administrationService.UpdateRFIProgressReport(progressReport);
            }
            return Json(new { message = true });
        }


        [HttpPost]
        public async Task<IActionResult> FinalizeProgressReport(ProgressReportDetailsViewModel progressReport)
        {
            progressReport.Status = ProgressReportStatusEnum.Finalize.GetDescription();
            var updatedReport = await _administrationService.FinaliseProgressReport(progressReport);
            return Json(new { message = true });
        }

        [HttpGet]
        public async Task<IActionResult> ViewDocument(int documentId)
        {
            string results = await _administrationService.ViewDocument(documentId);

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

        [HttpGet]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            var results = await _administrationService.DeleteProgressReportDocument(documentId);
            return Ok(true);
        }

        [HttpGet]
        public async Task<IActionResult> CreatePdfDocument(int applicationId)
        {
            try
            {
                // 1. Get the data (same as in ViewReport action)
                ProgressReportDetailsViewModel report = new ProgressReportDetailsViewModel();
                report = await _administrationService.ViewProgressReport(applicationId);
                report.ApplicationDocuments = await _administrationService.GetProgressReportDocuments(applicationId);

                ViewData["Title"] = "Progress Report";
                ViewData.Model = report;

                // 2. Render the view to HTML string
                var viewName = "~/Views/UCDP/Administration/Report.cshtml";
                string htmlContent;

                using (var writer = new StringWriter())
                {
                    var viewResult = _viewEngine.GetView(null, viewName, false);

                    if (!viewResult.Success)
                    {
                        return NotFound($"The view {viewName} was not found.");
                    }

                    var viewContext = new ViewContext(
                        ControllerContext,
                        viewResult.View,
                        ViewData,
                        TempData,
                        writer,
                        new HtmlHelperOptions()
                    );

                    await viewResult.View.RenderAsync(viewContext);
                    htmlContent = writer.ToString();
                }

                // 3. Generate PDF
                var htmlToPdf = new HtmlToPdfConverter();

                htmlContent = ReportStyling.ApplyEmbeddedStyles(htmlContent);

                var pdfBytes = htmlToPdf.GeneratePdf(htmlContent);

                var stream = new MemoryStream(pdfBytes);

                return File(stream.ToArray(), System.Net.Mime.MediaTypeNames.Application.Pdf, "Progress ReportOverview_" + applicationId + ".pdf");
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error generating PDF for application {ApplicationId}", applicationId);
                return StatusCode(500, $"Error generating PDF: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> ProgressReportDetails(ProgressReportDetailsViewModel details)
        {
            var response = await _administrationService.AddProgressReport(details);
            return Json(new { status = "Saved", message = response });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProgressDetails(ProgressReportDetailsViewModel details)
        {
            var response = await _administrationService.UpdateProgressDetails(details);
            return Json(new { status = "Saved", message = response });
        }

        [HttpPost]
        public async Task<IActionResult> UploadProgressReportDocuments(ProgressReportDetailsViewModel details)
        {
            var files = Request.Form.Files;

            List<CreateDocumentViewModel> DocumentUlpoadSessionList = new List<CreateDocumentViewModel>();
            foreach (var file in files)
            {

                var UploadDocumentSession = new CreateDocumentViewModel();

                using (var researchBinaryReader = new BinaryReader(file.OpenReadStream()))
                {

                    UploadDocumentSession.Filename = Path.GetFileName(file.FileName);
                    UploadDocumentSession.DocumentFile = researchBinaryReader.ReadBytes((int)file.OpenReadStream().Length);
                    UploadDocumentSession.DocumentExtention = Path.GetExtension(file.FileName);
                    UploadDocumentSession.UploadType = EnumExtensions.GetEnumDescription<ProgressReportUploadTypeEnum>(details.FileUploadType);
                    UploadDocumentSession.ProgressReportId = Convert.ToInt32(details.Id);
                };
                DocumentUlpoadSessionList.Add(UploadDocumentSession);
            }
            details.ApplicationDocuments = await _administrationService.UploadProgressReportDocuments(DocumentUlpoadSessionList);
            return Json(new { status = "Saved", message = details });
        }

        //==========================================Private Methods==========================================//
        #region Private Methods
        private void PopulateReportDetails(ProgressReportDetailsViewModel report, ApplicationDetailsViewModel application, ApplicationDetailsViewModel results)
        {
            // Common properties
            report.UserId = application.UserDetails?.UserId ?? application.UserId;
            report.ApplicationId = application.Id != 0 ? application.Id : report.ApplicationId;
            report.ReferenceNumber = !String.IsNullOrEmpty(application.ReferenceNumber) ? application.ReferenceNumber : report.ReferenceNumber;
            report.StaffNumber = !String.IsNullOrEmpty(application.UserDetails?.StaffNumber) ? application.UserDetails?.StaffNumber : report.StaffNumber;
            report.Title = !String.IsNullOrEmpty(application.UserDetails?.Title) ? application.UserDetails?.Title : report.Title;
            report.FirstName = !String.IsNullOrEmpty(application.UserDetails?.FirstName) ? application.UserDetails?.FirstName : report.FirstName;
            report.Surname = !String.IsNullOrEmpty(application.UserDetails?.Surname) ? application.UserDetails?.Surname : report.Surname;
            report.Username = !String.IsNullOrEmpty(application.UserDetails?.Username) ? application.UserDetails?.Username : report.Username;
            report.ApplicantCategory = !String.IsNullOrEmpty(application.ApplicantCategory) ? application.ApplicantCategory : report.ApplicantCategory;
            report.ApprovedAmount = TextFormatHelper.FormatCurrency(!String.IsNullOrEmpty(results?.ApprovedAmount) ? results?.ApprovedAmount : report.ApprovedAmount);
            report.FundingCallId = application.FundingCallDetails.Id;
            // Status formatting
            report.Status = report.Status == "RFI" ? "Returned For Information" : report.Status;

            // Boolean to string conversions
            if (report != null)
            {
                report.QualificationInPrgress = report.IsQualificationInPrgress == true ? "Yes" : "No";
                report.QualificationGraduated = report.IsQualificationGraduated == true ? "Yes" : "No";
                report.ReliefAppointment = report.IsReliefAppointment == true ? "Yes" : "No";
                report.ResearchProject = report.IsResearchProject == true ? "Yes" : "No";
                report.ResearchPublication = report.IsResearchPublication == true ? "Yes" : "No";
                report.CollaborativeProject = report.IsCollaborativeProject == true ? "Yes" : "No";
            }
        }
        #endregion

    }
}