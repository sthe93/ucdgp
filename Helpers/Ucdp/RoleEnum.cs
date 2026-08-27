using System.ComponentModel;

namespace ResearchSuite.Helpers.Ucdp
{
    public enum RoleEnum
    {
        [Description("Applicant")]
        Applicant = 1,

        [Description("HOD")]
        HOD = 2,

        [Description("Executive / Vice Dean")]
        ViceDean = 3,

        [Description("Fund Administrator")]
        FundAdministrator = 4,

        [Description("SIA Director")]
        SIADirector = 5,

        [Description("Financial Business Partner")]
        FinancialBusinessPartner = 6,

        [Description("Academic Director")]
        AcademicDirector = 7,

        [Description("Temporary Approver")]
        TemporaryApprover = 8
    }
}
