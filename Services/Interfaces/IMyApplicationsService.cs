using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;

namespace ResearchSuite.Services.Interfaces
{
    public interface IMyApplicationsService
    {
        Task<List<ReadApplicationResource>> GetMyApplications(int? userId);
        Task<ApplicationDetailsViewModel> ApplicationPDF(int applicationId);
        Task<ActionResult<List<ReadDocumentResource>>> GetDocsListByApplicationsId(int applicationId);
        Task<ActionResult<byte[]>> GetDocument(int documentId);
        Task<ApplicationDetailsViewModel> GetAwardLetter(string referenceNumber);
        Task<string> GetCommentsByApplicationId(int applicationsId);
    }
}
