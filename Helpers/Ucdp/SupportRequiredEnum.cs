using System.ComponentModel;

namespace ResearchSuite.Helpers.Ucdp
{
    public enum SupportRequiredEnum
    {
        [Description("Teaching Relief")]
        TeachingRelief = 1,

        [Description("Research Assistance")]
        ResearchAssistance = 2,

        [Description("Financial Support")]
        FinancialSupport = 3,

        [Description("Replacement by temporary lecturer")]
        ReplacementByTemporaryLecturer = 4,

        [Description("Teaching assistance from senior tutor OR tutor")]
        TeachingAssistance = 5,

        [Description("Teaching assistance from tutor")]
        TeachingTutor = 6,

        [Description("Lecturer")]
        Lecturer = 7,

        [Description("DHET accredited")]
        DHETAccredited = 8,

        [Description("Research development workshops")]
        ResearchDevelopmentWorkshops = 9,
    }
}
