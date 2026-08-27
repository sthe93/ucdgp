using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Controllers.UCDPControllers
{
    public class ProjectController : Controller
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        public IActionResult Index()
        {
            return View("~/Views/UCDP/Project/Index.cshtml");
        }


        [HttpGet]
        public async Task<IActionResult> GetAllProjectCycles()
        {
            var cycles = await _projectService.GetAllProjectCyclesAsync();
            return Json(cycles);
        }

        [HttpGet]
        public async Task<IActionResult> GetActiveProjectCycles()
        {
            var cycles = await _projectService.GetActiveProjectCycles();
            return Json(cycles);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProjectCycle([FromBody] ProjectCycleViewModel cycle)
        {
            try
            {
                var result = await _projectService.PostProjectCycle(cycle);
                var cycles = await _projectService.GetAllProjectCyclesAsync();
                return Json(cycles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            try
            {
                var projects = await _projectService.GetProjectsAndCycles();
                return Json(projects ?? new List<ProjectsViewModel>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetProjectById(int id)
        {
            try
            {
                var project = await _projectService.GetProjectById(id);
                return Json(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectsViewModel project)
        {
            try
            {
                var result = await _projectService.PostProject(project);
                var projects = await _projectService.GetProjectsAndCycles();
                return Json(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProject([FromBody] ProjectsViewModel project)
        {
            try
            {
                var result = await _projectService.PostProject(project);
                var projects = await _projectService.GetProjectsAndCycles();
                return Json(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ToggleProjectStatus([FromBody] int projectId)
        {
            try
            {
                var result = await _projectService.ToggleProjectStatus(projectId);
                var projects = await _projectService.GetProjectsAndCycles();
                return Json(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> FilterProjects([FromBody] object filter)
        {
            try
            {
                var projects = await _projectService.FilterProjects(filter);
                return Json(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}