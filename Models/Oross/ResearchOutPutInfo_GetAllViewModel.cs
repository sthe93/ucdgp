namespace ResearchSuite.Models.Oross
{
    public class ResearchOutPutInfo_GetAllViewModel
    {
        public int ResearchId { get; set; }
        public string GuidID { get; set; }
        public int Publication_Year { get; set; }
        public string CESMCode { get; set; }
        public int OutPutType { get; set; }
        public string Research_Output { get; set; }
        public string Author { get; set; }
        public string Publish { get; set; }
        public string CreatedDate { get; set; }
        public string LastChangedDate { get; set; }
        public string RFAstatus { get; set; }   // note this change
        public string SDG { get; set;  } 
        public string Username { get; set; }
        public string PublicationTitle { get; set; }
        public string Faculty { get; set; }
        public string ISSN { get; set; }
        public string DepartmentName { get; set; }
        public Nullable<System.DateTime> SearchDate { get; set; }
        public string CreatedBy { get; set; }
    }
}
