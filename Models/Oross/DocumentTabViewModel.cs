namespace ResearchSuite.Models.Oross
{
    public class DocumentTabViewModel
    {
        public List<DocumentUploadViewModel> Documents { get; set; }= new List<DocumentUploadViewModel>();
        public string SelectedResearchType { get; set; } = "";
    }

}
