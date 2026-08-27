using Microsoft.Extensions.Options;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using System.Text;
using System.Text.Json;

namespace ResearchSuite.Services.Ucdp
{
    public class ProjectService : IProjectService
    {
        private readonly AppSettings _appSettings;
        private readonly IHttpClientFactory _httpClientFactory;

        public ProjectService(IOptions<AppSettings> appSettings, IHttpClientFactory httpClientFactory)
        {
            _appSettings = appSettings.Value;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<List<ProjectCycleViewModel>> GetAllProjectCyclesAsync()
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}ProjectCycle/GetAllProjectCycles";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProjectCycleViewModel>>(url, "GET", "");
                return response ?? new List<ProjectCycleViewModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllProjectCyclesAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<ProjectCycleViewModel> PostProjectCycle(ProjectCycleViewModel cycle)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}ProjectCycle/PostProjectCycle";
                var response = await APICaller.AuthenticatedApiCallAsync<ProjectCycleViewModel, ProjectCycleViewModel>(url, "POST", cycle);
                return response ?? new ProjectCycleViewModel();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PostProjectCycle: {ex.Message}");
                throw;
            }
        }

        public async Task<List<ProjectCycleViewModel>> GetActiveProjectCycles()
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}ProjectCycle/GetActiveProjectCycles";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProjectCycleViewModel>>(url, "GET", "");
                return response ?? new List<ProjectCycleViewModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetActiveProjectCycles: {ex.Message}");
                throw;
            }
        }



        public async Task<ProjectsViewModel> GetProjectById(int id)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}api/Projects/{id}";
                var response = await APICaller.AuthenticatedApiCallAsync<string, ProjectsViewModel>(url, HttpMethod.Get.ToString(), null);
                return response ?? new ProjectsViewModel();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetProjectById: {ex.Message}");
                throw;
            }
        }

        public async Task<List<ProjectsViewModel>> FilterProjects(object filter)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}api/Projects/FilterProjects";
                var response = await APICaller.AuthenticatedApiCallAsync<object, List<ProjectsViewModel>>(url, HttpMethod.Post.ToString(), filter);
                return response ?? new List<ProjectsViewModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FilterProjects: {ex.Message}");
                throw;
            }
        }

        public async Task<List<ProjectsViewModel>> GetProjects()
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Project/GetProjects";
                Console.WriteLine($"Calling GetProjects URL: {url}");

                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProjectsViewModel>>(url, HttpMethod.Get.ToString(), null);

                Console.WriteLine($"GetProjects response: {(response == null ? "null" : response.Count.ToString())} projects");

                return response ?? new List<ProjectsViewModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetProjects: {ex.Message}");
                throw;
            }
        }

        public async Task<List<ProjectsViewModel>> GetProjectsAndCycles()
        {
            try
            {

                var url = $"{_appSettings.ResearchGateway}Project/ProjectsAndCycles";
                Console.WriteLine($"Calling GetProjectsAndCycles URL: {url}");

                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ProjectsViewModel>>(url, "GET", "");

                Console.WriteLine($"GetProjectsAndCycles returned {response?.Count ?? 0} projects");

                return response ?? new List<ProjectsViewModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetProjectsAndCycles: {ex.Message}");
                return new List<ProjectsViewModel>();
            }
        }



        public async Task<ProjectsViewModel> PostProject(ProjectsViewModel project)
        {
            try
            {

                var url = $"{_appSettings.ResearchGateway}Project/PostProject";


                var projectData = new
                {
                    id = project.Id,
                    projectName = project.ProjectName,
                    projectCycleId = project.ProjectCycleId?.ToString(),
                    isActive = project.IsActive
                };

                var jsonData = JsonSerializer.Serialize(projectData);

                var response = await APICaller.AuthenticatedApiCallAsync<object, ProjectsViewModel>(url, "POST", projectData);



                if (response != null && response.Id > 0)
                {
                    return response;
                }


                throw new Exception("Failed to create project. API returned null or invalid response.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in PostProject: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> ToggleProjectStatus(int projectId)
        {
            try
            {
                var project = await GetProjectById(projectId);
                if (project != null)
                {
                    project.IsActive = !project.IsActive;
                    var result = await PostProject(project);
                    return result != null;
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ToggleProjectStatus: {ex.Message}");
                throw;
            }
        }

        public async Task<List<ProjectsViewModel>> GetActiveCycleProjects()
        {
            try
            {
                var projects = await GetProjectsAndCycles();
                var activeProjects = projects.Where(p =>
                    p.IsActive &&
                    p.ProjectCycles != null &&
                    p.ProjectCycles.IsActive).ToList();

                Console.WriteLine($"GetActiveCycleProjects: {activeProjects.Count} active projects");

                return activeProjects;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetActiveCycleProjects: {ex.Message}");
                throw;
            }
        }
    }
}