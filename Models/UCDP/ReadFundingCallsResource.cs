using System.ComponentModel.DataAnnotations.Schema;

namespace ResearchSuite.Models.UCDP
{
    public class ReadFundingCallsResource
    {
        public int Id { get; set; }
        public string FundingCallName { get; set; }
        public string FundingBudget { get; set; }
        public string ShortDescription { get; set; }
        public DateTime OpeningDate { get; set; }
        public DateTime ClosingDate { get; set; }
        public DateTime? AmendedClosingDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public ReadFundingCallStatusResource FundingCallStatus { get; set; }
        [NotMapped]
        public string[] ProjectId { get; set; }
        public List<ProjectsV2> FundingCallProjects { get; set; }
    }

    public class ProjectsV2
    {
        public int Id { get; set; }
        public string ProjectName { get; set; }
        public ReadProjectCyclesResource ProjectCycles { get; set; }
        public bool IsActive { get; set; }
        [NotMapped]
        public string ProjectCycleId { get; set; }

    }
}
