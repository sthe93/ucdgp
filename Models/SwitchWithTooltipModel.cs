namespace ResearchSuite.Models
{
    public class SwitchWithTooltipModel
    {
        public string ModelName { get; set; } = "";
        public string InputId { get; set; }
        public string InputName { get; set; }
        public string LabelText { get; set; }
        public string TooltipText { get; set; } // Leave null if no tooltip
        public bool? IsChecked { get; set; } = null;
        public string Text { get; set; } = "";
        public bool IsEditMode { get; set; } 

    }
}
