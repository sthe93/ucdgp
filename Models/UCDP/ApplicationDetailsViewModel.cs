using System.ComponentModel.DataAnnotations;
using ResearchSuite.Models.Oross;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Models.UCDP.Shared;

namespace ResearchSuite.Models.UCDP
{
    public class ApplicationDetailsViewModel
    {
        public int Id { get; set; }
        public ReadUserViewModelResource UserDetails { get; set; }
        public FundingCallsModel FundingCallDetails { get; set; }
        public ReadDocumentSignOffViewModel ReadDocumentSignOffViewModel { get; set; }
        public string FundingCallDetailName { get; set; }
        public int FundingCallDetailsId { get; set; }
        public int ApplicationStatusId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
        public int FundingCallsId { get; set; }
        public DateTime FundingStartDate { get; set; }
        public DateTime FundingEndDate { get; set; }
        public string FundingStartDateValue { get; set; }
        public string FundingEndDateValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ApplicantCategory { get; set; }
        public string AppointmentCategory { get; set; }
        public string LastSavedStep { get; set; }

        //Select Projects Step
        public string[] ProjectId { get; set; }

        //Improvement of Staff Qualifications Step
        [Display(Name = "Studying towards")]
        public string StudyingTowards { get; set; }
        [Display(Name = "Year of 1st registration")]
        public string FirstYearRegistration { get; set; }
        [Display(Name = "Planned graduation year")]
        public string PlannedGraduationYear { get; set; }
        [Display(Name = "Brief description of your research or qualification")]
        public string Describe { get; set; }
        public string AppointmentDescribe { get; set; }
        [Display(Name = "Nature of support required")]
        public string[] SupportRequired { get; set; }
        public string supportRequiredItem { get; set; }
        public string[] AppointmentOption { get; set; }
        public string appointmentItem { get; set; }

        //ApplicationsProjects
        public List<ApplicationsProjectsViewModel> SelectedProjects { get; set; }

        //ApplicationsSupportRequired
        public List<ApplicationSupportRequiredViewModel> SelectedSupportRequired { get; set; }

        //Improving staff research productivity, innovation and quality
        public string[] FinancialSupport { get; set; }
        public string financialSupportItem { get; set; }

        //Career Development
        public string[] CareerFinancialSupport { get; set; }
        public string careerFinancialSupportItem { get; set; }
        public string[] CareerTeachingRelief { get; set; }
        public string careerTeachingReliefItem { get; set; }

        //Final Step
        public string FinancialMotivation { get; set; }
        public string ApplicantProgress { get; set; }
        public string OutputMeasure { get; set; }
        public string OtherFunding { get; set; }
        public string FacultyContibution { get; set; }
        public string DepartmentContribution { get; set; }
        public string ResearchFundsContribution { get; set; }
        public string DHETFundsRequested { get; set; }
        public string TotalCost { get; set; }
        public List<UploadDocumentViewModel> UploadedDocs { get; set; }
        public string ReferenceNumber { get; set; }
        public Guid ReferenceId { get; set; }
        public bool IsSIADirector { get; set; }
        public bool IsFBP { get; set; }
        public bool IsFA { get; set; }
        public bool IsHOD { get; set; }
        public bool IsVD { get; set; }
        public string CurrentUserRole { get; set; }
        public string ApprovedAmount { get; set; }
        public string FundAdminApprovedAmount { get; set; }
        public string FundAdminComment { get; set; }
        public string SIAComment { get; set; }
        public string LastModifierUsername { get; set; }
        public string SiaDirectorsName { get; set; }
        public string SiaDirectorsLastName { get; set; }
        public string SiaDirectorsTitle { get; set; }
        public bool IsAcknowledge { get; set; }
        public DateTime LastModifiedDate { get; set; }

        public string CostCentreName { get; set; }
        public string CostCentreNumber { get; set; }
        public string PreviousFundingYear { get; set; }
        public string PreviousFundingAmount { get; set; }
        public string PreviousFundingOutcome { get; set; }

        public string PreviousFunding { get; set; }
        public List<PreviousFundingViewModel> previousFundingViewModel { get; set; }

        [Display(Name = "Field of study")]
        public string FieldOfStudy { get; set; }
        [Display(Name = "Title of thesis")]
        public string TitleOfThesis { get; set; }

        public DocumentUploadSectionViewModel Project1ProofOfRegistrationUpload { get; set; }
        public DocumentUploadSectionViewModel Project1SupervisorLetterUpload { get; set; }
        public DocumentUploadSectionViewModel Project1CostBreakdownUpload { get; set; }
        public DocumentUploadSectionViewModel Project1TeachingReliefUpload { get; set; }
        public DocumentUploadSectionViewModel Project1ResearchAssistanceUpload { get; set; }
        public DocumentUploadSectionViewModel Project1FinancialSupportUpload { get; set; }

        public DocumentUploadSectionViewModel Project5ProofOfInvitationUpload { get; set; }
        public DocumentUploadSectionViewModel Project5AccommodationUpload { get; set; }
        public DocumentUploadSectionViewModel Project5FlightsUpload { get; set; }
        public DocumentUploadSectionViewModel Project5OtherCostsUpload { get; set; }
        public DocumentUploadSectionViewModel Project5TotalCostBreakdownUpload { get; set; }
        public DocumentUploadSectionViewModel MotivationLetterUpload { get; set; }

        public List<TemporaryAppointeeViewModel> TemporaryAppointees { get; set; } = new List<TemporaryAppointeeViewModel>();
        public List<PaymentsViewModel> Payments { get; set; } = new List<PaymentsViewModel>();
        public SwitchWithTooltipModel AccomChooseCheapestModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "AccomChooseCheapestModel.IsChecked",
            InputId = "AccomChooseCheapest",
            InputName = "AccomChooseCheapest",
            LabelText = " Are you choosing the cheapest of the three quotes?",
            //TooltipText = "Indicates if this publication is open access, freely available to the public.",
            IsChecked = null
        };

        public SwitchWithTooltipModel FlightsChooseCheapestModel { get; set; } = new SwitchWithTooltipModel()
        {
            ModelName = "FlightsChooseCheapestModel.IsChecked",
            InputId = "FlightsChooseCheapest",
            InputName = "FlightsChooseCheapest",
            LabelText = " Are you choosing the cheapest of the three quotes?",
            //TooltipText = "Indicates if this publication is open access, freely available to the public.",
            IsChecked = null
        };
        public bool? FlightsChooseCheapest { get; set; }
        public string FlightsCheapestExplanation { get; set; }
        public bool? AccomChooseCheapest { get; set; }
        public string AccomCheapestExplanation { get; set; }
        public string OtherFundingSource { get; set; }
        public string CurrentApproverStaffNumber { get; set; }
        public decimal? FundingBudgetAvailable { get; set; }
        public List<TempApproverViewModel> TemporaryApproverViewModel { get; set; }
        public List<PaymentsViewModel> CareerDevelopmentPayments { get; set; }
    }
}
