namespace ResearchSuite.Models.UCDP.Shared
{
    public class StepWizardButtonsViewModel
    {
        public string CloseButtonId { get; set; } = "btnClose";
        public string NextButtonId { get; set; } = "btnNext";

        public string BackButtonId { get; set; } = "btnBack";
        public string BackButtonClass { get; set; } = "";
        public string NextButtonClass { get; set; } = "";

        public bool ShowBackButton { get; set; } = true;
        public bool IsViewMode { get; set; } = false;

        public string NextButtonText => IsViewMode ? "Next" : "Save and Continue";
    }
}