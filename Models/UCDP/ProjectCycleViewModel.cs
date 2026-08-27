namespace ResearchSuite.Models.UCDP
{
    public class ProjectCycleViewModel
    {
        public int Id { get; set; }
        public string Period { get; set; } // e.g. "2022-2024"
        public bool IsActive { get; set; }
    }
}
