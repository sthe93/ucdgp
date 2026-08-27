using System.Web;

namespace ResearchSuite.Models.Oross
{
    public class ReUploadDocumentViewModel
    {
        public string GuidID { get; set; }
        public string ViewId { get; set; }
        public IFormFile ReuploadFile { get; set; }
        public int  DocumentId { get; set; }
        public int ResearchId { get; set; }

    }
}
