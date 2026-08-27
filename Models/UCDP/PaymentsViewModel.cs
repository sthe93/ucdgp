namespace ResearchSuite.Models.UCDP
{
    public class PaymentsViewModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public decimal NumberOfWeeks { get; set; }
        public decimal HoursPerWeek { get; set; }
        public decimal TotalNumberOfHours { get; set; }
        public decimal RatePerHour { get; set; }
        //public string RatePerHour2 { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthTotal { get; set; }
        public int ApplicationsId { get; set; }
        public string Step { get; set; }
    }
}
