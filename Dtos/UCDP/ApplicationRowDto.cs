namespace ResearchSuite.Dtos.UCDP
{
    public class ApplicationRowDto
    {
        public int Id { get; set; }
        public string? ReferenceNumber { get; set; }
        public int StatusId { get; set; }
        public DateTime? EndDate { get; set; }
        public string? CurrentApproverStaffNumber { get; set; }

        public string? ApplicantStaffNumber { get; set; }
        public string? FundingCallName { get; set; }
        public string? Project { get; set; }

        public string? DHETRequestedAmount { get; set; }
        public string? DHETApprovedAmount { get; set; }

        public string? SubmittedBy { get; set; }
        public DateTime? SubmittedDate { get; set; }

        public string? StatusText { get; set; }
        public int? ApplicantUserStoreUserId { get; set; }
        public int? LegacyApplicantUserId { get; set; }
        public string? AwaitingStaffNumber { get; set; }
        public string? AwaitingName { get; set; }
        public string? AwaitingStage { get; set; } // or int AwaitingStageId
        public string? AwaitingDisplay { get; set; }
        public bool HasTemporaryApprover { get; set; }
        public bool IsTemporaryApproverForThis { get; set; }
        public string? TemporaryApproverStaffNumber { get; set; }
        public string? TemporaryApproverName { get; set; }
        public string? TemporaryApproverDisplay { get; set; }

        public string? LastActionType { get; set; }
        public DateTime? LastActionDateUtc { get; set; }
        public string? LastActorStaffNumber { get; set; }
        public bool LastActorWasTemporary { get; set; }
        public string? LastActingForStaffNumber { get; set; }
        public string? LastActorName { get; set; } // optional, via Oracle names batch
        public string? LastActionDisplay { get; set; } // final formatted string for UI
        public bool IsInMyCurrentTeam { get; set; }
        public bool IsActionedByMe { get; set; }
        public bool IsInSiaLaneHistory { get; set; }

        public int? FundingCallId { get; set; }
        public DateTime? FundingEndDate { get; set; }

        public int? ReportId { get; set; }
        public bool ProgressReportComplete { get; set; }

        public int? UserId { get; set; }
        public bool IsAcknowledge { get; set; }

        public int NumberOfDocuments { get; set; }
        public int? ProgressReportStatusId { get; set; }
        public string ProgressReportStatus { get; set; }
        public bool HasOutstandingPreviousReport { get; set; }
        public int? OutstandingPreviousReportApplicationId { get; set; }
        public int OutstandingPreviousReportFundingCallId { get; set; }

    }
}
