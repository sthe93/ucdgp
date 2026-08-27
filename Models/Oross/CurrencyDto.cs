namespace ResearchSuite.Models.Oross
{
    public class CurrencyDto
    {
        public CurrencyDto(string code, string name)
        {
            this.PublisherCurrencyName = name;
            this.PublisherCurrencyCode = code;
        }
        public string PublisherCurrencyCode { get; set; } = "";
        public string PublisherCurrencyName { get; set; } = "";
    }
}
