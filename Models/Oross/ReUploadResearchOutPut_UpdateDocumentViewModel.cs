namespace ResearchSuite.Models.Oross
{
    public class ReUploadResearchOutPut_UpdateDocumentViewModel
    {

        public int ResearchId { get; set; }
        public int DocumentId { get; set; }
        public string CreatedBy { get; set; }
        public byte[] DocumentFile { get; set; }
        public string FileExtension { get; set; }
        public Nullable<int> DocumentTypeID { get; set; }

    }
}
