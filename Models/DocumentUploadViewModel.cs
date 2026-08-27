namespace ResearchSuite.Models
{
    public class DocumentUploadViewModel
    {
        public string LabelText { get; set; } = "";
        public string InputName { get; set; } = "";
        public string InputId { get; set; } = "";
        public bool IsRequired { get; set; }    
        public string Tooltip { get; set; } = "";
        public string DocName { get; set; } = "";
        public string DocUrl { get; set; } = "";
        public bool IsHidden { get; set; }  
        public string GuidId { get; set; }
        public string ViewId { get; set; }
        public bool IsEditMode { get; set; } 
    }

}
