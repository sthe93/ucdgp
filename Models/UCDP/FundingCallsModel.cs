using Microsoft.AspNetCore.Mvc.Rendering;

namespace ResearchSuite.Models.UCDP
{
    public class FundingCallsModel
    {

        public int Id { get; set; }
        public string FundingCallName { get; set; }
        public string ProjectName { get; set; }
        public string ShortDescription { get; set; }
        public string FundingBudget { get; set; }
        public decimal? FundingBudgetAvailable { get; set; }
        public DateTime OpeningDate { get; set; }
        public DateTime? AmendedClosingDate { get; set; }
        public DateTime ClosingDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int Status { get; set; }
        public FundingCallStatusViewModel FundingCallStatus { get; set; }
        public string[] ProjectId { get; set; }
        public int? ApplicationId { get; set; }

        public List<SelectListItem> ProjectNamesList { get; set; }

        public List<ProjectsViewModel> FundingCallProjects { get; set; }

        public bool CanApply { get; set; }

        public bool CanViewDetails { get; set; }

        public bool CanContinue { get; set; }

        public bool IsFundAdministrator { get; set; }

        public bool LimitReached { get; set; }
        public bool HasPreviousFunding { get; set; }
        public PreviousFundingViewModel LastPreviousFunding { get; set; }
        public List<PreviousFundingViewModel> OutstandingPreviousFunding { get; set; } = new();
        public bool HasOutstandingProgressReport { get; set; }
        public bool IsSystemClosureActive { get; set; }
        public int OutstandingPreviousReportFundingCallId { get; set; }
        public int OutstandingPreviousReportApplicationId { get; set; }
    }

    public class UpdateFundingCallClosingDate
    {
        public int FundingCallId { get; set; }
        public int UserId { get; set; }
        public DateTime ClosingDate { get; set; }

    }

    public class UpdateFundingCallBudgetRequest
    {
        public int FundingCallId { get; set; }
        public int UserId { get; set; }
        public string FundingBudget { get; set; }
    }

    public class UpdateSystemClosureRequest
    {
        public int? Id { get; set; }
        public DateTime ClosureDateTime { get; set; }
        public int UserId { get; set; }
    }

    public class SystemClosureStatusResponse
    {
        public int? Id { get; set; }
        public DateTime? ClosureDateTime { get; set; }
        public bool IsClosureActive { get; set; }
        public bool IsProcessed { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}
