using System.Text.Json.Serialization;

namespace ResearchSuite.Dtos.UCDP
{
    public class MeDto
    {
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("staffNumber")]
        public string? StaffNumber { get; set; }

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("isAdmin")]
        public bool IsAdmin { get; set; }

        [JsonPropertyName("hasInbox")]
        public bool HasInbox { get; set; }

        [JsonPropertyName("hasTempAssignments")]
        public bool HasTempAssignments { get; set; }

        [JsonPropertyName("hasTeamHistory")]
        public bool HasTeamHistory { get; set; }

        [JsonPropertyName("showApproverTabs")]
        public bool ShowApproverTabs { get; set; }
        [JsonPropertyName("canApply")]
        public bool CanApply { get; set; }

        [JsonPropertyName("isFundAdmin")]
        public bool IsFundAdmin { get; set; }

        [JsonPropertyName("isSiaDirector")]
        public bool IsSiaDirector { get; set; }

    }
}