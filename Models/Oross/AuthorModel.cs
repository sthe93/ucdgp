namespace ResearchSuite.Models.Oross
{
    public class AuthorModel
    {
        public int Id { get; set; }
        public string StaffUsername { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Campus { get; set; } = string.Empty;
        public string Faculty { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Division { get; set; } = string.Empty;
        public string ORCHID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string IsUjStudent { get; set; } = string.Empty;
        public string IsUjStaff { get; set; } = string.Empty;
        public string StaffNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public bool IsPrimaryAuthor { get; set; }
        public string Type { get; set; }
        public OtherInstitutionType? OtherInstitutionType { get; set; }
        public string InstitutionName { get; set; }
    }
}
