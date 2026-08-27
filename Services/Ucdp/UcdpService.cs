using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Oross;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using System.Text.Json;
using UCDGweb.Models;
using UDCG.Application.Feature.Application.Resources;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Services.Ucdp
{
    public class UcdpService : IUcdpService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppSettings _appSettings;
        private readonly IMemoryCache _memoryCache;
        public UcdpService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> appSettings, IMemoryCache memoryCache)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
            _memoryCache = memoryCache;
        }


        public async Task<List<FundingCallsModel>> FilterFundingCalls(SearchFundingViewModel fundingViewModel)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}FundingCalls/FilterFundingCalls";
                var response = await APICaller.AuthenticatedApiCallAsync<SearchFundingViewModel, List<FundingCallsModel>>(url, "POST", fundingViewModel);
                return response ?? new List<FundingCallsModel>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public async Task<FundingCallsModel?> CreateFundingCall(FundingCallsModel fundingViewModel)
        {
            var url = $"{_appSettings.ResearchGateway}FundingCalls/";

            return await APICaller.AuthenticatedApiCallAsync<FundingCallsModel, FundingCallsModel>(url, "POST", fundingViewModel);
        }

        public async Task<FundingCallsModel?> PostFundingCalls(FundingCallsModel fundingViewModel)
        {
            var url = $"{_appSettings.ResearchGateway}FundingCalls/PostFundingCalls";

            return await APICaller.AuthenticatedApiCallAsync<FundingCallsModel, FundingCallsModel>(url, "POST", fundingViewModel);
        }


        public async Task<FundingCallsModel> GetFundingCallById(int fundingCallId)
        {

            try
            {
                var url = $"{_appSettings.ResearchGateway}FundingCalls/{fundingCallId}";
                var response = await APICaller.AuthenticatedApiCallAsync<int, FundingCallsModel>(url, "GET", fundingCallId);
                return response;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<FundingCallsModel>> GetFundingCalls()
        {
            var url = $"{_appSettings.ResearchGateway}FundingCalls/GetFundingCalls";
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<FundingCallsModel>>(url, "GET", "");
            return response ?? new List<FundingCallsModel>();
        }


        public async Task<List<FundingCallStatusViewModel>> GetFundingCallStatus()
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}FundingCallStatus/";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<FundingCallStatusViewModel>>(url, "GET", "");
                return response ?? new List<FundingCallStatusViewModel>();
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public async Task<FundingCallStatusViewModel> GetFundingCallStatusById(int fundingCallStatusId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}FundingCallStatus/{fundingCallStatusId}";
                var response = await APICaller.AuthenticatedApiCallAsync<int, FundingCallStatusViewModel>(url, "GET", 0);
                return response;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<FundingCallsModel?> SearchFundingCalls(string fundingCallName)
        {
            var url = $"{_appSettings.ResearchGateway}FundingCalls/SearchFundingCalls/{fundingCallName}";

            return await APICaller.AuthenticatedApiCallAsync<object, FundingCallsModel>(url, "GET", null);
        }

        public async Task<List<ProjectCycleViewModel>> GetAllProjectCyclesAsync()
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}ProjectCycle/GetAllProjectCycles";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProjectCycleViewModel>>(url, "GET", "");
                return response ?? new List<ProjectCycleViewModel>();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<ApplicationDetailsViewModel>> SearchIncompleteApplications(int userId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/GetAllIncompleteApplicationsByUserId/{userId}";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationDetailsViewModel>>(url, "GET", "");
                return response ?? new List<ApplicationDetailsViewModel>();
            }
            catch (Exception)
            {
                throw;
            }
        }
        public async Task<List<ApplicationDetailsViewModel>> SearchCompleteApplications(int userId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/SearchCompleteApplicationsByUserId/{userId}";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ApplicationDetailsViewModel>>(url, "GET", "");
                return response ?? new List<ApplicationDetailsViewModel>();
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<List<ApplicationDetailsViewModel>> SearchApplications(SearchApplicationViewModel search)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/SearchApplications";
                //  var response = await APICaller.AuthenticatedApiCallAsync<SearchApplicationViewModel, List<ApplicationDetailsViewModel>>(url, "POST", search);
                var response = await APICaller.AuthenticatedApiCallAsync<SearchApplicationViewModel, ApplicationDetailsViewModel>(url, "POST", search);
                return response != null ? new List<ApplicationDetailsViewModel> { response } : new List<ApplicationDetailsViewModel>();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<ApplicationsProjectsViewModel>> ApplicationsProjects(int Id)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/ApplicationsProjects";
                var response = await APICaller.AuthenticatedApiCallAsync<int, List<ApplicationsProjectsViewModel>>(url, "GET", 0);
                return response ?? new List<ApplicationsProjectsViewModel>();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<ApplicationsProjectsViewModel>> ApplicationsSupportRequired(int Id)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/ApplicationsSupportRequired";
                var response = await APICaller.AuthenticatedApiCallAsync<int, List<ApplicationsProjectsViewModel>>(url, "GET", 0);
                return response ?? new List<ApplicationsProjectsViewModel>();
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<ApplicationDetailsViewModel> GetApplicationById(int id)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/GetApplicationById/{id}";
                var response = await APICaller.AuthenticatedApiCallAsync<int, ApplicationDetailsViewModel>(url, "GET", 0);
                return response ?? new ApplicationDetailsViewModel();
            }
            catch (Exception ex)
            {

                throw;
            }
        }


        public async Task<List<ReadApplicationResource>> GetMyPreviousApplications(int? userId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/GetMyPreviousApplications/" + userId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ReadApplicationResource>>(url, "GET", "");
                return response ?? new List<ReadApplicationResource>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }



        public async Task<string> GetCostCentreDetails(string costCentre)
        {
            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";

                var url = $"{_appSettings.ResearchGateway}costcentre/Verify/{(costCentre)}";

                var items = await APICaller.HttpCallJsonAsync<string, CostCentreNumberReadModel>(url, "POST", null)
                    ?? new CostCentreNumberReadModel();

                // Serialize to JSON (compact)
                return JsonSerializer.Serialize(items);

            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<CostCentreNumberReadModel>> GetCostCentreDetailsV2(string costCentre)
        {
            try
            {

                var payload = new { centreCode = costCentre };

                //var url = $"{_appSettings.ResearchGateway}costcentre/Verify";

                //var url = $"{_appSettings.ResearchGateway}costcentre/Verify/{Uri.EscapeDataString(costCentre)}";

                var url = $"{_appSettings.ResearchGateway}costcentre/Verify/{(costCentre)}";
                //var response = await APICaller.AuthenticatedApiCallAsync<string, List<CostCentreNumberReadModel>>(url, "POST", null);


                var single = await APICaller.AuthenticatedApiCallAsync<string, CostCentreNumberReadModel>(url, "POST", null);
                // If your gateway passes centreCode via path → downstream query, the body can be null.

                // Wrap to match your method’s signature (List<CostCentreNumberReadModel>)
                return single != null
                    ? new List<CostCentreNumberReadModel> { single }
                    : new List<CostCentreNumberReadModel>();




                // return response ?? new List<CostCentreNumberReadModel>();
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public async Task<List<MotivationLetterResponse>> CreateLinkUserMotivationLetter(List<MotivationLetterReadModel> model)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/CreateLinkUserMotivationLetter";
                var response = await APICaller.AuthenticatedApiCallAsync<List<MotivationLetterReadModel>, List<MotivationLetterResponse>>(url, "POST", model);

                // Fix: Return the first item if available, otherwise null (or throw, or return a new instance as fallback)
                return response ?? new List<MotivationLetterResponse>();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<UploadDocumentViewModel>> DeleteDocument(int documentId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Documents/DeleteDocument/" + documentId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<UploadDocumentViewModel>>(url, "GET", "");
                return response ?? new List<UploadDocumentViewModel>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public async Task<byte[]> GetDocument(int documentId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Documents/GetDocument/" + documentId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, byte[]>(url, "GET", "");
                return response;
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public async Task<MotivationLetterResponse> GetLinkUserMotivationLetter(int userId, int fundinCallId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/GetLinkUserMotivationLetter/" + userId + "/" + fundinCallId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, MotivationLetterResponse>(url, "GET", "");
                // Fix: Return the first item if available, otherwise null (or throw, or return a new instance as fallback)
                return response ?? new MotivationLetterResponse();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<MotivationLetterReadModel> ViewMotivationLetterById(int documentId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/ViewMotivationLetterById/" + documentId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, MotivationLetterReadModel>(url, "GET", "");
                // Fix: Return the first item if available, otherwise null (or throw, or return a new instance as fallback)
                return response ?? new MotivationLetterReadModel();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<bool> DeleteMotivationLetter(int documentId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Applications/DeleteMotivationLetterById/" + documentId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, bool>(url, "POST", "");
                // Fix: Return the first item if available, otherwise null (or throw, or return a new instance as fallback)
                return response;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<ApplicationDetailsViewModel> ApplicationDetails(ApplicationDetailsViewModel application, ReadUserViewModelResource user)
        {
            if (application is null) throw new ArgumentNullException(nameof(application));
            if (user is null) throw new ArgumentNullException(nameof(user));

            var url = $"{_appSettings.ResearchGateway}Applications/PostApplicationsV2";

            var payload = new
            {
                Application = application,
                User = user
            };


            var response = await APICaller.AuthenticatedApiCallAsync<object, ApplicationDetailsViewModel>(url, "POST", payload);

            return response ?? new ApplicationDetailsViewModel();

        }


        public async Task<FundingCallsModel?> CloseFundingCall(UpdateFundingCallClosingDate fundingViewModel)
        {
            var url = $"{_appSettings.ResearchGateway}FundingCalls/CloseFundingCalls";

            return await APICaller.AuthenticatedApiCallAsync<UpdateFundingCallClosingDate, FundingCallsModel>(url, "POST", fundingViewModel);
        }

        public async Task<FundingCallsModel?> UpdateFundingBudget(UpdateFundingCallBudgetRequest fundingViewModel)
        {
            var url = $"{_appSettings.ResearchGateway}FundingCalls/UpdateFundingBudget";

            return await APICaller.AuthenticatedApiCallAsync<UpdateFundingCallBudgetRequest, FundingCallsModel>(url, "POST", fundingViewModel);
        }

        public async Task<SystemClosureStatusResponse?> GetSystemClosure()
        {
            var url = $"{_appSettings.ResearchGateway}SystemClosure/GetSystemClosure";

            return await APICaller.AuthenticatedApiCallAsync<object, SystemClosureStatusResponse>(url, "GET", null);
        }

        public async Task<SystemClosureStatusResponse?> SetSystemClosure(UpdateSystemClosureRequest request)
        {
            var url = $"{_appSettings.ResearchGateway}SystemClosure/SetSystemClosure";

            return await APICaller.AuthenticatedApiCallAsync<UpdateSystemClosureRequest, SystemClosureStatusResponse>(url, "POST", request);
        }
    }

    public class PostApplicationsRequest
    {
        public ApplicationDetailsViewModel Application { get; set; }
        public ReadUserViewModelResource User { get; set; }
    }
}
