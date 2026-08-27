namespace ResearchSuite.Models.Oross
{
    public class SubmissionFilter
    {
        public string Username { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Faculty { get; set; } = "";
        public string Role { get; set; } = "";
        public string SubmissionsType { get; set; } = ""; // "0" (all), "1" (mine), "2" (on behalf)
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Sdg { get; set; }
        public string? GlobalSearchTerm { get; set; }
        public int ResearchType { get;  set; }
        public NewSubmissionViewModel submissionViewModel { get; set; }
    }


}
