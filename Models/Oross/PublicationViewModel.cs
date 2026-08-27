namespace ResearchSuite.Models.Oross
{
    public class Amendment_PublicationViewModel
    {
        public int ResearchId { get; set; }
        public int PublicationYear { get; set; }
        public string PublicationTitle { get; set; }
        public string Faculty { get; set; }
        public string SDG { get; set; }
        public string ISSN { get; set; }
        public string DepartmentName { get; set; }
        public string NameOfPublicFunder { get; set; }
        public string a4IRPublication { get; set; }
        public string SoTLPublication { get; set; }
        public string AnyAdditionalURL { get; set; }
        public string ConferenceName { get; set; }
        public string CreatedBy { get; set; }
        public List<PreviewDocumentViewModel> Documents { get; set; } = [];
    }
    public class PublicationViewModel
      {
            public string UserName { get; set; } // Note this change
            public int ResearchId { get; set; }
            public int Publication_Year { get; set; }
            public string Publication_Title { get; set; }
            public string CESMCode { get; set; }
            public string Author { get; set; }
            public int OutputType { get; set; }
            public string DocName { get; set; }
            //public HttpPostedFileBase ResearchFile { get; set; }
            public IFormFile  ResearchFile { get; set; }
            public IFormFile  ManuScriptFile { get; set; }
            public IFormFile  SupportingDocFile { get; set; }
            public IFormFile  TableOfContentFile { get; set; }
            public IFormFile  PeerReviewProcessFile { get; set; }
            public IFormFile  PeerReviewCommentsFile { get; set; }
            public IFormFile  LateMotivationLetterFile { get; set; }
            public IFormFile  CommitteeMembersFile { get; set; }
            public IFormFile  ScholarlyMotivationFile { get; set; }
            public DateTime CreatedDate { get; set; }
            public string GuidId { get; set; }
            public string Faculty { get; set; }
            //Added property in the model
            public string SDG { get; set; }
            public string ISSN { get; set; }
            public string DepartmentName { get; set; }
            public string ResearchFileName { get; set; }
            public string ManuScriptFileName { get; set; }
            public string SupportingFileName { get; set; }
            public string TableOfContentFileName { get; set; }
            public byte[] ResearchDoc { get; set; }
            public byte[] ManuScriptDoc { get; set; }
            public byte[] SupportingDoc { get; set; }
            public byte[] TableOfContentDoc { get; set; }
            public string ResearchDocExtention { get; set; }
            public string ManuScriptDocExtention { get; set; }
            public string SupportingDocExtention { get; set; }
            public string TableOfContentDocExtention { get; set; }
            public string[] EmaiSendList { get; set; }

            //New fields
            public string[] PublicationFeesReasonList { get; set; }
            public string NameOfPublicFunder { get; set; }
            public string a4IRPublication { get; set; }
            public string SoTLPublication { get; set; }
            public string[] AffiliatedToOtherSAInstitutionList { get; set; }
            public string[] AffiliatedToOtherInternationalInstitutionList { get; set; }
            public string[] AffiliatedToOtherSAInstitutionOtherThanUniversityList { get; set; }
            public List<AffiliatedToOtherSAInstitution> AffiliatedToOtherSAInstitutionData { get; set; }
            public List<AffiliatedToOtherInternationalInstitution> AffiliatedToOtherInternationalInstitutionData { get; set; }
            public List<AffiliatedToOtherSAInstitutionOtherThanUniversity> AffiliatedToOtherSAInstitutionOtherThanUniversityData { get; set; }
            public string OpenAccess { get; set; }
            public string AnyAdditionalURL { get; set; }
            public string PublicationFeesApplicable { get; set; }
            public string PublicationFeeDescription { get; set; }
            public string PublisherCurrencyName { get; set; }
            public string TotalCostOfPublishingArticle { get; set; }
            public string AmountContributedByInstitution { get; set; }
            public string ConferenceName { get; set; }
            public string AmountContributedByInstitutionInSARand { get; set; }
      }
         public class AffiliatedToOtherSAInstitution
         {
            public int ResearchId { get; set; }
            public string InternalAurthor { get; set; }
            public string StudentStaffNumber { get; set; }
            public string OtherSAInstitution { get; set; }
         }

        public class AffiliatedToOtherInternationalInstitution
        {
            public int ResearchId { get; set; }
            public string InternalAurthor { get; set; }
            public string StudentStaffNumber { get; set; }
            public string OtherInternationalInstitution { get; set; }
        }

        public class AffiliatedToOtherSAInstitutionOtherThanUniversity
        {
            public int ResearchId { get; set; }
            public string InternalAurthor { get; set; }
            public string StudentStaffNumber { get; set; }
            public string OtherSAInstitutionOtherThanUniversity { get; set; }
        }
   
    public class DocViewViewModel
    {
        public int ResearchId { get; set; }
        public string GuidId { get; set; }
        public int ViewId { get; set; }
    }
    public class AttachementDocViewModel
    {
        public string Extention { get; set; }
        public string DocName { get; set; }
        public byte[] Attachment { get; set; }
    }

    public class PublicationUpdateViewModel
    {
        public string GuidId { get; set; }
        public string ChangedBy { get; set; }
        public string ResearchUsername { get; set; }
    }

    public class AdminViewAllSearchViewModel
    {
        public string Faculty { get; set; }
        public string ResearchOutput { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string PublicationTitle { get; set; }
        public string SDG { get; set; }
    }

    public class FacultyCoOrdinatorSearchViewModel
    {
        public string UserName { get; set; }
        public string ActiveStatus { get; set; }
    }

    public class AmendmentResearchModel
    {
        public int ResearchId { get; set; }
        public int Publication_Year { get; set; }
        public string Faculty { get; set; }
    }
}
