using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ResearchSuite.Helpers.Ucdp;
using ResearchSuite.Models.Oross;
using ResearchSuite.Models.Suite;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Services.Interfaces;
using System.Text;
using X.PagedList;
using X.PagedList.Extensions;

namespace ResearchSuite.Controllers.UCDPControllers
{
    //[Area("UCDP")]
    public class UcdpHomeController : Controller
    {
        private readonly IUcdpService _ucdpService;
        private readonly IWebHostEnvironment _env;
        private readonly IResearchService _researchService;
        private readonly ILookupService _lookupService;
        private readonly IEmailService _emailService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UcdpHomeController(IUcdpService _ucdpService, IResearchService researchService, IEmailService emailService, ILookupService lookupService, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            this._ucdpService = _ucdpService;
            _researchService = researchService;
            _emailService = emailService;
            _lookupService = lookupService;
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }


        public async Task<IActionResult> Index(string SearchCallName, string Status = null, DateTime? OpeningDateFilter = null, DateTime? ClosingDateFilter = null, int? page = null)
        { 
            if (HttpContext.Session.GetString("logginUser") == null)
                return RedirectToAction("Index", "Account");

            string role = HttpContext.Session.GetString("logginRole");

             var userApplication = JsonConvert.DeserializeObject<UserApplication>(HttpContext.User.FindAll("userData").Select(c => c.Value).FirstOrDefault() ?? "");

            ViewBag.OpeningDateFilter = OpeningDateFilter;
            ViewBag.ClosingDateFilter = ClosingDateFilter;
            ViewBag.SearchCallName = SearchCallName;
       

             int pageSize = 15;
            int pageIndex = 1;

            pageIndex = page.HasValue ? Convert.ToInt32(page) : 1;

            IPagedList<FundingCallsModel> fundingCallsList = null;

            List<ProjectsViewModel> projectsList = new List<ProjectsViewModel>();
            List<FundingCallStatusViewModel> fundingCallStatusList = new List<FundingCallStatusViewModel>();
            List<FundingCallsModel> reservationList = new List<FundingCallsModel>();
            List<ProjectCyclesViewModel> projectsCycleList = new List<ProjectCyclesViewModel>();


          //  ReadUserViewModelResource currentUser = Helpers.GetObjectFromJson<ReadUserViewModelResource>(HttpContext.Session, "logginUser");



                if (!string.IsNullOrEmpty(SearchCallName) || !string.IsNullOrEmpty(Status) || OpeningDateFilter.HasValue || ClosingDateFilter.HasValue)
                {
                    SearchFundingViewModel searchViewModel = new SearchFundingViewModel
                    {
                          FundingCallStatusId = !string.IsNullOrEmpty(Status) ? Convert.ToInt32(Status) : 0,
                        OpeningDateFilter = OpeningDateFilter,
                        SearchCallName = SearchCallName
                    };

                    //using (var response = await httpClient.PostAsync(apiUrl + "FundingCalls/FilterFundingCalls/ ", content))
                    //{
                    //    string apiResponse = await response.Content.ReadAsStringAsync();
                    //    reservationList = JsonConvert.DeserializeObject<List<FundingCallsModel>>(apiResponse);
                    //}

                      reservationList = await _ucdpService.FilterFundingCalls(searchViewModel);
                }
                else
                {
                    //using (var response = await httpClient.GetAsync(apiUrl + "FundingCalls/"))
                    //{
                    //    if (response.StatusCode.ToString() != "InternalServerError")
                    //    {
                    //        string apiResponse = await response.Content.ReadAsStringAsync();
                    //        reservationList = JsonConvert.DeserializeObject<List<FundingCallsModel>>(apiResponse);
                    //    }
                  //  }

                    reservationList = await _ucdpService.GetFundingCalls();

                }

                //using (var response = await httpClient.GetAsync(apiUrl + "Projects/"))
                //{
                //    string apiResponse = await response.Content.ReadAsStringAsync();
                //    projectsList = JsonConvert.DeserializeObject<List<ProjectsViewModel>>(apiResponse);
                //}

                //int userId =  userApplication.UserId;

                //using (var response = await httpClient.GetAsync(apiUrl + "Applications/SearchIncompleteApplications/" + userId))
                //{
                //    string apiResponse = await response.Content.ReadAsStringAsync();
                //    applicationList = JsonConvert.DeserializeObject<List<ApplicationDetailsViewModel>>(apiResponse);
                //}

                //using (var response = await httpClient.GetAsync(apiUrl + "Applications/SearchCompleteApplications/" + userId))
                //{
                //    string apiResponse = await response.Content.ReadAsStringAsync();
                //    completeApplicationList = JsonConvert.DeserializeObject<List<ApplicationDetailsViewModel>>(apiResponse);
                //}
            

            //if (projectsList != null)
            //{
            //    ViewBag.ProjectList = GetProjectList(projectsList, ProjectName);
            //}
            //else
            //{
            //    ViewBag.ProjectList = null;
            //}
            fundingCallsList = reservationList.ToPagedList(pageIndex, pageSize);

            return View(fundingCallsList);
        }
    }
}
