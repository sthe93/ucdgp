namespace ResearchSuite.Models.Oross
{
    public class PreviewDocumentViewModel
    {
        public string DocumentName { get; set; } = string.Empty;
        public string DocumentExtension { get; set; } = string.Empty;
        public byte[] Document { get; set; } = [];
        public string CreatedBy { get; set; } = string.Empty;
        public int DocumentTypeId { get; set; }
    }

    public class DocumentValidation
    {
        public DocumentValidation(bool valid, string fileName)
        {
            this.Valid = valid;
            this.FileName = fileName;
        }

        public bool Valid { get; set; }
        public string FileName { get; set; }
    }
}
