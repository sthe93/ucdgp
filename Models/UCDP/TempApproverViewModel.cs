namespace ResearchSuite.Models.UCDP
{
    public class TempApproverViewModel
    {
        public int TemporaryUserRoleId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public int ApplicationId { get; set; }

        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
    }
}
