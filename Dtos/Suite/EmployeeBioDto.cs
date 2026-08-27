using System.Text.Json.Serialization;
using ResearchSuite.Models.Suite;

namespace ResearchSuite.Dtos.Suite
{
    public class EmployeeBioDto
    {
        public string EMPLOYEE_NUMBER { get; set; }
        public string TITLE { get; set; }
        public string INITIALS { get; set; }
        public string LAST_NAME { get; set; }
        public string FIRST_NAME { get; set; }
        public string FACULTY_DIVISION { get; set; }
        public string SUPERVISOR_EMP_NAME { get; set; }
        public string LINE_MANAGER_SURNAME { get; set; }
        public string LINE_MANAGER_FIRST_NAME { get; set; }
        public string LINEMANAGEREMAIL { get; set; }
        public string PERSON_TYPE { get; set; }
        public string POSITION_NAME { get; set; }
        public string CAMPUS { get; set; }
        public string DEPARTMENT_NAME { get; set; }
        public string STATUS { get; set; }
        public string GENDER { get; set; }
        public string NI_PI { get; set; }
        public string RACE { get; set; }
        public string IS_ACADEMIC { get; set; }
        public string CITIZENSHIP { get; set; }
        public DateTime DATE_OF_BIRTH { get; set; }
        public string EMAIL_ADDRESS { get; set; }
        public string WORK_TELEPHONE_NUMBER { get; set; }
        public string CELL_PHONE { get; set; }
        public string HOD_NAME { get; set; }
        public string HOD_EE_NUMBER { get; set; }
        public string VICE_DEAN { get; set; }
        public string VICE_DEAN_EE_NUMBER { get; set; }
        public string SEGMENT3 { get; set; }
        public string COST_CENTRE_DESCIPTION { get; set; }
        public string IS_RESEARCH { get; set; }
        public List<QualificationDto> Qualifications { get; set; } = new List<QualificationDto>();
    }

    public sealed class LoginRequestDto
    {
        [JsonPropertyName("grant_type")]
        public string GrantType { get; init; } = default!;

        [JsonPropertyName("username")]
        public string Username { get; init; } = default!;

        [JsonPropertyName("password")]
        public string Password { get; init; } = default!;
    }

    class TokenResponse
    {
        [JsonPropertyName("tokenString")]
        public string TokenString { get; set; }
    }


}
