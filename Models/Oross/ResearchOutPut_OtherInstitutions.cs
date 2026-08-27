namespace ResearchSuite.Models.Oross
{
    public class ResearchOutPut_OtherInstitutions
    {
        public OtherInstitutionType? OtherInstitutionType { get; set; }
        public int ResearchId { get; set; }
        public string InternalAurthor { get; set; }
        public string StudentStaffNumber { get; set; }
        public string InstitutionName { get; set; }
    }

    public enum OtherInstitutionType
    {
        OtherSAInstitution = 1,
        InternationalInstitution,
        SAInstitutionOtherThanUniversity
    }
}
