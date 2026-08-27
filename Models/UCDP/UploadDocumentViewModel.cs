namespace ResearchSuite.Models.UCDP
{
    public class UploadDocumentViewModel
    {
        public int Id { get; set; }
        public string Filename { get; set; }
        public string UploadType { get; set; }
        public string DocumentExtention { get; set; }
        public byte[] DocumentFile { get; set; }
        public int? ApplicationId { get; set; }
        public string DocUrl { get; set; } = "";
    }



        public class UploadMotivationaletterDocumentViewModel
    {
        public int Id { get; set; }
        public string Filename { get; set; }
        public string UploadType { get; set; }
        public string DocumentExtention { get; set; }
        public byte[] DocumentFile { get; set; }
        public int? ApplicationId { get; set; }
        public int? FundingCallId { get; set; }
        public int? UserId { get; set; }
         public int DocumentId { get; set; }
        public DateTime DateAdded { get; set; }
      
     
    }
}
