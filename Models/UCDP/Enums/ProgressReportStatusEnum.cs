using System.ComponentModel;

namespace ResearchSuite.Models.UCDP.Enums
{
    public enum ProgressReportStatusEnum
    {
        [Description("New")]
        New = 1,

        [Description("Finalized")]
        Finalize = 2,

        [Description("RFI")]
        RFI = 3
    }
}
