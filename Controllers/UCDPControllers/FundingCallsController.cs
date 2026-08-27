using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using System.Globalization;
using System.Text;
using X.PagedList.Extensions;

namespace ResearchSuite.Controllers.UCDPControllers
{
    public class FundingCallsController(IUcdpService ucdpService, IProjectService projectService) : Controller
    {

        public object reservationList { get; private set; }
        private readonly IConfiguration _config;
        private readonly IUcdpService _ucdpService = ucdpService;
        private readonly IProjectService _projectService = projectService;

        public async Task<IActionResult> Index(string? searchCallName, int? status, DateTime? openingDateFilter, DateTime? closingDateFilter)
        {
            var fundingCalls = await GetFundingCallsAsync(searchCallName, status, openingDateFilter, closingDateFilter);

            var projects = await _projectService.GetProjects();
            var statuses = await _ucdpService.GetFundingCallStatus();
            var projectCycles = await _ucdpService.GetAllProjectCyclesAsync();

            var activeCycle = projectCycles.FirstOrDefault(x => x.IsActive);
            var years = activeCycle?.Period?.Split('-', StringSplitOptions.TrimEntries);

            var model = new FundingCallsViewModel
            {
                FundingCalls = fundingCalls ?? [],

                Projects = projects ?? [],
                Statuses = statuses ?? [],
                ProjectCycles = projectCycles ?? [],

                SearchCallName = searchCallName,
                Status = status,
                OpeningDateFilter = openingDateFilter,
                ClosingDateFilter = closingDateFilter,

                StartYear = years?.Length > 0 ? years[0] : null,
                EndYear = years?.Length > 1 ? years[1] : null
            };

            return View("~/Views/Ucdp/FundingCalls/Index.cshtml", model);
        }

        private async Task<List<FundingCallsModel>> GetFundingCallsAsync(string? searchCallName, int? status, DateTime? openingDateFilter, DateTime? closingDateFilter)
        {
            var hasFilters = !string.IsNullOrWhiteSpace(searchCallName) || status.HasValue || openingDateFilter.HasValue || closingDateFilter.HasValue;

            if (!hasFilters)
            {
                return await _ucdpService.GetFundingCalls();
            }

            var search = new SearchFundingViewModel
            {
                SearchCallName = searchCallName?.Trim(),
                FundingCallStatusId = status ?? 0,
                OpeningDateFilter = openingDateFilter,
                ClosingDateFilter = closingDateFilter
            };

            return await _ucdpService.FilterFundingCalls(search);
        }

        [HttpGet]
        public async Task<IActionResult> FilterFundingCalls(string? search, int? status, DateTime? openingDateFilter, DateTime? closingDateFilter)
        {
            var fundingCalls = await GetFundingCallsAsync(search, status, openingDateFilter, closingDateFilter);

            return PartialView("~/Views/Ucdp/FundingCalls/_FundingCallTable.cshtml", fundingCalls);
        }

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {

            List<ProjectsViewModel> projectsList = new List<ProjectsViewModel>();


            //projectsList = await _projectService.GetProjects();

            projectsList = await _projectService.GetActiveCycleProjects();


            var result = projectsList.Select(p => new
            {
                id = p.Id,      // must match your JS
                name = p.ProjectName
            });


            return Ok(result); // or return Json(result);
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

        public IActionResult Popup1()
        {
            return PartialView();
        }


        [HttpGet]
        public async Task<IActionResult> UpdateFundingCall(int id)
        {


            // List<FundingCallsModel> fundingCalls = new List<FundingCallsModel>();
            // List<ProjectsViewModel> projectsList = new List<ProjectsViewModel>();
            List<ProjectCyclesViewModel> projectsCycleListv2 = new List<ProjectCyclesViewModel>();
            // List<ProjectCycleViewModel> projectsCycleList = new List<ProjectCycleViewModel>();


            //var  
            //fundingCalls = await  _ucdpService.GetFundingCalls();

            // Load all funding calls then select the single call by id
            var fundingCallsList = await _ucdpService.GetFundingCalls();
            var fundingCalls = fundingCallsList.FirstOrDefault(f => f.Id == id);



            var projectsList = await _projectService.GetProjects();
            var projectsCycleList = await _ucdpService.GetAllProjectCyclesAsync();


            if (projectsList != null)
            {

                ViewBag.ProjectList = GetProjectList(projectsList, fundingCalls.ProjectId);
                fundingCalls.ProjectNamesList = GetProjectList(projectsList, fundingCalls.ProjectId);
            }
            else
            {
                ViewBag.ProjectList = null;
            }

            if (projectsCycleList != null)
            {
                ViewBag.ProjectCycleList = GetProjectCycleList(projectsCycleList);
                List<string> startEndYear = GetCycleYears(ViewBag.ProjectCycleList);

                if (startEndYear.Count > 1)
                {
                    ViewBag.StartYear = startEndYear[0];
                    ViewBag.EndYear = startEndYear[1];
                }
            }
            else
            {
                ViewBag.ProjectCycleList = null;
            }
            //fundingCalls.FundingBudget = string.IsNullOrEmpty(fundingCalls.FundingBudget) ? fundingCalls.FundingBudget : fundingCalls.FundingBudget;
            fundingCalls.FundingBudget = string.IsNullOrEmpty(fundingCalls.FundingBudget) ? "0" : string.Format("{0:N}", decimal.Parse(fundingCalls.FundingBudget.Replace(" ", ""), CultureInfo.InvariantCulture)).Replace(',', ' ');


            // return PartialView("UpdateFundingCall", fundingCalls);
            return PartialView("~/Views/UCDP/FundingCalls/UpdateFundingCall.cshtml",
                     fundingCalls);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateFundingCall(FundingCallsModel fundingCall)
        {
            var response = await _ucdpService.PostFundingCalls(fundingCall);

            if (response == null)
            {
                return Json(new
                {
                    status = "error",
                    message = "Could not update funding call."
                });
            }

            return Json(new
            {
                status = "success",
                data = response
            });
        }


        [HttpPost]
        public async Task<IActionResult> CreateFundingCall(FundingCallsModel fundingcalls)
        {
            var fundingCall = await _ucdpService.SearchFundingCalls(fundingcalls.FundingCallName);

            if (fundingCall != null)
            {
                ModelState.AddModelError(nameof(fundingcalls.FundingCallName), "A funding call with this name already exists.");

                return Json(new
                {
                    status = "error",
                    message = "A funding call with this name already exists."
                });
            }

            var postedCall = await _ucdpService.CreateFundingCall(fundingcalls);

            return Json(new
            {
                status = "success",
                data = postedCall
            });
        }


        [HttpGet]
        public async Task<IActionResult> GetFundingCallDetails(int id)
        {
            var fundingCalls = await _ucdpService.GetFundingCalls();

            var fundingCall = fundingCalls.FirstOrDefault(f => f.Id == id);

            if (fundingCall == null)
            {
                return NotFound(new
                {
                    status = "error",
                    message = "Funding call not found."
                });
            }

            return Ok(fundingCall);
        }
        [HttpPost]
        public async Task<IActionResult> CloseFundingCall(int id, DateTime ClosingDate)
        {
            string userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            var post = new UpdateFundingCallClosingDate()
            {
                ClosingDate = ClosingDate,
                FundingCallId = id,
                UserId = Convert.ToInt32(userId)
            };

            var response = await _ucdpService.CloseFundingCall(post);

            if (response != null)
                ViewBag.Result = "Success";


            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> UpdateFundingBudget(int id, string FundingBudget)
        {
            if (string.IsNullOrWhiteSpace(FundingBudget))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "A funding budget amount is required."
                });
            }

            string userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            var post = new UpdateFundingCallBudgetRequest()
            {
                FundingCallId = id,
                FundingBudget = FundingBudget,
                UserId = Convert.ToInt32(userId)
            };

            var response = await _ucdpService.UpdateFundingBudget(post);

            if (response == null)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "The budget could not be updated. The funding call may no longer be open."
                });
            }

            return Json(new
            {
                status = "success",
                data = response
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetSystemClosure()
        {
            try
            {
                var closure = await _ucdpService.GetSystemClosure();

                if (closure == null)
                {
                    return Json(new
                    {
                        status = "error",
                        message = "System closure lookup returned no data from upstream services.",
                        data = (object)null,
                        diagnostics = new
                        {
                            expectedGatewayBaseUrl = HttpContext.RequestServices
                                .GetService(typeof(IConfiguration)) is IConfiguration cfg
                                ? cfg["AppSettings:ResearchGateway"]
                                : null,
                            endpoint = "SystemClosure/GetSystemClosure",
                            hint = "Check Gateway is running with Debug configuration, route file ocelot.SystemClosure.json is loaded, and ResearchGateway URL/port matches the running Gateway instance."
                        }
                    });
                }

                return Json(new
                {
                    status = "success",
                    message = "System closure loaded.",
                    data = closure
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "error",
                    message = "System closure lookup failed.",
                    data = (object)null,
                    diagnostics = new
                    {
                        error = ex.Message,
                        endpoint = "SystemClosure/GetSystemClosure"
                    }
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SetSystemClosure(DateTime ClosureDateTime, int? Id)
        {
            if (ClosureDateTime == default)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "A valid closure date and time is required."
                });
            }

            string userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            var post = new UpdateSystemClosureRequest()
            {
                Id = Id,
                ClosureDateTime = ClosureDateTime,
                UserId = Convert.ToInt32(userId)
            };

            var response = await _ucdpService.SetSystemClosure(post);

            if (response == null)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "The system closure date could not be saved."
                });
            }

            return Json(new
            {
                status = "success",
                data = response
            });
        }

    }
}
