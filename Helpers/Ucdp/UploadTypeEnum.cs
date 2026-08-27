using System.ComponentModel;

namespace ResearchSuite.Helpers.Ucdp
{
    public enum UploadTypeEnum
    {
        [Description("Proof Of Registration")]
        ProofOfReg = 1,

        [Description("Supervisor Letter")]
        SupervisorLetter = 2,

        [Description("Relief Documents")]
        ReliefDocuments = 3,

        [Description("Invoice")]
        Invoice = 4,

        [Description("Language Binding")]
        LanguageBinding = 5,

        [Description("Statistical Analysis")]
        StatisticalAnalysis = 6,

        [Description("Focus Groups")]
        FocusGroups = 7,

        [Description("Accommodation")]
        Accommodation = 8,

        [Description("Flights")]
        Flights = 9,

        [Description("Car Rental")]
        CarRental = 10,

        [Description("Other Cost")]
        OtherCost = 11,

        [Description("Mobility Programmes")]
        MobilityProgrammes = 12,

        [Description("Improving Staff Research Productivity Conference")]
        ImprovingStaffResearch = 13,

        [Description("Career Development Invite")]
        CareerDevelopmentInvite = 14,

        [Description("Career Development Teaching")]
        CareerDevelopmentTeaching = 15,

        [Description("Career Development Workshop")]
        CareerDevelopmentWorkshop = 16,

        [Description("Improving Staff Research Productivity Invite")]
        ImproveResearchInvite = 17,

        [Description("Research Assistance")]
        ResearchAssistance = 18,

        [Description("Financial Support")]
        FinancialSupport = 19,

        [Description("Mobility Programmes Accommodation")]
        MobilityProgrammesAccommodation = 20,

        [Description("Mobility Programmes Flight")]
        MobilityProgrammesFlight = 21,

        [Description("Mobility Programmes Other Costs")]
        MobilityProgrammesOtherCosts = 22,

        [Description("Research Career Accommodation")]
        ResearchCareerAccommodation = 23,

        [Description("Workshop Accommodation")]
        WorkshopAccommodation = 24,
        [Description("Total Cost Breakdown")]
        TotalCostBreakdown = 25,
        [Description("Mobility Programmes TotalCost Brakedown")]
        MobilityProgrammesTotalCostBrakedown = 26,

        [Description("Research Career Flights")]
        ResearchCareerFlights = 27,

        [Description("Research Career Other Costs")]
        ResearchCareerOtherCosts = 28,

        [Description("Research Career Total Cost Breakdown")]
        ResearchCareerTotalCostBreakdown = 29,

                [Description("Motivation Letter")]
        MotivationLetter = 30,

        
    }
}
