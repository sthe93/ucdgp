namespace ResearchSuite.Models.UCDP
{
    public class ReadUserViewModelResource
    {
         public int UserId { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public string Nationality { get; set; }
        public string IdPassportNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string EmailAddress { get; set; }
        public string AlternativeEmailAddress { get; set; }
        public string CellPhoneNumber { get; set; }
        public string TelephoneNumber { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool IsProfileCompleted { get; set; }

        public string Campus { get; set; }
        public string Title { get; set; }
        public string StaffNumber { get; set; }
        public string Position { get; set; }
        public bool IsAcademic { get; set; }
        public string Faculty { get; set; }
        public string Department { get; set; }
        public string Race { get; set; }
        public string Gender { get; set; }
        public bool OtherProgramme { get; set; }
        public string OtherProgrammeName { get; set; }
        public bool OtherFundSource { get; set; }
        public string OtherFundSourceName { get; set; }
        public string HOD { get; set; }
        public string ViceDean { get; set; }
        public string Disability { get; set; }
        public IEnumerable<UserQualificationViewModel> Qualifications { get; set; }
        public IEnumerable<UserRoleResource> UserRoles { get; set; }

        public bool IsFundAdministrator { get; set; }
        public bool IsActive { get; set; }
        public bool IsAcknowledge { get; set; }
        public string ApprovedAs { get; set; }
        public string CostCentreNumber { get; set; }
        public DateTime LastModifiedDate { get; set; }
        public bool ProgressReportComplete { get; set; }
    }
    public class UserQualificationViewModel
    {
        public int QualificationId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; }
        public string InstitutionName { get; set; }
        public string QualificationType { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
    public class UserRoleResource
    {

        public int UserRoleId { get; set; }
        public int RoleId { get; set; }
        public ReadRoleResource Role { get; set; }
        //public ReadRoleResource Role { get; set; }
        public int UserId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int CreatedBy { get; set; }
        public DateTime DateCreated { get; set; }
        public bool IsActive { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime DateModified { get; set; }
    }
    public class ReadRoleResource
    {
        public int RoleId { get; set; }
        public string Name { get; set; }
    }
    }

