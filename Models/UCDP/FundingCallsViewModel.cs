namespace ResearchSuite.Models.UCDP
{

    public class FundingCallsViewModel
    {
        public List<FundingCallsModel> FundingCalls { get; set; } = [];

        public List<ProjectsViewModel> Projects { get; set; } = [];
        public List<FundingCallStatusViewModel> Statuses { get; set; } = [];
        public List<ProjectCycleViewModel> ProjectCycles { get; set; } = [];

        public string? SearchCallName { get; set; }
        public int? Status { get; set; }

        public DateTime? OpeningDateFilter { get; set; }
        public DateTime? ClosingDateFilter { get; set; }

        public string? StartYear { get; set; }
        public string? EndYear { get; set; }
    }
}
