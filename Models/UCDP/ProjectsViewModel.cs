namespace ResearchSuite.Models.UCDP
{
    public class ProjectsViewModel
    {
        public int Id { get; set; }
        public string ProjectName { get; set; }

        public string ProjectCycleId { get; set; }
        public ProjectCyclesViewModel ProjectCycles { get; set; }

        public bool IsActive { get; set; }
    }
}
