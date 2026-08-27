namespace ResearchSuite.Models.Oross
{
    public class PublicationFeesReasonDto
    {
        public PublicationFeesReasonDto(int publicationFeesReasonId, string publicationFeesReasonName)
        {
            this.PublicationFeesReasonId = publicationFeesReasonId;
            this.PublicationFeesReasonName = publicationFeesReasonName;
        }
        public int PublicationFeesReasonId { get; set; }
        public string PublicationFeesReasonName { get; set; } = string.Empty;
    }
}
