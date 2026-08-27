namespace ResearchSuite.Models.Oross
{
    public class RFAComment
    {
        public int ResearchIdComment { get; set; }
        public string Comment { get; set; }
        public string CreatedBy { get; set; }

        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string PublicationTitle { get; set; }
        public int ResearchOutPutStatusId { get; set; }
    }
}
