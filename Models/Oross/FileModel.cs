namespace ResearchSuite.Models.Oross
{
    public class FileModel
    {
        public FileModel(DocumentType documentType, IFormFile file,string inputId = null)
        {
            DocumentType = (int)documentType;
            File = file;
            InputId = inputId;
        }
        public int DocumentType { get; set; }
        public IFormFile File { get; set; }
        public string InputId { get; set; }
    }

    public enum DocumentType
    {
        Research = 1,
        ManuScript,
        SupportingDocument,
        TableofContent,
        PeerReviewProcess,
        PeerReviewComments,
        LateMotivationLetter,
        CommitteeMembers,
        ScholarlyMotivation,
        DhetLetter,
        FqcDeclaration, 
    }
}
