using ResearchSuite.Dtos.Suite;

namespace ResearchSuite.Services.Interfaces
{
    public interface IProfileService
    {
        Task<EmployeeBioDto?> SyncAndGetProfileAsync(string username);
    }
}
