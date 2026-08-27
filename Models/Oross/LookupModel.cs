namespace ResearchSuite.Models.Oross
{
    public class LookupDto
    {
        public LookupDto(int lookupId, string lookupName)
        {
            LookupId = lookupId;
            LookupName = lookupName;
        }
        public int LookupId { get; set; }
        public int LookupTypeId { get; set; }
        public string LookupName { get; set; }
        public string LookupCode { get; set; }
        public bool IsActive { get; set; }

    }
}
