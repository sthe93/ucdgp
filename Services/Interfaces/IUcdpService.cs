using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using UCDGweb.Models;
using UDCG.Application.Feature.Application.Resources;

namespace ResearchSuite.Services.Interfaces
{
    public interface IUcdpService
    {
        Task<List<FundingCallsModel>> FilterFundingCalls(SearchFundingViewModel fundingViewModel);
        Task<List<FundingCallsModel>> GetFundingCalls();
        Task<List<ProjectCycleViewModel>> GetAllProjectCyclesAsync();
        Task<List<ApplicationDetailsViewModel>> SearchIncompleteApplications(int userId);
        Task<List<ApplicationDetailsViewModel>> SearchCompleteApplications(int userId);
        Task<FundingCallStatusViewModel> GetFundingCallStatusById(int fundingCallStatusId);
        Task<List<FundingCallStatusViewModel>> GetFundingCallStatus();
        Task<FundingCallsModel?> SearchFundingCalls(string fundingCallName);
        Task<FundingCallsModel> PostFundingCalls(FundingCallsModel fundingViewModel);
        Task<FundingCallsModel> CreateFundingCall(FundingCallsModel fundingViewModel);
        Task<List<ApplicationDetailsViewModel>> SearchApplications(SearchApplicationViewModel searchViewModel);
        Task<FundingCallsModel> GetFundingCallById(int fundingCallId);
        Task<List<ApplicationsProjectsViewModel>> ApplicationsProjects(int userId);
        Task<ApplicationDetailsViewModel> GetApplicationById(int id);
        Task<string> GetCostCentreDetails(string CostCentre);
        Task<List<ReadApplicationResource>> GetMyPreviousApplications(int? userId);
        Task<List<CostCentreNumberReadModel>> GetCostCentreDetailsV2(string costCentrel);
        //Task<List<UploadDocumentViewModel>> UpdloadDocument(List<UploadDocumentViewModel> uploadDocuments);
        Task<List<MotivationLetterResponse>> CreateLinkUserMotivationLetter(List<MotivationLetterReadModel> model);
        Task<MotivationLetterResponse> GetLinkUserMotivationLetter(int userId, int fundinCallId);
        Task<byte[]> GetDocument(int documentId);
        Task<MotivationLetterReadModel> ViewMotivationLetterById(int documentId);
        Task<bool> DeleteMotivationLetter(int documentId);
        //Task<ApplicationDetailsViewModel> ApplicationDetails(ApplicationDetailsViewModel details);

        Task<ApplicationDetailsViewModel> ApplicationDetails(ApplicationDetailsViewModel details, ReadUserViewModelResource user);
        Task<FundingCallsModel> CloseFundingCall(UpdateFundingCallClosingDate fundingViewModel);
        Task<FundingCallsModel> UpdateFundingBudget(UpdateFundingCallBudgetRequest fundingViewModel);
        Task<SystemClosureStatusResponse> GetSystemClosure();
        Task<SystemClosureStatusResponse> SetSystemClosure(UpdateSystemClosureRequest request);
    }
}
