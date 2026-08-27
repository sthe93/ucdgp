using ResearchSuite.Models.Oross;

namespace ResearchSuite.Dtos.Oross
{
    public class SendEmailReqeustDto
    {
        public int ResearchId { get; set; }
        public bool OwnWork { get; set; }
        public int FacultyLookupCode { get; set; }
        public List<AuthorModel> Authors { get; set; } = new List<AuthorModel>();
        public List<string> EmailList { get; set; } = new List<string>();
        public string SubmitterUsername { get; set; } = string.Empty; 
        public List<DocumentModel> NewDocuments { get; set; } = new List<DocumentModel>();
        public string DisclaimerOption { get; set; } = string.Empty;
        public bool IsResubmissionEmail { get; set; }
    }
}
