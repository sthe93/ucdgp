using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;

namespace ResearchSuite.Services.Interfaces
{
    public interface IProjectService
    {

        Task<List<ProjectCycleViewModel>> GetAllProjectCyclesAsync();
        Task<ProjectCycleViewModel> PostProjectCycle(ProjectCycleViewModel cycle);


        Task<List<ProjectsViewModel>> GetProjects();
        Task<ProjectsViewModel> GetProjectById(int id);
        Task<List<ProjectsViewModel>> FilterProjects(object filter);
        Task<ProjectsViewModel> PostProject(ProjectsViewModel project);
        Task<List<ProjectsViewModel>> GetProjectsAndCycles();
        Task<bool> ToggleProjectStatus(int projectId);
        Task<List<ProjectCycleViewModel>> GetActiveProjectCycles();
        Task<List<ProjectsViewModel>> GetActiveCycleProjects();
    }
}
