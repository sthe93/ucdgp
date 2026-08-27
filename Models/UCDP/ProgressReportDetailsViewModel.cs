using Microsoft.AspNetCore.Mvc.Rendering;
using UDCG.Application.Feature.Application.Resources;

namespace ResearchSuite.Models.UCDP
{
    public class ProgressReportDetailsViewModel
    {
        public bool IsViewOnly { get; set; } = true;

        public int StepId { get; set; }
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ApplicationId { get; set; }
        public int FundingCallId { get; set; }
        public string ReferenceNumber { get; set; }
        public int ProgressReportStatusId { get; set; }
        public string Status { get; set; }
        public bool IsComplete { get; set; }
        public DateTime CreatedDate { get; set; }

        public List<CreateDocumentViewModel> ApplicationDocuments { get; set; }
        public MotivationLetterResponse MotivationalLetter { get; set; }

        public bool IsQualificationInProgressMode { get; set; } = true;
        //Qualification - In Progress - Step 2
        public bool IsQualificationInPrgress { get; set; }
        public SelectList IsQualificationInPrgressOptions { get; set; } = new SelectList(new[]
        {
            new { Value = true, Text = "Yes" },
            new { Value = false, Text = "No" }
        }, "Value", "Text");
        public string QualificationInPrgress { get; set; }
        public string QualificationName { get; set; }
        public string QualificationInPrgressFieldOfStudy { get; set; }
        public string QualificationInPrgressTitleofThesis { get; set; }
        public string QualificationInPrgressInstitution { get; set; }
        public string QualificationInPrgressGraduationYear { get; set; }
        //public IFormFile UploadedDoc { get; set; }
        //public CreateDocumentViewModel Document { get; set; }


        //Qualification - Graduated - Step 3
        public bool IsQualificationGraduated { get; set; }
        public SelectList IsQualificationGraduatedOptions { get; set; } = new SelectList(new[]
        {
            new { Value = true, Text = "Yes" },
            new { Value = false, Text = "No" }
        }, "Value", "Text");
        public string QualificationGraduated { get; set; }
        public string QualificationGraduatedName { get; set; }
        public string QualificationGraduatedFieldOfStudy { get; set; }
        public string QualificationGraduatedTitleofThesis { get; set; }
        public string QualificationGraduatedInstitution { get; set; }
        public string QualificationGraduatedYear { get; set; }

        //Teaching Relief Appointment - Step 4
        public bool IsReliefAppointment { get; set; }
        public SelectList IsReliefAppointmentOptions { get; set; } = new SelectList(new[]
        {
            new { Value = true, Text = "Yes" },
            new { Value = false, Text = "No" }
        }, "Value", "Text");
        public string ReliefAppointment { get; set; }
        //Research Publications (Outputs) - Step 5
        public bool IsResearchPublication { get; set; }
        public string ResearchPublication { get; set; }
        public SelectList IsResearchPublicationOptions { get; set; } = new SelectList(new[]
        {
            new { Value = true, Text = "Yes" },
            new { Value = false, Text = "No" }
        }, "Value", "Text");
        public string ResearchProject { get; set; }
        public string ResearchAccreditedJournal { get; set; }
        public string ResearchAccreditedChapter { get; set; }
        public string ResearchAccreditedBook { get; set; }
        public string ResearchAccreditedConference { get; set; }

        //Research Projects (Outputs) - Step 6
        public bool IsResearchProject { get; set; }
        public SelectList IsResearchProjectOptions { get; set; } = new SelectList(new[]
{
            new { Value = true, Text = "Yes" },
            new { Value = false, Text = "No" }
        }, "Value", "Text");
        public string ResearchProjectSupport { get; set; }
        public string Activities { get; set; }
        public string Outputs { get; set; }
        public string Outcome { get; set; }

        //Collaborative Projects (Outputs) - Step 7
        public bool IsCollaborativeProject { get; set; }
        public SelectList IsCollaborativeProjectOptions { get; set; } = new SelectList(new[]
{
            new { Value = true, Text = "Yes" },
            new { Value = false, Text = "No" }
        }, "Value", "Text");
        public string CollaborativeProject { get; set; }
        public string CollaborativeProjectSupported { get; set; }
        public string CollaborativeActivities { get; set; }
        public string CollaborativeOutputs { get; set; }
        public string CollaborativeOutcome { get; set; }

        public string StaffNumber { get; set; }
        public string Username { get; set; }
        public string Title { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public string ApprovedAmount { get; set; }
        public string ApplicantCategory { get; set; }
        public DateTime FundingCallStartDate { get; set; }
        public int FileUploadType { get; set; }
        public string ViewReportSource { get; set; }
    }
}
