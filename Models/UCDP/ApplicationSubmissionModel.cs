namespace ResearchSuite.Models.UCDP
{
    public class ApplicationSubmissionModel
    {
        public int ApplicationId { get; set; }
        public bool? FlightsChooseCheapest { get; set; }
        public string FlightsCheapestExplanation { get; set; }
        public bool? AccomChooseCheapest { get; set; }
        public string AccomCheapestExplanation { get; set; }

        public string FinancialMotivation { get; set; }
        public string ApplicantProgress { get; set; }
        public string OutputMeasure { get; set; }

        public string OtherFunding { get; set; }
        public string FacultyContibution { get; set; }
        public string DepartmentContribution { get; set; }
        public string ResearchFundsContribution { get; set; }
        public string DHETFundsRequested { get; set; }
        public string TotalCost { get; set; }
        public string FundAdminApprovedAmount { get; set; }
        public string ApprovedAmount { get; set; }
        public string OtherFundingSource { get; set; }
    }
}
