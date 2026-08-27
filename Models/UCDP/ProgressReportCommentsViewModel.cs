namespace ResearchSuite.Models.UCDP
{
    public class ProgressReportCommentsViewModel
    {
        public int Id { get; set; }
        public int ProgressReportId { get; set; }
        public int UserId { get; set; }
        public string Comment { get; set; }
        public string AddedBy { get; set; }
        public string? DisplayName { get; set; }
    }
}
