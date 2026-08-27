namespace ResearchSuite.Models.Ucdp
{
    public class SearchFundingViewModel
    {
                public int FundingCallStatusId { get; set; }
        public DateTime? OpeningDateFilter { get; set; }
        public DateTime? ClosingDateFilter { get; set; }
        public string SearchCallName { get; set; }
        public int ProjectId { get; set; }
    }
}
