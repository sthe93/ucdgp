namespace ResearchSuite.Models.Oross
{
    public class SubmitResearchResponseDto
    {
        public int ReserachId { get; set; }
        public List<DocumentModel> NewDocuments { get; set; } = [];
        public bool Successful { get; set; }
        public string Message { get; set; }
    }
}
