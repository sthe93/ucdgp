namespace ResearchSuite.Dtos
{
    public class GetResearchOutPut_DocumentDto
    {
        public int ViewId { get; set; }
        public int DocumentId { get; set; }
        public int ResearchId { get; set; }
        public string GuidID { get; set; }
        public string DocumentGuid { get; set; }
        public string DocumentName { get; set; }
        public string DocumentExtention { get; set; }
        public byte[] Document { get; set; }
        public string PublicationTitle { get; set; }
        public int? DocumentTypeID { get; set; }
    }
}
