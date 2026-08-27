namespace ResearchSuite.Models.Oross
{
    public class SubmitResearchRequestDto
    {
        public ResearchOutPut_DocumentViewModel OutPut { get; set; }
        public List<PreviewDocumentViewModel> Documents { get; set; }
        public List<ResearchOutPut_OtherInstitutions> OtherInstitutions { get; set; }
    }
}
