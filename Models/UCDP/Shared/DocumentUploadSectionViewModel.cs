
namespace ResearchSuite.Models.UCDP.Shared
{
    public class DocumentUploadSectionViewModel
    {
        public string SectionId { get; set; } = string.Empty;
        public string LabelText { get; set; } = string.Empty;
        public string InputId { get; set; } = string.Empty;
        public string InputName { get; set; } = string.Empty;
        public string UploadButtonId { get; set; } = string.Empty;
        public string TableId { get; set; } = string.Empty;
        public string UploadUrl { get; set; } = string.Empty;
        public string? Tooltip { get; set; }

        public bool IsRequired { get; set; }
        public bool IsHidden { get; set; }
        public bool IsMultiple { get; set; }

        public int MaxFiles { get; set; } = 1;
        public string AcceptedFileTypes { get; set; } = ".pdf";
        public string UploadType { get; set; } = string.Empty;

        public List<UploadDocumentViewModel> ExistingDocuments { get; set; } = new();
    }
}
