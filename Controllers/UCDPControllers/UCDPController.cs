using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using ResearchSuite.Helpers.common;
using ResearchSuite.Helpers.Ucdp;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using X.PagedList.Extensions;

namespace ResearchSuite.Controllers.UCDPControllers
{
    public class UCDPController(ILoginService loginservice, IUcdpService ucdpService, IProjectService projectService, IAdministrationService administrationService) : Controller
    {
        private readonly ILoginService _loginservice = loginservice;
        private readonly IUcdpService _ucdpService = ucdpService;
        private readonly IProjectService _projectService = projectService;
        private readonly IAdministrationService _administrationService = administrationService;
        public async Task<IActionResult> Index(string SearchCallName, string Status = null, DateTime? OpeningDateFilter = null, DateTime? ClosingDateFilter = null)
        {
            var context = GetUcdpUserContext();

            if (context == null)
            {
                return RedirectToAction("SetCurrentApp", "Home", new { appName = "ucdg" });
            }

            ViewBag.OpeningDateFilter = OpeningDateFilter;
            ViewBag.ClosingDateFilter = ClosingDateFilter;
            ViewBag.SearchCallName = SearchCallName;

            var fundingCalls = await GetFundingCallsAsync(SearchCallName, Status, OpeningDateFilter, ClosingDateFilter, 0, context);

            await PopulateDashboardDropdowns();

            return View(fundingCalls);
        }

        public async Task<IActionResult> FilterFundingCalls(string search, string projectname, DateTime? OpeningDateFilter, DateTime? ClosingDateFilter)
        {
            var context = GetUcdpUserContext();

            if (context == null)
            {
                return RedirectToAction("SetCurrentApp", "Home", new { appName = "ucdg" });
            }

            ViewBag.SearchCallName = search;
            ViewBag.ProjectName = projectname;
            ViewBag.OpeningDateFilter = OpeningDateFilter;
            ViewBag.ClosingDateFilter = ClosingDateFilter;

            int projectId = int.TryParse(projectname, out var parsedProjectId) ? parsedProjectId : 0;

            var fundingCalls = await GetFundingCallsAsync(search, null, OpeningDateFilter, ClosingDateFilter, projectId, context);

            return PartialView("~/Views/Ucdp/_FundingCallDashboard.cshtml", fundingCalls);
        }

        private async Task<List<FundingCallsModel>> GetFundingCallsAsync(string searchCallName, string status, DateTime? openingDateFilter, DateTime? closingDateFilter, int projectId, UcdpUserContext context)
        {
            var searchViewModel = new SearchFundingViewModel
            {
                FundingCallStatusId = int.TryParse(status, out var statusId) ? statusId : 0,
                SearchCallName = searchCallName,
                OpeningDateFilter = openingDateFilter,
                ClosingDateFilter = closingDateFilter,
                ProjectId = projectId
            };

            var fundingCalls = await _ucdpService.FilterFundingCalls(searchViewModel);

            var today = DateTime.Today;

            fundingCalls = fundingCalls.Where(r => r.FundingCallStatus?.FundingCallStatusId == 2 && r.OpeningDate.Date <= today && r.ClosingDate.Date >= today).OrderBy(r => r.FundingCallStatus.Status).ToList();

            await PopulateFundingCallFlags(fundingCalls, context.CurrentUser.UserId, context.IsFundAdmin);

            // The closure endpoint is the source of truth for whether applicants may start
            // a new application. Do not apply date-based or processed-status rules here.
            var systemClosure = await _ucdpService.GetSystemClosure();
            if (systemClosure?.IsClosureActive == true)
            {
                foreach (var fundingCall in fundingCalls)
                {
                    fundingCall.IsSystemClosureActive = true;
                    fundingCall.CanApply = false;
                }
            }

            return fundingCalls;
        }

        private async Task PopulateDashboardDropdowns()
        {
            var projectsList = await _projectService.GetProjects();
            ViewBag.ProjectList = projectsList != null ? GetProjectList(projectsList) : null;

            var projectsCycleList = await _ucdpService.GetAllProjectCyclesAsync();

            if (projectsCycleList == null)
            {
                ViewBag.ProjectCycleList = null;
                return;
            }

            ViewBag.ProjectCycleList = GetProjectCycleList(projectsCycleList);

            var startEndYear = GetCycleYears(ViewBag.ProjectCycleList);

            if (startEndYear.Count > 1)
            {
                ViewBag.StartYear = startEndYear[0];
                ViewBag.EndYear = startEndYear[1];
            }
        }
        public List<SelectListItem> GetFundingCallStatusList(List<FundingCallStatusViewModel> fundingCallStatusList, string status)
        {
            List<SelectListItem> items = fundingCallStatusList.Select(c => new SelectListItem()
            {
                Text = c.Status,
                Value = c.FundingCallStatusId.ToString(),

            }).ToList();

            if (status != null)
            {
                foreach (var selectedValue in items)
                {
                    if (selectedValue.Value == status)
                    {
                        selectedValue.Selected = true;
                    }
                }
            }

            return items;
        }

        public List<SelectListItem> GetProjectCycleList(List<ProjectCycleViewModel> projectsCycleList)
        {
            List<string> years = new List<string>();

            List<SelectListItem> items = projectsCycleList.Select(c => new SelectListItem()
            {
                Text = c.Period,
                Value = c.Id.ToString(),
                Disabled = !c.IsActive,
                Selected = c.IsActive
            }).ToList();

            return items;
        }

        private List<string> GetCycleYears(List<SelectListItem> items)
        {
            List<string> years = new List<string>();

            foreach (var period in items)
            {
                if (period.Selected)
                {
                    if (period.Text.Contains("-"))
                    {
                        years = period.Text.Split(new char[] { '-' }).ToList();
                    }
                }
            }

            return years;
        }

        public string GetProjectNames(List<ProjectsViewModel> projectsList, string[] ProjectIds = null)
        {
            string projectName = "";
            List<string> projectList = new List<string>();

            List<SelectListItem> items = projectsList.Select(c => new SelectListItem()
            {
                Text = c.ProjectName,
                Value = c.Id.ToString(),
            }).ToList();

            //Add numbering on ProjectList
            int projectCount = 1;
            foreach (var project in items)
            {
                project.Text = string.Format("{0}. {1}", projectCount, project.Text);
                projectCount++;
            }

            if (ProjectIds != null)
            {
                for (int i = 0; i < ProjectIds.Count(); i++)
                {
                    foreach (var id in items)
                    {
                        if (id.Value == ProjectIds[i])
                        {
                            id.Selected = true;
                            projectList.Add(id.Text);
                        }
                    }
                }

            }

            projectName = string.Join(";", projectList);
            return projectName;
        }

        public List<SelectListItem> GetProjectList(List<ProjectsViewModel> projectsList, string[] ProjectIds = null)
        {
            List<SelectListItem> items = projectsList.Select(c => new SelectListItem()
            {

                Text = c.ProjectName,
                Value = c.Id.ToString(),
            }).ToList();

            //Add numbering on ProjectList
            int projectCount = 1;
            foreach (var project in items)
            {
                project.Text = string.Format("{0}. {1}", projectCount, project.Text);
                projectCount++;
            }

            if (ProjectIds != null)
            {
                for (int i = 0; i < ProjectIds.Count(); i++)
                {
                    foreach (var id in items)
                    {
                        if (id.Value == ProjectIds[i])
                        {
                            id.Selected = true;
                        }
                    }
                }

            }

            return items;
        }

        private async Task PopulateFundingCallFlags(List<FundingCallsModel> fundingCalls, int userId, bool isFundAdmin)
        {
            if (fundingCalls == null || !fundingCalls.Any())
                return;

            var incompleteTask = _ucdpService.SearchIncompleteApplications(userId);
            var completeTask = _ucdpService.SearchCompleteApplications(userId);
            var previousFundingTask = _ucdpService.GetMyPreviousApplications(userId);

            await Task.WhenAll(incompleteTask, completeTask, previousFundingTask);

            var applicationList = incompleteTask.Result ?? new List<ApplicationDetailsViewModel>();
            var completeApplicationList = completeTask.Result ?? new List<ApplicationDetailsViewModel>();
            var previousApplications = previousFundingTask.Result ?? new List<ReadApplicationResource>();

            var latestFundedApp = previousApplications
                .Where(app => (app.ApplicationStartDate >= new DateTime(2026, 05, 01) && app.ApplicationStatus.ApplicationStatusId == 28) ||
                    (app.ApplicationStartDate < new DateTime(2026, 05, 01) && (app.ApplicationStatus.ApplicationStatusId == 28 || app.ApplicationStatus.ApplicationStatusId == 8)))
                .OrderByDescending(app => app.FundingStartDate)
                .FirstOrDefault();

            var lastPreviousFunding = latestFundedApp == null
                ? null
                : new PreviousFundingViewModel
                {
                    ApplicationDetails = latestFundedApp
                };

            var outstandingPreviousFunding = new List<PreviousFundingViewModel>();
            var outstandingFundingCallId = 0;
            var outstandingApplicationId = 0;

            if (latestFundedApp != null)
            {
                var latestReport = await _administrationService.GetProgressReportDetails(latestFundedApp.Id);

                var reportStatusId = latestReport?.ProgressReportStatusId ?? 0;
                var isComplete = latestReport?.IsComplete ?? false;

                // Block only when:
                // - no report exists yet
                // - or report exists, is not complete, and is not RFI
                var hasBlockingOutstandingReport =
                    latestReport == null ||
                    latestReport.Id == 0 ||
                    (!isComplete && reportStatusId != 3);

                if (hasBlockingOutstandingReport)
                {
                    outstandingPreviousFunding.Add(new PreviousFundingViewModel
                    {
                        ApplicationDetails = latestFundedApp
                    });

                    outstandingFundingCallId = latestFundedApp.FundingCalls?.Id ?? 0;
                    outstandingApplicationId = latestFundedApp.Id;
                }
            }

            var approvedApplication = completeApplicationList
                .Where(x =>
                    (x.ApplicationStatusId == 8 ||
                     x.ApplicationStatusId == 9 ||
                     x.ApplicationStatusId == 20 ||
                     x.ApplicationStatusId == 28) &&
                    x.FundingEndDate.Year == DateTime.Now.Year)
                .Select(x => x.ApplicationStatusId)
                .FirstOrDefault();

            foreach (var fundingCall in fundingCalls)
            {
                fundingCall.IsFundAdministrator = isFundAdmin;

                fundingCall.HasPreviousFunding = lastPreviousFunding != null;
                fundingCall.LastPreviousFunding = lastPreviousFunding;
                fundingCall.OutstandingPreviousFunding = outstandingPreviousFunding;
                fundingCall.HasOutstandingProgressReport = outstandingPreviousFunding.Any();

                fundingCall.OutstandingPreviousReportFundingCallId = outstandingFundingCallId;
                fundingCall.OutstandingPreviousReportApplicationId = outstandingApplicationId;

                fundingCall.CanApply = false;
                fundingCall.CanContinue = false;
                fundingCall.CanViewDetails = false;
                fundingCall.LimitReached = approvedApplication > 0;

                var today = DateTime.Today;

                if (fundingCall.ClosingDate.Date < today || fundingCall.OpeningDate.Date > today)
                    continue;

                fundingCall.CanApply = true;

                var incompleteApplication = applicationList.FirstOrDefault(application =>
                    fundingCall.Id == application.FundingCallDetailsId &&
                    application.ApplicationStatusId == 1);

                if (incompleteApplication != null)
                {
                    fundingCall.ApplicationId = incompleteApplication.Id;
                    fundingCall.CanContinue = true;
                    fundingCall.CanViewDetails = false;
                    fundingCall.CanApply = false;
                }

                var completedApplication = completeApplicationList.FirstOrDefault(application =>
                    fundingCall.Id == application.FundingCallDetailsId &&
                    application.ApplicationStatusId != 1);

                if (completedApplication != null)
                {
                    fundingCall.ApplicationId = completedApplication.Id;
                    fundingCall.CanViewDetails = true;
                    fundingCall.CanApply = false;
                    fundingCall.CanContinue = false;
                }

                if (fundingCall.HasOutstandingProgressReport)
                {
                    fundingCall.CanApply = false;
                    fundingCall.CanContinue = false;
                }
            }
        }
        private UcdpUserContext GetUcdpUserContext()
        {
            var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);

            if (currentUser == null || currentUser.UserId <= 0)
            {
                return null;
            }

            var roles = (HttpContext.User.FindFirst("role_ucdg")?.Value ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToHashSet(StringComparer.OrdinalIgnoreCase);

            return new UcdpUserContext
            {
                CurrentUser = currentUser,
                IsFundAdmin = roles.Contains("Fund Administrator")
            };
        }
        private sealed class UcdpUserContext
        {
            public ReadUserViewModelResource CurrentUser { get; set; }
            public bool IsFundAdmin { get; set; }
        }
    }
}
