using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Dtos;
using ResearchSuite.Dtos.Oross;
using ResearchSuite.Models.Oross;
using System.Threading.Tasks;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Services.Interfaces
{
    public interface IResearchService
    {
        Task<List<ResearchOutputTypeDto>> GetResearchOutputTypesAsync();
        Task<List<GetAdmin_ResearchOutPutInfoDto>> GetAdminResearchOutPutInfoByUsername(string username, string submissionsType);
        Task<List<TempGetResearchOutPutInfo>> getResearchOutPutInfos(string guidId);
        Task<List<TempGetResearchOutPutAuthor>> getResearchOutPutAuthors(string guidID);
        Task<List<TempGetResearchOutPutDocument>> GetViewDocument(string guidID);
        Task<List<TempGetResearchOutPutAffiliatedToOtherSAInstitution>> getResearchOutPutAffiliatedToOtherSAInstitutions(int researchId);
        Task<List<TempGetResearchOutPutAffiliatedToOtherInternationalInstitution>> getResearchOutPutAffiliatedToOtherInternationalInstitutions(int researchId);
        Task<List<TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity>> getResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversities(int researchId);
        Task<List<TempGetResearchOutPutDocument>> GetAPIDocuments(string docId);
        Task<ViewResearchOutPutDocument> GetDocumentByGuid(string documentGuid);
        Task<GetResearchOutPut_DocumentDto> GetDocumentById(string docId);
        //Task<GetResearchOutPut_DocumentDto> SubmitCommentFRA(string commentValue);
        Task<HttpResponseMessage> SubmitCommentFRA([FromBody] AddCommentFor_RFAViewModel model);
        Task<SubmitResearchResponseDto> ReuploadSubmitedResearchDocument(ReUploadResearchOutPut_UpdateDocumentViewModel document);
        Task<SubmitResearchResponseDto> UpdateAmendementResearch(Amendment_PublicationViewModel model);
        Task<GetResearchOutPut_DocumentDto> GetDocumentByViewId(string guidId, int viewId);
        Task<List<PublicationFeesReasonDto>> GetPublicationFeesReason();
        Task<List<PublicationYearDto>> GetPublicationYear();
        Task<AuthorModel?> GetAuthorByUsername(string username);
        Task<List<CurrencyDto>> GetCurrencies();
        Task<SubmitResearchResponseDto> SubmitResearch(SubmitResearchRequestDto submitResearchRequestDto);
        Task<List<GetAdmin_ResearchOutPutInfoDto>> GetFilteredSubmissionsAsync(SubmissionFilter filter);
        Task<string> UpdatePublishRepository(Publish publish);
        Task<bool> TitleExists(string title);
    }
}
