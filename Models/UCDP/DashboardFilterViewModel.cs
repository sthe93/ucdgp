namespace ResearchSuite.Models.UCDP
{
    public class DashboardFilterViewModel
    {
        public string Prefix { get; set; } = "";
        public string SearchPlaceholder { get; set; } = "Ref #, funding call, project, applicant, status...";

        public string SearchId => $"q{Prefix}";
        public string StatusId => $"status{Prefix}";
        public string ApplyButtonId => $"btnApply{Prefix}";
        public string ClearButtonId => $"btnClear{Prefix}";
        public string TableId => $"tbl{Prefix}";
    }
}