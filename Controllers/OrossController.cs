using System;
using System.Dynamic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.Presentation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Newtonsoft.Json;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Oross;
using ResearchSuite.Models.Suite;
using ResearchSuite.Services.Interfaces;
using Serilog;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Controllers
{
    public class OrossController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly IResearchService _researchService;
        private readonly ILookupService _lookupService;
        private readonly IEmailService _emailService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public OrossController(IResearchService researchService, IEmailService emailService, ILookupService lookupService, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            _researchService = researchService;
            _emailService = emailService;
            _lookupService = lookupService;
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }
        [HttpGet]
        public async Task<IActionResult> GetOutputTypes()
        {
            var types = await _researchService.GetResearchOutputTypesAsync();
            return Ok(types);
        }

        [Authorize]
        public IActionResult Index()
        {
            var role = UserHelper.GetRoleForApp(User, "oross");
            var username = User.FindFirst("Username")?.Value;
            var fullName = UserHelper.GetFullName(User);
            var faculty = UserHelper.GetFaculty(User);
            var submissionViewModel = new NewSubmissionViewModel(_researchService, _lookupService, username ?? "");
            var model = new SubmissionFilter
            {
                Role = role,
                Username = username,
                FullName = fullName,
                Faculty = faculty,
                submissionViewModel = submissionViewModel
            };

            return View(model);
        }


        [Authorize]
        public IActionResult NewSubmission()
        {
            var userApplication = JsonConvert.DeserializeObject<UserApplication>(HttpContext.User.FindAll("userData").Select(c => c.Value).FirstOrDefault() ?? "");
            var model = new NewSubmissionViewModel(_researchService, _lookupService, userApplication?.Username ?? "");
            HttpContext.RequestServices.GetRequiredService<Microsoft.AspNetCore.Antiforgery.IAntiforgery>().GetAndStoreTokens(HttpContext);
            return View(model);
        }

        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(150_000_000)]
        [RequestFormLimits(MultipartBodyLengthLimit = 150_000_000)]
        public async Task<IActionResult> NewSubmission(NewSubmissionViewModel model)
        {
            if (model == null)
                return BadRequest("Model is null!");
            var userApplication = JsonConvert.DeserializeObject<UserApplication>(HttpContext.User.FindAll("userData").Select(c => c.Value).FirstOrDefault() ?? "");
            string username = userApplication != null ? userApplication?.Username : UserHelper.GetUsername(User);

            string ip = Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? HttpContext.Connection.RemoteIpAddress?.ToString();
            string browser = Request.Headers["User-Agent"].ToString();

            Log.Information("Submission attempt by {User} from IP {IP} using {Browser}", username, ip, browser);

            var _model = model.InitializeLookups(this._researchService, this._lookupService);
            model.ResearchTypeOptions = _model.ResearchTypeOptions;
            model.NoFeeReasonsOptions = _model.NoFeeReasonsOptions;
            model.PublicationYearOptions = _model.PublicationYearOptions;
            model.PublisherCurrencyOptions = _model.PublisherCurrencyOptions;
            model.SDGOptions = _model.SDGOptions;
            model.FacultyOptions = _model.FacultyOptions;
            model.ResearchOutputTypes = _model.ResearchOutputTypes;
            model.Authors = JsonConvert.DeserializeObject<List<AuthorModel>>(model.AuthorJson) ?? [];

            if (!model.IsEditMode)
            {
                var titleExists = await _researchService.TitleExists(model.PublicationName);
                TempData["TitleExists"] = null;
                if (titleExists)
                {
                    TempData["TitleExists"] = "The title already exists.";
                    ModelState.AddModelError("PublicationName", "The title already exists.");
                    return View(model);
                }
            }
            model.TotalCost = ParseDecimal(Request.Form["TotalCost"]);
            model.ContributionPublisherCurrency = ParseDecimal(Request.Form["ContributionPublisherCurrency"]);
            model.ContributionZAR = ParseDecimal(Request.Form["ContributionZAR"]);
            var authorlist = OrossControllerHelper.ResearchAuthorsXml(model.Authors);
            //var externalAuthors = model.Authors.Where(a => a.InstitutionName.Equals("external")).ToList();
            var externalAuthors = model.Authors.Where(a => !string.IsNullOrWhiteSpace(a.InstitutionName)
                        && a.OtherInstitutionType != 0).ToList();
            var additionalEmailList = new EmailItem().ConvertToList(model.NotificationEmails);
            var guidId = Guid.NewGuid().ToString();
            var faculty = model.FacultyOptions.FirstOrDefault(f => f.Value.Equals(model.Faculty.ToString()))?.Text;
            var openAccess = (model.OpenAccessModel?.IsChecked ?? false) ? 1 : 0;
            var publicationFeesApplicable = (model.PublicationFeesRequiredModel?.IsChecked ?? false) ? 1 : 0;
            var publicationFeesReasons = model.NoFeeReasonsOptions.Where(r => model.NoFeeReasons.Contains(r.Value)).Select(s => s.Text).ToList();
            var publishDisclaimer = (model.InstitutionalRepoModel?.IsChecked ?? false) ? "Yes" : "No";
            var SDG = model.SDGOptions.FirstOrDefault(f => f.Value.Equals(model.SDG.ToString()))?.Text;
            var soTLPublication = (model.IsSoTLPublicationModel?.IsChecked ?? false) ? 1 : 0;
            var a4IRPublication = (model.Is4IRPublicationModel?.IsChecked ?? false) ? 1 : 0;
            var dhetIndexed = (model.DHETIndexedModel?.IsChecked ?? false) ? 1 : 0;
            var specialCategoryRequired = (model.SpecialCategoryRequiredModel?.IsChecked ?? false) ? 1 : 0;
            var publisherCurrency = (model.PublicationFeesRequiredModel?.IsChecked ?? false) ?
                model.PublisherCurrencyOptions.FirstOrDefault(f => f.Value.Equals(model.PublisherCurrency.ToString()))?.Value : "";

            var researchType = model.ResearchTypeOptions.FirstOrDefault(opt => opt.Value == model.ResearchType.ToString())?.Text ?? "";

            var formFiles = OrossControllerHelper.GetFileModel(model, researchType.ToLower());
            var files = OrossControllerHelper.GetFileInformationToSubmit(formFiles, username);

            //get exernal institutions
            var externalInstitutions = new List<ResearchOutPut_OtherInstitutions>();
            foreach (var externalAuthor in externalAuthors)
            {
                var institution = new ResearchOutPut_OtherInstitutions()
                {
                    InternalAurthor = externalAuthor.FirstName + " " + externalAuthor.LastName,
                    StudentStaffNumber = externalAuthor.StaffNumber,
                    OtherInstitutionType = externalAuthor.OtherInstitutionType,
                    InstitutionName = externalAuthor.InstitutionName
                };
                externalInstitutions.Add(institution);
            }

            var submitResearchDto = new SubmitResearchRequestDto()
            {
                OutPut = new ResearchOutPut_DocumentViewModel()
                {
                    AuthorList = authorlist,
                    AdditionalEmailList = additionalEmailList,
                    AmountContributedByInstitution = model.ContributionPublisherCurrency,
                    AmountContributedByInstitutionInSARand = model.ContributionZAR,
                    AnyAdditionalURL = model.AdditionalURL,
                    Author = model.Authors.Select(s => $"{s.FirstName} {s.LastName}").FirstOrDefault(),
                    CreatedBy = username,
                    CreatedDate = DateTime.Now,
                    DepartmentName = model.Department,
                    Faculty = faculty,
                    GuidID = guidId,
                    NameOfPublicFunder = model.FunderName,
                    OpenAccess = (byte)openAccess,
                    OutPutType = model.ResearchType,
                    PublicationFeeDescription = model.FeeDescription,
                    PublicationFeesApplicable = (byte)publicationFeesApplicable,
                    PublicationFeesReasonList = model.NoFeeReasons,
                    PublicationTitle = model.PublicationName,
                    Publication_Year = model.PublicationYear,
                    Publish = publishDisclaimer,
                    PublisherCurrencyName = publisherCurrency,
                    SDG = SDG,
                    SoTLPublication = (byte)soTLPublication,
                    TotalCostOfPublishingArticle = model.TotalCost,
                    Username = model.Authors.Select(s => $"{s.StaffUsername}").FirstOrDefault(),
                    a4IRPublication = (byte)a4IRPublication,
                    Volume = model.Volume,
                    Issue = model.Issue,
                    DHETIndexed = (byte)dhetIndexed,
                    SpecialCategoryRequired = (byte)specialCategoryRequired,
                    ConferenceName = model.ConferenceName,
                    ISSN = model.IsbnIssn
                },
                Documents = files,
                OtherInstitutions = externalInstitutions
            };
            SubmitResearchResponseDto result = new SubmitResearchResponseDto();
            var newDocumentsToAdd = new List<PreviewDocumentViewModel>();

            if (model.IsEditMode)
            {
                var uploadedFormFiles = formFiles
                    .Where(f => f.File != null && f.File.Length > 0)
                    .ToList();

                if (uploadedFormFiles.Any())
                {
                    var existingDocs = await GetAPIDocuments(model.Giud);

                    foreach (var uploadedFileModel in uploadedFormFiles)
                    {
                        var uploadedMapEntry = OrossControllerHelper.DocumentMap
                            .FirstOrDefault(x => x.Value.inputId == uploadedFileModel.InputId);

                        if (uploadedMapEntry.Key == null)
                            continue;

                        var uploadedDocType = uploadedMapEntry.Value.docType;

                        var existingDoc = existingDocs.FirstOrDefault(doc =>
                            OrossControllerHelper.TryGetDocumentType(doc.DocumentName, out var existingDocType)
                            && existingDocType == uploadedDocType);

                        if (existingDoc != null)
                        {
                            var reuploadModel = new ReUploadDocumentViewModel
                            {
                                GuidID = existingDoc.GuidID,
                                ViewId = existingDoc.ViewId.ToString(),
                                ReuploadFile = uploadedFileModel.File,
                                ResearchId = existingDoc.ResearchId,
                                DocumentId = existingDoc.DocumentId
                            };

                            await ReUploadDocument(reuploadModel);
                        }
                        else
                        {
                            var newDoc = OrossControllerHelper.GetFileInformationToSubmit(new List<FileModel> { uploadedFileModel }, username).FirstOrDefault();

                            if (newDoc != null)
                                newDocumentsToAdd.Add(newDoc);
                        }
                    }
                }

                var amendmentModel = new Amendment_PublicationViewModel
                {
                    ResearchId = model.ResearchId,
                    PublicationYear = model.PublicationYear,
                    PublicationTitle = model.PublicationName,
                    Faculty = faculty,
                    DepartmentName = model.Department,
                    ISSN = model.IsbnIssn,
                    a4IRPublication = model.Is4IRPublicationModel.IsChecked == true ? "1" : "0",
                    NameOfPublicFunder = model.FunderName,
                    SoTLPublication = model.IsSoTLPublicationModel.IsChecked == true ? "1" : "0",
                    SDG = SDG,
                    AnyAdditionalURL = model.AdditionalURL,
                    ConferenceName = model.ConferenceName,
                    CreatedBy = username,
                    Documents = newDocumentsToAdd
                };

                result = await _researchService.UpdateAmendementResearch(amendmentModel);
            }
            else
            {
                result = await _researchService.SubmitResearch(submitResearchDto);
            }


            if (result != null && result.Successful)
            {
                try
                {
                    var emailModel = OrossControllerHelper.GetEmailSubmissionModel(result, model, username);
                    await _emailService.SendEmails(emailModel);
                    Log.Information("Email sent successfully for research {ResearchId} by {User}", result.ReserachId, username);
                }
                catch (Exception exEmail)
                {
                    string errorMessage = exEmail.Message;
                    Log.Error(exEmail, "Email sending failed for research {ResearchId} by {User}: {Error}", result.ReserachId, username, errorMessage);
                    TempData["FailureMessage"] = "Research submitted, but email could not be sent.";
                }

                TempData["SuccessMessage"] = "Research submitted successfully.";
                TempData["FailureMessage"] ??= null;

                return Redirect(Url.Action("Index"));
            }
            else
            {
                if (result != null)
                {
                    Log.Warning("Research submission failed for {User}: {Message}", username, result.Message);
                    TempData["FailureMessage"] = result.Message;
                }
                else
                {
                    Log.Error("Research submission failed for {User}: result was null", username);
                    TempData["FailureMessage"] = "An error was thrown.";
                }
                TempData["SuccessMessage"] = null;
                return View(model);
            }
        }


        [HttpPost]
        public async Task<IActionResult> AddToRepository(string guid)
        {
            var publish = new Publish
            {
                GuidId = guid,
                ChangedBy = UserHelper.GetFullName(User)
            };

            var result = await _researchService.UpdatePublishRepository(publish);

            if (!string.IsNullOrWhiteSpace(result) && result.Trim().Equals("Saved successfully", StringComparison.OrdinalIgnoreCase))
            {
                return Json(new { success = true, message = "Research added to the repository." });
            }

            return Json(new { success = false, message = result ?? "Failed to add to the repository." });

        }
        public async Task<IActionResult> SubmittedResearchView(string guid)
        {
            if (string.IsNullOrEmpty(guid))
                return RedirectToAction("ErrorPage", new { message = "Invalid research ID" });

            var submissionInfo = await _researchService.getResearchOutPutInfos(guid);
            var submission = submissionInfo.FirstOrDefault();

            if (submission == null)
                return NotFound();

            var model = await BuildSubmissionViewModel(submission, guid);
            return View("SubmittedResearchView", model);
        }

        private async Task<NewSubmissionViewModel> BuildSubmissionViewModel(SubmittedResearchViewModel.TempGetResearchOutPutInfo submission, string guid)
        {
            var model = new NewSubmissionViewModel(_researchService, _lookupService, submission.CreatedBy)
            {
                PublicationName = submission.PublicationTitle,
                PublicationYear = submission.Publication_Year,
                ResearchType = submission.OutPutType,
                Giud = submission.GuidID,
                Author = submission.Author,
                IsbnIssn = submission.ISSN,
                Department = submission.DepartmentName,
                FunderName = submission.NameOfPublicFunder ?? "N/A",
                AdditionalURL = submission.AnyAdditionalURL,
                FeeDescription = submission.PublicationFeeDescription,
                Volume = submission.Volume ?? "",
                PublisherCurrency = submission.PublisherCurrencyCode,
                TotalCost = ParseDecimal(submission.TotalCostOfPublishingArticle),
                ContributionPublisherCurrency = ParseDecimal(submission.AmountContributedByInstitution),
                ConferenceName = submission.ConferenceName,
                ContributionZAR = ParseDecimal(submission.AmountContributedByInstitutionInSARand),
                ResearchId = submission.ResearchId,
                ResearchTypeName = submission.Research_Output,
                FacultyName = submission.Faculty,
                SDGName = submission.SDG,
                LastChangedDateRFA = submission.LastChangedDate,
                ReSubmissionDate = submission.ReSubmissionDate,
                PublicationFeesReason = submission.PublicationFeesReason,
                Issue = submission.Issue,
                CreatedBy = submission.CreatedBy,
                RFAName = submission.RFAName,
                RFASurname = submission.RFASurname

            };


            bool EqualsYes(string val) => !string.IsNullOrWhiteSpace(val) && val.Trim().Equals("Yes", StringComparison.OrdinalIgnoreCase);
            string GetCurrentUserFullName() => UserHelper.GetFullName(User);
            var username = submission.CreatedUsername?.Trim();
            var createdBy = submission.CreatedBy?.Trim();
            var createdByIsIdentifier = !string.IsNullOrWhiteSpace(createdBy) && !createdBy.Any(char.IsWhiteSpace);
            model.InstitutionalRepoModel.IsChecked = EqualsYes(submission.Publish);
            model.OwnWorkModel.IsChecked = createdByIsIdentifier ? string.Equals(username, createdBy, StringComparison.OrdinalIgnoreCase) : submission.Author.Trim().Equals(GetCurrentUserFullName(), StringComparison.OrdinalIgnoreCase);
            model.OpenAccessModel.IsChecked = EqualsYes(submission.OpenAccess);
            model.Is4IRPublicationModel.IsChecked = EqualsYes(submission.a4IRPublication);
            model.IsSoTLPublicationModel.IsChecked = EqualsYes(submission.SoTLPublication);
            model.PublicationFeesRequiredModel.IsChecked = EqualsYes(submission.PublicationFeesApplicable);

            model.DHETIndexedModel.IsChecked = EqualsYes(submission.DHETIndexed);
            model.SpecialCategoryRequiredModel.IsChecked = EqualsYes(submission.SpecialCategoryRequired);

            var authors = await getResearchOutPutAuthors(guid);
            var saAuthors = await getResearchOutPutAffiliatedToOtherSAInstitutions(model.ResearchId);
            var internationalAuthors = await getResearchOutPutAffiliatedToOtherInternationalInstitutions(model.ResearchId);
            var otherUniversityAuthors = await getResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversities(model.ResearchId);

            model.Authors = authors.Select(a => new AuthorModel
            {
                FirstName = a.FirstName,
                LastName = a.LastName,
                StaffNumber = a.StaffNumber,
                StaffUsername = a.StaffUsername,
                IsPrimaryAuthor = a.IsPrimaryAuthor,
                Email = a.Email,
                Position = a.Position,
                Type = (saAuthors.Any(x => x.StudentStaffNumber == a.StaffNumber) ||
                        internationalAuthors.Any(x => x.StudentStaffNumber == a.StaffNumber) ||
                        otherUniversityAuthors.Any(x => x.StudentStaffNumber == a.StaffNumber))
                        ? "external" : "internal"
            }).ToList();

            model.AuthorJson = JsonConvert.SerializeObject(model.Authors);
            model.Faculty = UserHelper.GetFacultyIdFromText(submission.Faculty, model.FacultyOptions);
            model.SDG = UserHelper.GetSdgIdFromText(submission.SDG, model.SDGOptions);

            model.NoFeeConfirmation = string.IsNullOrWhiteSpace(submission.PublicationFeesApplicable) || submission.PublicationFeesApplicable.Trim().Equals("No", StringComparison.OrdinalIgnoreCase);
            model.docs = await GetAPIDocuments(guid);
            //  model.ResearchOutputTypes= await _researchService.GetResearchOutputTypesAsync();
            PopulateDocumentViewModels(model, submission.Research_Output, model.DHETIndexedModel.IsChecked ?? false, model.SpecialCategoryRequiredModel.IsChecked ?? false, Url);

            return model;
        }

        private decimal ParseDecimal(string val)
        {
            if (string.IsNullOrWhiteSpace(val))
                return 0m;

            val = val.Replace(",", "."); // safety for mixed input

            if (decimal.TryParse(
                val,
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture,
                out var result))
            {
                return result;
            }

            return 0m;
        }


        public async Task<List<TempGetResearchOutPutInfo>> getResearchOutPutInfos(string guidID)
        {
            var TempGetResearchOutPutInfo = await _researchService.getResearchOutPutInfos(guidID);
            return TempGetResearchOutPutInfo;
        }

        public async Task<List<TempGetResearchOutPutAuthor>> getResearchOutPutAuthors(string guidID)
        {
            var TempGetResearchOutPutAuthor = await _researchService.getResearchOutPutAuthors(guidID);
            return TempGetResearchOutPutAuthor;
        }

        public async Task<List<TempGetResearchOutPutDocument>> getResearchOutPutDocuments(string guidID)
        {
            var docs = await GetAPIDocuments(guidID);
            return docs;
        }


        public async Task<List<TempGetResearchOutPutAffiliatedToOtherSAInstitution>> getResearchOutPutAffiliatedToOtherSAInstitutions(int researchId)
        {

            var result = await _researchService.getResearchOutPutAffiliatedToOtherSAInstitutions(researchId);
            return result;
        }

        public async Task<List<TempGetResearchOutPutAffiliatedToOtherInternationalInstitution>> getResearchOutPutAffiliatedToOtherInternationalInstitutions(int researchId)
        {
            var results = await _researchService.getResearchOutPutAffiliatedToOtherInternationalInstitutions(researchId);

            return results;
        }

        public async Task<List<TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity>> getResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversities(int researchId)
        {

            var result = await _researchService.getResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversities(researchId);
            return result;
        }


        private async Task<List<TempGetResearchOutPutDocument>> GetAPIDocuments(string docId)
        {

            try
            {
                var results = await _researchService.GetAPIDocuments(docId);

                return results;
            }
            catch (Exception e)
            {

                throw;
            }

        }

        [HttpPost]
        public virtual async Task<IActionResult> ReUploadDocument(ReUploadDocumentViewModel model)
        {
            var username = User.FindFirst("Username")?.Value;

            try
            {
                //var documentGuid = model.GuidID;
                //var docResults = await _researchService.GetDocumentByGuid(documentGuid);

                //if (docResults == null || model.ReuploadFile == null)
                //    return Json(new { success = false, message = "Document not found or file is missing." });

                using (var binaryReader = new BinaryReader(model.ReuploadFile.OpenReadStream()))
                {
                    var docFile = binaryReader.ReadBytes((int)model.ReuploadFile.Length);
                    var docExtension = Path.GetExtension(model.ReuploadFile.FileName).ToLower();

                    // Optionally validate extension
                    var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                    if (!allowedExtensions.Contains(docExtension))
                    {
                        return Json(new { success = false, message = "Invalid file type." });
                    }

                    var reuploadModel = new ReUploadResearchOutPut_UpdateDocumentViewModel
                    {
                        DocumentFile = docFile,
                        FileExtension = docExtension,
                        DocumentId = model.DocumentId,
                        ResearchId = model.ResearchId,
                        CreatedBy = username
                    };

                    var result = await _researchService.ReuploadSubmitedResearchDocument(reuploadModel);

                    if (result.Successful)
                        return Json(new { success = true, message = "Document re-uploaded successfully." });

                    return Json(new { success = false, message = result.Message ?? "Failed to save document." });
                }
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "An unexpected error occurred." });
            }
        }


        [HttpPost]
        public async Task<IActionResult> SaveRFAComment(AddCommentFor_RFAViewModel model)
        {
            var username = User.FindFirst("Username")?.Value;

            if (string.IsNullOrWhiteSpace(username))
            {
                return Unauthorized("Session expired. Please log in again.");
            }

            model.CreatedBy = username;

            var result = await _researchService.SubmitCommentFRA(model);

            if (result.IsSuccessStatusCode)
            {
                return Json("Success");
            }

            return Json("Failed to Save");
        }

        [HttpGet]
        public async Task<IActionResult> GetDocument([FromQuery] string guid, [FromQuery] int viewId)
        {
            var docDto = await _researchService.GetDocumentByViewId(guid, viewId);

            if (docDto == null || docDto.Document == null || docDto.Document.Length == 0)
                return NotFound("Document not found");

            var stream = new MemoryStream(docDto.Document);

            Response.Headers["Content-Disposition"] = $"inline; filename={docDto.DocumentName ?? "document"}.pdf";
            Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            Response.Headers["Pragma"] = "no-cache";
            Response.Headers["Expires"] = "0";

            return new FileStreamResult(stream, "application/pdf");
        }

        public FileResult PdfDownload(byte[] reseachDoc, string extention)
        {
            if (reseachDoc == null && extention == null)
                return null;
            return File(reseachDoc, "application/pdf");
        }


        [HttpPost]
        public ActionResult ViewResearchDoc([FromBody] DocViewViewModel docView)
        {
            string docString = $"{docView?.GuidId}|{docView?.ViewId}";

            _httpContextAccessor.HttpContext?.Session.SetString("Doc", docString ?? "");

            return Json(new { status = "Success", message = "Doc found" });
        }

        [HttpPost]
        public ActionResult GetAdminSearch(AdminViewAllSearchViewModel searchView)
        {
            if (searchView == null)
            {
                return null;

            }


            AdminViewAllSearchViewModel searchView1 = searchView;
            _httpContextAccessor.HttpContext?.Session.SetString("SearchData", searchView1.ToString());

            var d = GetAdminViewAll();

            if (d != null)
            {
                if (!String.IsNullOrEmpty(searchView.PublicationTitle))
                {
                    d = d.Where(o => o.PublicationTitle == searchView.PublicationTitle).ToList();
                }

                if (!String.IsNullOrEmpty(searchView.SDG))
                {
                    d = d.Where(o => o.SDG == searchView.SDG).ToList();
                }

                if (!String.IsNullOrEmpty(searchView.ResearchOutput))
                {
                    d = d.Where(o => searchView.ResearchOutput.Contains(o.Research_Output)).ToList();
                }

                if (!String.IsNullOrEmpty(searchView.Faculty))
                {
                    d = d.Where(o => o.Faculty == searchView.Faculty).ToList();
                }

                if (!String.IsNullOrEmpty(searchView.StartDate))
                {
                    var CreatedDate = DateTime.Parse(searchView.StartDate);
                    d = d.Where(o => DateTime.Parse(o.CreatedDate) >= CreatedDate).ToList();
                }

                if (!String.IsNullOrEmpty(searchView.EndDate))
                {
                    var EndDate = DateTime.Parse(searchView.EndDate);
                    d = d.Where(o => DateTime.Parse(o.CreatedDate) <= EndDate).ToList();
                }
            }
            return Json(d);
        }



        public List<ResearchOutPutInfo_GetAllViewModel> GetAdminViewAll()
        {
            var searchDataJson = _httpContextAccessor.HttpContext?.Session.GetString("SearchData");

            AdminViewAllSearchViewModel searchAdminView = null;



            // var searchAdminView = (AdminViewAllSearchViewModel)Session["SearchData"];

            //var searchAdminView = (AdminViewAllSearchViewModel)_httpContextAccessor.HttpContext?.Session.GetString("SearchData");

            //if (searchAdminView == null)
            //{
            //    searchAdminView = new AdminViewAllSearchViewModel { Faculty = null, ResearchOutput = null, StartDate = null, EndDate = null, PublicationTitle = null, SDG = null };
            //}

            var allSubmissions = new List<ResearchOutPutInfo_GetAllViewModel>();

            //Must be this.... To map
            // string url = orossAPI + "Submit/GetViewAdminAllSubmission?facultyUser=" + searchAdminView.Faculty + "&researchOutput=" + searchAdminView.ResearchOutput + "&startDate=" + searchAdminView.StartDate + "&endDate=" + searchAdminView.EndDate + "&PublicationTitle=" + searchAdminView.PublicationTitle + "&SDG=" + searchAdminView.SDG;
            //  var d = BusinessRules.HttpHelper.HttpCallJson<List<ResearchOutPutInfo_GetAllViewModel>>(url, WebRequestMethods.Http.Get).ToList();
            //  var dd = d.Select(o => o.ResearchId).Distinct().ToList();
            // foreach (var item in dd)
            // {
            //  var res = d.FirstOrDefault(o => o.ResearchId == item);
            //   if (res != null)
            //   {
            //       allSubmissions.Add(res);
            //     }
            // }
            // _httpContextAccessor.HttpContext?.Session.GetString("SearchData")= null;

            //Put your condition to filer to the databASE
            return allSubmissions;
        }
        //[HttpGet]
        //public async Task<IActionResult> LookupInternalAuthor(string username)
        //{
        //    if (string.IsNullOrWhiteSpace(username))
        //        return BadRequest("Missing username");

        //    var author = await _researchService.GetAuthorByUsername(username);
        //    if (author == null || string.IsNullOrWhiteSpace(author.StaffNumber))
        //        return NotFound("Author not found");
        //    if (true)
        //    {

        //    }
        //    return Json(author);
        //}



        [HttpGet]
        public async Task<IActionResult> LookupInternalAuthor(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Missing username");

            string trimmed = username.Trim().ToLower();
            bool isNumeric = long.TryParse(trimmed, out _);

            // Identify Staff vs Student from username/number
            bool isStaffLookup = (isNumeric && trimmed.StartsWith("7")) || !isNumeric;

            bool isStudentLookup = (isNumeric && !trimmed.StartsWith("7"));

            var author = await _researchService.GetAuthorByUsername(trimmed);

            // --- NOT FOUND ---
            if (author == null || string.IsNullOrWhiteSpace(author.StaffNumber))
            {
                if (isStaffLookup)
                    return NotFound("User profile not found on Oracle EBS. Please confirm with HR Admin at hradmin@uj.ac.za that the user's email address is correctly updated.");


                return NotFound("Profile not found");
            }

            // --- STUDENT (return immediately, no HR checks) ---
            if (isStudentLookup)
            {
                return Json(author);
            }


            if (string.IsNullOrWhiteSpace(author.Email))
                return BadRequest("The research author's email address is missing on Oracle EBS. Please contact HR Admin at hradmin@uj.ac.za to have it updated.");

            return Json(author);
        }
        [HttpGet]
        public async Task<IActionResult> GetCurrentUserAuthorInfo()
        {
            var username = User.FindFirst("Username")?.Value ?? "";

            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Profile not found");

            string trimmed = username.Trim().ToLower();
            bool isNumeric = long.TryParse(trimmed, out _);

            // Identify Staff vs Student from username/number
            bool isStaffLookup = (isNumeric && trimmed.StartsWith("7")) || !isNumeric;
            bool isStudentLookup = (isNumeric && !trimmed.StartsWith("7"));

            var author = await _researchService.GetAuthorByUsername(trimmed);

            // --- NOT FOUND ---
            if (author == null)
            {
                if (isStaffLookup)
                    return NotFound("Your user profile was not found on Oracle EBS. Please confirm with HR Admin at hradmin@uj.ac.za that your email address is correctly updated.");

                return NotFound("Profile not found");
            }

            if (isStudentLookup)
            {
                return Json(author);
            }

            if (string.IsNullOrWhiteSpace(author.Email))
                return BadRequest("Your email address is missing on Oracle EBS. Please contact HR Admin at hradmin@uj.ac.za to have it updated.");

            return Json(author);
        }

        [HttpGet]
        public async Task<IActionResult> GetAdmin_ResearchOutPutInfoBySubmissionsType([FromQuery] SubmissionFilter filter)
        {
            var populateResult = PopulateUserFilterInfo(filter);
            if (populateResult is UnauthorizedResult unauthorized)
                return unauthorized;


            var results = await _researchService.GetFilteredSubmissionsAsync(filter);
            return Ok(results);
        }
        [HttpPost]
        public async Task<IActionResult> ExportFilteredToExcel([FromForm] SubmissionFilter filter)
        {
            var populateResult = PopulateUserFilterInfo(filter);
            if (populateResult is UnauthorizedResult unauthorized)
                return unauthorized;

            var filteredData = await _researchService.GetFilteredSubmissionsAsync(filter);

            // Validate list has data
            if (filteredData == null || !filteredData.Any())
            {
                return BadRequest("No data found to export.");
            }

            var stream = ExcelHelper.ExportToExcel(filteredData);
            return File(
                stream,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "FilteredSubmissions.xlsx"
            );
        }

        private IActionResult? PopulateUserFilterInfo(SubmissionFilter filter)
        {
            var username = User.FindFirst("Username")?.Value;
            if (string.IsNullOrWhiteSpace(username))
                return Unauthorized("User not logged in");

            var role = User.FindFirst("role_oross")?.Value?.ToLowerInvariant() ?? "user";
            var fullName = UserHelper.GetFullName(User);
            var userFaculty = UserHelper.GetFaculty(User);

            filter.Username = username;
            filter.FullName = fullName;
            filter.Role = role;

            if (role == "faculty coordinator")
                filter.Faculty = userFaculty;
            filter.submissionViewModel = new NewSubmissionViewModel(_researchService, _lookupService, filter.Username);

            return null; // means success
        }

        [Authorize]
        public async Task<IActionResult> EditSubmission(string guid)
        {
            if (string.IsNullOrEmpty(guid))
                return RedirectToAction("ErrorPage", new { message = "Invalid research ID" });

            var submissionInfo = await _researchService.getResearchOutPutInfos(guid);
            var submission = submissionInfo.FirstOrDefault(x => x.GuidID == guid);

            if (submission == null)
                return NotFound();

            var model = await BuildSubmissionViewModel(submission, guid);
            model.IsEditMode = true;

            // Enable edit flags on nested models (optional if BuildSubmissionViewModel sets them)
            model.InstitutionalRepoModel.IsEditMode = true;
            model.OwnWorkModel.IsEditMode = true;
            model.OpenAccessModel.IsEditMode = true;
            model.Is4IRPublicationModel.IsEditMode = true;
            model.IsSoTLPublicationModel.IsEditMode = true;
            model.DHETIndexedModel.IsEditMode = true;
            model.SpecialCategoryRequiredModel.IsEditMode = true;
            model.PublicationFeesRequiredModel.IsEditMode = true;

            return View("NewSubmission", model);
        }

        public static string GenerateViewUrl(TempGetResearchOutPutDocument doc, IUrlHelper urlHelper)
        {
            return urlHelper.Action("GetDocument", "Oross", new { guid = doc.GuidID, viewId = doc.ViewId });
        }

        public static void PopulateDocumentViewModels(NewSubmissionViewModel model, string researchType, bool isDhetIndexed, bool isSpecialCategory, IUrlHelper urlHelper)
        {
            model.UploadedDocs = new List<DocumentUploadViewModel>();

            foreach (var mapEntry in OrossControllerHelper.DocumentMap)
            {
                var modelPropertyName = mapEntry.Key;
                var (inputId, docType, label, required, applicableTypes) = mapEntry.Value;

                if (!applicableTypes.Any(t => t.Trim().Equals(researchType?.Trim(), StringComparison.OrdinalIgnoreCase)))
                    continue;


                var matchingDocs = model.docs?
                    .Where(d => OrossControllerHelper.TryGetDocumentType(d.DocumentName, out var docTypeFromDb)
                                && docTypeFromDb == docType)
                    .ToList();

                if (matchingDocs == null || !matchingDocs.Any())
                    continue;

                foreach (var matchedDoc in matchingDocs)
                {
                    var viewModel = new DocumentUploadViewModel
                    {
                        InputId = inputId,
                        InputName = inputId,
                        LabelText = label,
                        IsRequired = required,
                        DocName = matchedDoc.DocumentName,
                        DocUrl = GenerateViewUrl(matchedDoc, urlHelper),
                        IsHidden = false,
                        IsEditMode = true,
                        GuidId = matchedDoc.GuidID,
                        ViewId = matchedDoc.ViewId.ToString()
                    };

                    model.UploadedDocs.Add(viewModel);
                    typeof(NewSubmissionViewModel).GetProperty(modelPropertyName)?.SetValue(model, viewModel);
                }
            }
        }

    }
}
