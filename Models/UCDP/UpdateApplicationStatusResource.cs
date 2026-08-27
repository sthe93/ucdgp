namespace ResearchSuite.Models.UCDP
{
    public class UpdateApplicationStatusResource
    {
        public string CurrentUsername { get; set; }
        public int UserId { get; set; }
        public Guid ReferenceId { get; set; }
        public int UpdateStatus { get; set; }
        public string RoleName { get; set; }
        public string StatusName { get; set; }
        public int ApplicationId { get; set; }
        public string ApprovedAmount { get; set; }
        public string FundAdminApprovedAmount { get; set; }
        public string FundAdminComment { get; set; }
        public string SIAComment { get; set; }
        public string CurrentApproverStaffNumber { get; set; }
        public int ApplicationStatusId { get; set; }
        public string DeclineComment { get; set; }
        public int FundingCallsId { get; set; }
        public string IsTemporaryHODApprover { get; set; }
        public string IsTemporaryViceDeanApprover { get; set; }
        public string IsTemporaryFundAdminApprover { get; set; }
        public string IsTemporarySiaDirectorApprover { get; set; }

    }
}
