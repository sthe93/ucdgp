namespace ResearchSuite.Models
{
 public class SubmittedResearchViewModel
    {
       
        public class TempGetResearchOutPutInfo
        {
            public string Username { get; set; }
            public int ResearchId { get; set; }
            public string GuidID { get; set; }
            public int Publication_Year { get; set; }
            public string CESMCode { get; set; }
            public int OutPutType { get; set; }
            public string Research_Output { get; set; }
            public string Author { get; set; }
            public string Publish { get; set; }
            public string CreatedDate { get; set; }
            public string LastChangedDateRFA { get; set; }
            public string LastChangedDate { get; set; }
            //Note the change
            public string ReSubmissionDate { get; set; }
            public string PublicationTitle { get; set; }
            public string Faculty { get; set; }
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

            //adding the SDG
            public string SDG { get; set; }
            public string AmountContributedByInstitutionInSARand { get; set; }
            public string PublicationFeesReason { get; set; }
            public string ScholarlyMotivation { get; set; }
            public string Issue { get; set; }
            public string Volume { get; set; }
            public string DHETIndexed { get; set; }
            public string SpecialCategoryRequired { get; set; }
            public string RFAName { get; set; }
            public string RFASurname { get; set; }
            public string CreatedUsername { get; set; }
        }

        public class TempGetResearchOutPutAuthor
        {
            public int ResearchId { get; set; }
            public string GuidID { get; set; }
            public int AuthorId { get; set; }
            public string LastName { get; set; }
            public string FirstName { get; set; }
            public string Position { get; set; }
            public string Faculty { get; set; }
            public string Department { get; set; }
            public string ORCHID { get; set; }
            public string StaffNumber { get; set; }
            public string StaffUsername { get; set; }
            public bool IsPrimaryAuthor { get; set; }
            public string Email { get; set; }
        }

        public class TempGetResearchOutPutDocument
        {
            public int ViewId { get; set; }
            public int DocumentId { get; set; }
            public int ResearchId { get; set; }
            public string GuidID { get; set; }
            public string DocumentName { get; set; }
            public string DocumentExtention { get; set; }
            public byte[] Document1 { get; set; }
            public string Document { get; set; }
            public string DocumentGuid { get; set; }
        }
        public class ViewResearchOutPutDocument
        {
            public int ViewId { get; set; }
            public int DocumentId { get; set; }
            public int ResearchId { get; set; }
            public string GuidID { get; set; }
            public string DocumentName { get; set; }
            public string DocumentExtention { get; set; }
            public string DocumentGuid { get; set; }

            public byte[] Document { get; set; }
            public string PublicationTitle { get; set; }
        }

        public class TempGetResearchOutPutAffiliatedToOtherSAInstitution
        {
            public int ResearchId { get; set; }
            public string InternalAurthor { get; set; }
            public string StudentStaffNumber { get; set; }
            public string OtherSAInstitution { get; set; }
        }

        public class TempGetResearchOutPutAffiliatedToOtherInternationalInstitution
        {
            public int ResearchId { get; set; }
            public string InternalAurthor { get; set; }
            public string StudentStaffNumber { get; set; }
            public string OtherInternationalInstitution { get; set; }
        }

        public class TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity
        {
            public int ResearchId { get; set; }
            public string InternalAurthor { get; set; }
            public string StudentStaffNumber { get; set; }
            public string OtherSAInstitutionOtherThanUniversity { get; set; }
        }
        public class GetResearchOutPutViewModel
        {
            public List<TempGetResearchOutPutInfo> GetResearchOutPutInfoAll { get; set; }
            public List<TempGetResearchOutPutAuthor> GetResearchOutPutAuthorAll { get; set; }
            public List<TempGetResearchOutPutDocument> GetResearchOutPutDocumentAll { get; set; }
            public List<TempGetResearchOutPutAffiliatedToOtherSAInstitution> GetResearchOutPutAffiliatedToOtherSAInstitutionAll { get; set; }
            public List<TempGetResearchOutPutAffiliatedToOtherInternationalInstitution> GetResearchOutPutAffiliatedToOtherInternationalInstitutionAll { get; set; }
            public List<TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity> GetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversityAll { get; set; }

        }

    }
}
