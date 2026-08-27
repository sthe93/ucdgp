namespace ResearchSuite.Models.Oross
{
    public class ResearchOutputTypeDto
    {
        public ResearchOutputTypeDto(int outputTypeId, string description, string checkList)
        {
            this.OutputTypeId = outputTypeId;
            this.Description = description;
            this.CheckList = checkList;
        }
        public int OutputTypeId { get; set; }
        public string Description { get; set; }
        public string CheckList { get; set; }
    }
}
