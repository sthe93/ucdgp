using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using DocumentFormat.OpenXml.EMMA;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using ResearchSuite.Helpers;
using ResearchSuite.Services;
using ResearchSuite.Services.Interfaces;
using ResearchSuite.Validations;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Models.Oross
{
    public class NewSubmissionViewModel
    {
        private readonly IResearchService _researchService;
        private readonly ILookupService _lookupService;

        public NewSubmissionViewModel() { }
        public NewSubmissionViewModel(IResearchService researchService, ILookupService lookupService, string username)
        {
            this.Username = username;
            this._researchService = researchService;
            this._lookupService = lookupService;

            var researchOutTypes = researchService.GetResearchOutputTypesAsync().Result;
            var feesReasons = researchService.GetPublicationFeesReason().Result
                    ?.Where(r => !string.IsNullOrWhiteSpace(r.PublicationFeesReasonName))
                    .ToList();
            var publicationYears = researchService.GetPublicationYear().Result;
            var currencies = researchService.GetCurrencies().Result;
            var sdgs = this._lookupService.GetLookups(4).Result;
            var faculties = this._lookupService.GetLookups(3).Result;

            researchOutTypes.Insert(0, new ResearchOutputTypeDto(0, "Select research type", ""));

            this.ResearchTypeOptions = new SelectList(researchOutTypes, "OutputTypeId", "Description");
            this.ResearchOutputTypes = researchOutTypes;

            this.NoFeeReasonsOptions = new SelectList(feesReasons, "PublicationFeesReasonId", "PublicationFeesReasonName");

            publicationYears.Insert(0, new PublicationYearDto(0, "Select publication year"));
            this.PublicationYearOptions = new SelectList(publicationYears, "Id", "Years");

            currencies.Insert(0, new CurrencyDto("", "Select publisher currency"));
            this.PublisherCurrencyOptions = new SelectList(currencies, "PublisherCurrencyCode", "PublisherCurrencyName");

            sdgs.Insert(0, new LookupDto(0, "Select SDG"));
            this.SDGOptions = new SelectList(sdgs, "LookupId", "LookupName");

            foreach (var faculty in faculties)
            {
                faculty.LookupName = UserHelper.ToProperCase(faculty.LookupName);
            }
            faculties = faculties.OrderBy(f => f.LookupName).ToList();

            faculties.Insert(0, new LookupDto(0, "Select Faculty"));
            this.FacultyOptions = new SelectList(faculties, "LookupId", "LookupName");

        }

        public NewSubmissionViewModel InitializeLookups(IResearchService researchService, ILookupService lookupService)
        {
            var model = new NewSubmissionViewModel();
            var researchOutTypes = researchService.GetResearchOutputTypesAsync().Result;
            var feesReasons = researchService.GetPublicationFeesReason().Result
                   ?.Where(r => !string.IsNullOrWhiteSpace(r.PublicationFeesReasonName))
                   .ToList();
            //var feesReasons = researchService.GetPublicationFeesReason().Result;
            var publicationYears = researchService.GetPublicationYear().Result;
            var currencies = researchService.GetCurrencies().Result;
            var sdgs = lookupService.GetLookups(4).Result;
            var faculties = lookupService.GetLookups(3).Result;

            researchOutTypes.Insert(0, new ResearchOutputTypeDto(0, "Select research type", ""));
            model.ResearchTypeOptions = new SelectList(researchOutTypes, "OutputTypeId", "Description");
            model.ResearchOutputTypes = researchOutTypes;

            model.NoFeeReasonsOptions = new SelectList(feesReasons, "PublicationFeesReasonId", "PublicationFeesReasonName");

            publicationYears.Insert(0, new PublicationYearDto(0, "Select publication year"));
            model.PublicationYearOptions = new SelectList(publicationYears, "Id", "Years");

            currencies.Insert(0, new CurrencyDto("", "Select publisher currency"));
            model.PublisherCurrencyOptions = new SelectList(currencies, "PublisherCurrencyCode", "PublisherCurrencyName");

            sdgs.Insert(0, new LookupDto(0, "Select SDG"));
            model.SDGOptions = new SelectList(sdgs, "LookupId", "LookupName");

            foreach (var faculty in faculties)
            {
                faculty.LookupName = UserHelper.ToProperCase(faculty.LookupName);
            }
            faculties = faculties.OrderBy(f => f.LookupName).ToList();

            faculties.Insert(0, new LookupDto(0, "Select Faculty"));
            model.FacultyOptions = new SelectList(faculties, "LookupId", "LookupName");

            return model;
        }

        public string Username { get; set; } = string.Empty;
        public List<AuthorModel> Authors { get; set; } = new List<AuthorModel>();
        public string AuthorJson { get; set; } = string.Empty;
        public string? NotificationEmails { get; set; } = string.Empty;
        [Display(Name = "Publication Name")]
        [Required]
        public string PublicationName { get; set; }
        [Display(Name = "ISBN/ISSN")]
        [RegularExpression(@"^[\d\-]+$", ErrorMessage = "Only digits and hyphens are allowed in ISBN/ISSN")]
        public string IsbnIssn { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        [Display(Name = "Name of conference")]
        public string ConferenceName { get; set; } = string.Empty;
        [Display(Name = "Conference paper title")]
        public string ConferenceTitle { get; set; } = string.Empty;
        [Display(Name = "Conference dates")]
        public string ConferenceDates { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        [Display(Name = "Additional URL")]
        public string? AdditionalURL { get; set; } = string.Empty;
        public string Volume { get; set; }
        public string Issue { get; set; }
        public string FunderName { get; set; } = string.Empty;
        public bool NoFeeConfirmation { get; set; }
        public string FeeDescription { get; set; } = string.Empty;
        public List<ResearchOutputTypeDto> ResearchOutputTypes { get; set; }
        [Display(Name = "Total publishing cost (publisher’s currency)")]
        [Range(0, double.MaxValue, ErrorMessage = "Total publishing cost must be a valid decimal number.")]
        public decimal TotalCost { get; set; }
        [Display(Name = "Institution contribution (ZAR)")]
        [Range(0, double.MaxValue, ErrorMessage = "Institution contribution (ZAR) must be a valid decimal number.")]
        public decimal ContributionZAR { get; set; }
        [Display(Name = "Institution contribution (publisher’s currency)")]
        [Range(0, double.MaxValue, ErrorMessage = "Institution contribution (publisher’s currency) must be a valid decimal number.")]
        public decimal ContributionPublisherCurrency { get; set; }

        [Required(ErrorMessage = "Please upload your published paper.")]
        [PDFValidation]
        public IFormFile PublishedPaper { get; set; }
        [VerifyUploadedFileValidation("PublishedPaper")]
        public bool VerifyPublishedPaper { get; set; }

        [PDFValidation]
        public IFormFile Manuscript { get; set; }
        [VerifyUploadedFileValidation("Manuscript")]
        public bool VerifyManuscript { get; set; }

        [PDFValidation]
        public IFormFile SupportingDoc { get; set; }
        [VerifyUploadedFileValidation("SupportingDoc")]
        public bool VerifySupportingDoc { get; set; }

        [PDFValidation]
        public IFormFile TocUpload { get; set; }
        [VerifyUploadedFileValidation("TocUpload")]
        public bool VerifyTocUpload { get; set; }

        [PDFValidation]
        public IFormFile DhetLetter { get; set; }
        [VerifyUploadedFileValidation("DhetLetter")]
        [DHETValidation]
        public bool VerifydhetLetter { get; set; }

        [PDFValidation]
        [FqcDeclarationValidation]
        public IFormFile FqcDeclaration { get; set; }
        [VerifyUploadedFileValidation("FqcDeclaration")]
        public bool VerifyfqcDeclaration { get; set; }

        [PDFValidation]
        public IFormFile PublishedBook { get; set; }
        [VerifyUploadedFileValidation("PublishedBook")]
        public bool VerifyPublishedBook { get; set; }

        [PDFValidation]
        public IFormFile PeerReviewLetter { get; set; }
        [VerifyUploadedFileValidation("PeerReviewLetter")]
        public bool VerifyPeerReviewLetter { get; set; }

        [PDFValidation]
        public IFormFile PeerReviewComments { get; set; }
        [VerifyUploadedFileValidation("PeerReviewComments")]
        public bool VerifyPeerReviewComments { get; set; }

        [PDFValidation]
        public IFormFile ScholarlyMotivation { get; set; }
        [VerifyUploadedFileValidation("ScholarlyMotivation")]
        public bool VerifyScholarlyMotivation { get; set; }

        [PDFValidation]
        public IFormFile LateMotivation { get; set; }
        [VerifyUploadedFileValidation("LateMotivation")]
        public bool VerifyLateMotivation { get; set; }

        public SwitchWithTooltipModel OwnWorkModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "OwnWorkModel.IsChecked",
            InputId = "OwnWork",
            InputName = "OwnWork",
            LabelText = "Are you submitting your own work?",
            //  TooltipText = "Switch ON if you are submitting your own work. Switch OFF if submitting on someone else's behalf.",
            IsChecked = true
        };

        public SwitchWithTooltipModel InstitutionalRepoModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "InstitutionalRepoModel.IsChecked",
            InputId = "InstitutionalRepo",
            InputName = "InstitutionalRepo",
            LabelText = " Include my work on the Institutional Repository?",
            //TooltipText = "Depositing your work ensures it is preserved, discoverable, and aligned with UJ's open access goals.",
            IsChecked = null,
            Text = "I take note that the Institutional Repository of the University provides unrestricted online access to the works included therein. I hereby grant the University, to the extent that I am the owner of the copyright in the work, a non-exclusive license to include the work in its Institutional Repository until the license is revoked."
        };

        public SwitchWithTooltipModel OpenAccessModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "OpenAccessModel.IsChecked",
            InputId = "OpenAccess",
            InputName = "OpenAccess",
            LabelText = "Open access",
            TooltipText = "Indicates if this publication is open access, freely available to the public.",
            IsChecked = null,
        };

        public SwitchWithTooltipModel Is4IRPublicationModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "Is4IRPublicationModel.IsChecked",
            InputId = "Is4IRPublication",
            InputName = "Is4IRPublication",
            LabelText = "4IR Publication",
            TooltipText = "Indicate if this publication relates to the Fourth Industrial Revolution initiatives.",
            IsChecked = null,
        };

        public SwitchWithTooltipModel IsSoTLPublicationModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "IsSoTLPublicationModel.IsChecked",
            InputId = "IsSoTLPublication",
            InputName = "IsSoTLPublication",
            LabelText = "SoTL Publication",
            TooltipText = "The scholarship of teaching and learning (SOTL)",
            IsChecked = null,

        };

        public SwitchWithTooltipModel DHETIndexedModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "DHETIndexedModel.IsChecked",
            InputId = "DHETIndexed",
            InputName = "DHETIndexed",
            LabelText = "DHET-indexed?",
            TooltipText = "Please note that a letter from the publisher confirming that at least 75% of contributions published in the journal emanate from multiple institutions.",
            IsChecked = null,
        };

        public SwitchWithTooltipModel SpecialCategoryRequiredModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "SpecialCategoryRequiredModel.IsChecked",
            InputId = "SpecialCategoryRequired",
            InputName = "SpecialCategoryRequired",
            LabelText = "Is your research one of the following? (All types of review, Data paper, brief report, protocol, short communication)",
            TooltipText = "Kindly note that New Research Motivation is required.",
            IsChecked = null,
        };

        public SwitchWithTooltipModel PublicationFeesRequiredModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "PublicationFeesRequiredModel.IsChecked",
            InputId = "PublicationFees",
            InputName = "PublicationFees",
            LabelText = "Were publication fees paid for this article?",
            TooltipText = "Select 'Yes' if any fees were paid to publish this journal article.",
            IsChecked = null,
        };



        [Display(Name = "Type of research output")]
        [Required(ErrorMessage = "Research type is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid research type.")]
        public int ResearchType { get; set; }
        public SelectList ResearchTypeOptions { get; set; }

        [Display(Name = "Year of publication")]
        [Required(ErrorMessage = "Publication year is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid year.")]
        public int PublicationYear { get; set; }
        public SelectList PublicationYearOptions { get; set; }

        [Display(Name = "Faculty")]
        [Required(ErrorMessage = "Faculty is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid faculty.")]
        public int Faculty { get; set; }
        public bool IsEditMode { get; set; }
        public string Giud { get; set; }
        public int ResearchId { get; set; }
        public string Author { get; set; }
        public string ResearchTypeName { get; set; }
        public string FacultyName { get; set; }
        public string ReSubmissionDate { get; set; }
        public string LastChangedDateRFA { get; set; }
        public string SDGName { get; set; }
        public string PublicationFeesReason { get; set; }
        public string CreatedBy { get; set; }
        public string RFAName { get; set; }
        public string RFASurname { get; set; }
        public List<DocumentUploadViewModel> UploadedDocs { get; set; }
        public SelectList FacultyOptions { get; set; }
        [Display(Name = "SDG")]
        [Required(ErrorMessage = "SDG is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid SDG.")]
        public int SDG { get; set; }
        public SelectList SDGOptions { get; set; }
        public List<string> NoFeeReasons { get; set; } = new List<string>();
        public SelectList NoFeeReasonsOptions { get; set; }
        [Display(Name = "Publisher currency")]
        public string PublisherCurrency { get; set; } = string.Empty;
        public SelectList PublisherCurrencyOptions { get; set; }

        public DocumentUploadViewModel PublishedPaperUpload { get; set; } = new()
        {
            LabelText = "Published paper",
            InputName = "PublishedPaper",
            InputId = "PublishedPaper",
            IsRequired = true
        };

        public DocumentUploadViewModel DhetLetterUpload { get; set; } = new()
        {
            LabelText = "25/75% contribution letter",
            InputName = "DhetLetter",
            InputId = "DhetLetter",
            IsRequired = true,
            Tooltip= "A letter from the journal confirming compliance with DHET 25/75% - at least 75% of contributions published in the journal emanate from multiple institutions."
        };

        public DocumentUploadViewModel FqcDeclarationUpload { get; set; } = new()
        {
            LabelText = "FQC-New Research Declaration",
            InputName = "FqcDeclaration",
            InputId = "FqcDeclaration",
            IsRequired = true
        };

        public DocumentUploadViewModel ManuscriptUpload { get; set; } = new()
        {
            LabelText = "Manuscript",
            InputName = "Manuscript",
            InputId = "Manuscript",
            IsRequired = false,
            Tooltip = "Final peer reviewed article accepted for publication in plain MS Word document."
        };

        public DocumentUploadViewModel SupportingDocUpload { get; set; } = new()
        {
            LabelText = "Supporting document",
            InputName = "SupportingDoc",
            InputId = "SupportingDoc",
            IsRequired = false,
            Tooltip = "<i>Loading...</i>"
        };

        public DocumentUploadViewModel TocToUpload { get; set; } = new()
        {
            LabelText = "Table of contents",
            InputName = "TocUpload",
            InputId = "TocUpload",
            IsRequired = false
        };
        public DocumentUploadViewModel PublishedBookUpload { get; set; } = new()
        {
            LabelText = "Published book",
            InputName = "PublishedBook",
            InputId = "PublishedBook",
            IsRequired = true
        };

        public DocumentUploadViewModel PeerReviewLetterUpload { get; set; } = new()
        {
            LabelText = "Peer review process letter from publisher",
            InputName = "PeerReviewLetter",
            InputId = "PeerReviewLetter",
            IsRequired = true
        };

        public DocumentUploadViewModel PeerReviewCommentsUpload { get; set; } = new()
        {
            LabelText = "Peer review comments",
            InputName = "PeerReviewComments",
            InputId = "PeerReviewComments",
            IsRequired = true
        };

        public DocumentUploadViewModel ScholarlyMotivationUpload { get; set; } = new()
        {
            LabelText = "Scholarly motivation",
            InputName = "ScholarlyMotivation",
            InputId = "ScholarlyMotivation",
            IsRequired = true
        };

        public DocumentUploadViewModel LateMotivationUpload { get; set; } = new()
        {
            LabelText = "Late motivation letter from publisher",
            InputName = "LateMotivation",
            InputId = "LateMotivation",
            IsRequired = false,
            Tooltip="Published before current submission year."
        };

        public DocumentUploadViewModel PublishedChapterUpload { get; set; } = new()
        {
            LabelText = "Published chapter",
            InputName = "PublishedChapter",
            InputId = "PublishedChapter",
            IsRequired = true
        };

        public DocumentUploadViewModel PeerReviewLetterChapterUpload { get; set; } = new()
        {
            LabelText = "Peer review process letter from publisher",
            InputName = "PeerReviewLetterChapter",
            InputId = "PeerReviewLetterChapter",
            IsRequired = true
        };

        public DocumentUploadViewModel PeerReviewCommentsChapterUpload { get; set; } = new()
        {
            LabelText = "Peer review comments",
            InputName = "PeerReviewCommentsChapter",
            InputId = "PeerReviewCommentsChapter",
            IsRequired = true
        };

        public DocumentUploadViewModel ScholarlyMotivationChapterUpload { get; set; } = new()
        {
            LabelText = "Scholarly motivation",
            InputName = "ScholarlyMotivationChapter",
            InputId = "ScholarlyMotivationChapter",
            IsRequired = true
        };

        public DocumentUploadViewModel LateMotivationChapterUpload { get; set; } = new()
        {
            LabelText = "Late motivation letter from publisher",
            InputName = "LateMotivationChapter",
            InputId = "LateMotivationChapter",
            IsRequired = false,
            Tooltip= "Published before current submission year."
        };
        public DocumentUploadViewModel ConferencePublishedPaperUpload { get; set; } = new()
        {
            LabelText = "Published paper",
            InputName = "ConferencePublishedPaper",
            InputId = "ConferencePublishedPaper",
            IsRequired = true
        };

        public DocumentUploadViewModel ConferenceManuscriptUpload { get; set; } = new()
        {
            LabelText = "Manuscript",
            InputName = "ConferenceManuscript",
            InputId = "ConferenceManuscript",
            IsRequired = false,
            Tooltip= "Final peer reviewed article accepted for publication in plain MS Word document."
        };

        public DocumentUploadViewModel ConferenceTocUpload { get; set; } = new()
        {
            LabelText = "Full proceedings or table of contents",
            InputName = "ConferenceToc",
            InputId = "ConferenceToc",
            IsRequired = true
        };

        public DocumentUploadViewModel ConferencePeerReviewUpload { get; set; } = new()
        {
            LabelText = "Peer review process",
            InputName = "ConferencePeerReview",
            InputId = "ConferencePeerReview",
            IsRequired = true
        };

        public DocumentUploadViewModel ConferencePeerCommentsUpload { get; set; } = new()
        {
            LabelText = "Peer review comments",
            InputName = "ConferencePeerComments",
            InputId = "ConferencePeerComments",
            IsRequired = true
        };

        public DocumentUploadViewModel CommitteeMembersUpload { get; set; } = new()
        {
            LabelText = "Committee members",
            InputName = "CommitteeMembers",
            InputId = "CommitteeMembers",
            IsRequired = true,
            Tooltip = "All committee members for conference."
        };

        public DocumentUploadViewModel ConferenceSupportingDocUpload { get; set; } = new()
        {
            LabelText = "Supporting document",
            InputName = "ConferenceSupportingDoc",
            InputId = "ConferenceSupportingDoc",
            IsRequired = true,
            Tooltip = "Cover page with ISBN, conference title date and venue of conference and editors."
        };
        public DocumentUploadViewModel FqcDeclarationUploadChapter { get; set; } = new()
        {
            InputId = "FqcDeclaration_Chapter",
            InputName = "FqcDeclaration_Chapter",
            LabelText = "FQC-New research declaration",
            IsRequired = true
        };
        public DocumentUploadViewModel FqcDeclarationUploadConference { get; set; } = new()
        {
            InputId = "FqcDeclaration_Conference",
            InputName = "FqcDeclaration_Conference",
            LabelText = "FQC-New research declaration",
            IsRequired = true
        };
        public IFormFile PublishedChapter { get; set; }
        public IFormFile PeerReviewLetterChapter { get; set; }
        public IFormFile PeerReviewCommentsChapter { get; set; }
        public IFormFile ScholarlyMotivationChapter { get; set; }
        public IFormFile LateMotivationChapter { get; set; }
        public IFormFile ConferencePublishedPaper { get; set; }
        public IFormFile ConferenceManuscript { get; set; }
        public IFormFile ConferenceToc { get; set; }
        public IFormFile ConferencePeerReview { get; set; }
        public IFormFile ConferencePeerComments { get; set; }
        public IFormFile CommitteeMembers { get; set; }
        public IFormFile ConferenceSupportingDoc { get; set; }
        public IFormFile FqcDeclaration_Conference { get; set; }
        public IFormFile FqcDeclaration_Chapter { get; set; }
        public List<DocumentUploadViewModel> UploadsToRender { get; set; } = new();
        public List<TempGetResearchOutPutDocument> docs { get; set; }
        public AuthorModel RFAAuthor { get; set; }
    }
}
