namespace ResearchSuite.Models.UCDP
{
    public class ReadDocumentSignOffViewModel
    {
        public int DocumentSignOffID { get; set; }
        public int UserId { get; set; }

        public string UserFullName { get; set; }
        public string DocumentType { get; set; }
        public DateTime SignedDate { get; set; }
        public string UserRoleName { get; set; }
        public string ReferenceNumber { get; set; }
        public int ApplicationId { get; set; }
    }
}
