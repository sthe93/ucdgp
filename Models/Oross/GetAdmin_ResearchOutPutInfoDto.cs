namespace ResearchSuite.Models.Oross
{
    public class GetAdmin_ResearchOutPutInfoDto
    {

        public string Username { get; set; }
   
        public Nullable<System.DateTime> SearchDate { get; set; }

        public int ResearchId { get; set; }
        public string GuidID { get; set; }
        public int Publication_Year { get; set; }
        public string CESMCode { get; set; }
        public int OutPutType { get; set; }
        public string Research_Output { get; set; }
        public string Author { get; set; }
        public string Publish { get; set; }
        public string CreatedDate { get; set; }
        // Amendede On Date Field
        public string LastChangedDate { get; set; }
        public string PublicationTitle { get; set; }
        public string Faculty { get; set; }
        public string RFAstatus { get; set; } // note the change
        // Adding the SGD
        public string SDG { get; set; }
        public string ISSN { get; set; }
        public string DepartmentName { get; set; }
        public string CreatedBy { get; set; }
        public string NameOfPublicFunder { get; set; }
        public string a4IRPublication { get; set; }
        public string SoTLPublication { get; set; }
        public string OpenAccess { get; set; }
        public string AnyAdditionalURL { get; set; }
        public string PublicationFeesApplicable { get; set; }
        public string PublicationFeeDescription { get; set; }
        public string PublisherCurrencyCode { get; set; }
        public string PublisherCurrencyName { get; set; }
        public string TotalCostOfPublishingArticle { get; set; }
        public string AmountContributedByInstitution { get; set; }
        public string ConferenceName { get; set; }
        public string AmountContributedByInstitutionInSARand { get; set; }
        public string PublicationFeesReason { get; set; }
        public string PrimaryAuthor { get; set; }

    }
}

