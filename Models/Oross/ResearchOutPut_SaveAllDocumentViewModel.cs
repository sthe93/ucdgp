namespace ResearchSuite.Models.Oross
{
   public class ResearchOutPut_SaveAllDocumentViewModel
    {
        public int ResearchId { get; set; }
        public string CreatedBy { get; set; }
        public byte[] DocumentFile { get; set; }
        public string FileExtension { get; set; }
        public Nullable<int> DocumentTypeID { get; set; }

    }

    public class ResearchOutPut_UpdateDocumentViewModel
    {
        public int ResearchId { get; set; }
        public int DocumentId { get; set; }
        public string CreatedBy { get; set; }
        public byte[] DocumentFile { get; set; }
        public string FileExtension { get; set; }
        public Nullable<int> DocumentTypeID { get; set; }

    }

    //RFA comment class
    public class AddCommentFor_RFAViewModel
    {
        public string Comment { get; set; }
        public int ResearchIdComment { get; set; }
        public string CreatedBy { get; set; }
        public string PublicationTitle { get; set; }
        //public string FirstName { get; set; }
        //public string LastName { get; set; }
    }


    public class SaveTempDocumentViewModel
    {
        public string DocumentName { get; set; }
        public string DocumentExtension { get; set; }
        public byte[] Document { get; set; }
        public string CreatedBy { get; set; }
        public int DocumentTypeId { get; set; }
    }
}
