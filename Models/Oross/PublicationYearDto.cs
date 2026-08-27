namespace ResearchSuite.Models.Oross
{
    public class PublicationYearDto
    {
        public PublicationYearDto(int id,string years)
        {
            this.Id = id;
            this.Years = years;
        }
        public int Id { get; set; }
        public string Years { get; set; } = string.Empty;
    }
}
