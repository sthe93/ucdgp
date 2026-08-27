namespace ResearchSuite.Models
{
    public class TempScopeSessionVm
    {
        public int RoleId { get; set; }
        public string RoleType { get; set; } = "";
        public List<int> UcdgApplicationIds { get; set; } = new();
    }

}
