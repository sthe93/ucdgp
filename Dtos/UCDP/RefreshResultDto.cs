namespace ResearchSuite.Dtos.UCDP
{
    public class RefreshResultDto
    {
        public int considered { get; set; }
        public int updated { get; set; }
        public int stillStuck { get; set; }

        public Dictionary<string, int> failureCounts { get; set; } = new();
        public List<RefreshFailureDto> failures { get; set; } = new();
        //public List<ApproverRefreshPreviewDto> preview { get; set; } = new();
    }

    public class RefreshFailureDto
    {
        public int applicationId { get; set; }
        public string statusText { get; set; } = "";
        public string reason { get; set; } = "";
        public string? desiredOwner { get; set; }
        public string? detail { get; set; }
        public string referenceNumber { get; set; } = "";
        public string? desiredOwnerStaffNumber { get; set; }
        public string? desiredOwnerName { get; set; }
    }

    public class ApproverRefreshPreviewDto
    {
        public int applicationId { get; set; }
        public string referenceNumber { get; set; } = "";
        public string statusText { get; set; } = "";

        public string? currentApproverStaffNumber { get; set; }

        public string? desiredApproverStaffNumber { get; set; }
        public string? desiredApproverName { get; set; }

        public string outcome { get; set; } = "OK";
    }
}