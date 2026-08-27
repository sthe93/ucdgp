namespace ResearchSuite.Models.Oross
{
    public class ResearchOutPut_DocumentViewModel
    {
        public int ResearchId { get; set; }

        public int Publication_Year { get; set; }
        public string PublicationTitle { get; set; } = string.Empty;

        public string CESMCode { get; set; } = string.Empty;

        public string Funding { get; set; } = string.Empty;

        public int OutPutType { get; set; }

        public string Author { get; set; } = string.Empty;

        public int? SubmitterID { get; set; }

        public string Publish { get; set; } = string.Empty;

        public string DocName { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string Username { get; set; } = string.Empty;

        public string GuidID { get; set; } = string.Empty;

        public string Faculty { get; set; } = string.Empty;

        public string ISSN { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;

        public string Research_Output { get; set; } = string.Empty;

        public string CreatedDate1 { get; set; } = string.Empty;
        public string AdditionalEmailList { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string AuthorList { get; set; } = string.Empty;
        public string NameOfPublicFunder { get; set; } = string.Empty;
        public byte a4IRPublication { get; set; }
        public byte SoTLPublication { get; set; }
        public byte OpenAccess { get; set; }
        public string AnyAdditionalURL { get; set; } = string.Empty;
        public byte PublicationFeesApplicable { get; set; }
        public string PublicationFeeDescription { get; set; } = string.Empty;
        public List<string> PublicationFeesReasonList { get; set; }
        public string PublisherCurrencyName { get; set; } = string.Empty;
        public decimal TotalCostOfPublishingArticle { get; set; }
        public decimal? AmountContributedByInstitution { get; set; }
        public string ConferenceName { get; set; } = string.Empty;
        public decimal? AmountContributedByInstitutionInSARand { get; set; }
        public string SDG { get; set; } = string.Empty;
        public string Volume { get; set; }
        public string Issue { get; set; }
        public byte SpecialCategoryRequired { get; set; }
        public byte DHETIndexed { get; set; }
    }
}
