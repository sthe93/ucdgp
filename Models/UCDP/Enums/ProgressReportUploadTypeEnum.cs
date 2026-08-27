using System.ComponentModel;

namespace ResearchSuite.Models.UCDP.Enums
{
    public enum ProgressReportUploadTypeEnum
    {
        [Description("Proof Of Registration")]
        ProofOfReg = 1,

        [Description("Supervisor Progress Report")]
        SupervisorReport = 2,

        [Description("Proof Of Graduation")]
        ProofOfGraduation = 3,

        [Description("Supervisor Graduation Letter")]
        SupervisorGraduationLetter = 4,

        [Description("Proof Of Appointment")]
        ProofOfAppointment = 5,

        [Description("Source Of Evidence")]
        SourceOfEvidence = 6,

        [Description("Collaborative Source Of Evidence")]
        CollaborativeSourceOfEvidence = 7,

        [Description("Financial Report")]
        FinancialReport = 8,

        [Description("Flight Quote")]
        FlightQuote = 9,

        [Description("Accomodation Quote")]
        AccomodationQuote = 10,

        [Description("Motivation Letter")]
        MotivationLetter = 11
    }
}
