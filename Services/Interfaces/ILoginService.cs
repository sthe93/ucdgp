using ResearchSuite.Dtos.Suite;

namespace ResearchSuite.Services.Interfaces
{
    public interface ILoginService
    {
        Task<string?> Login(string username, string password);
        Task<EmployeeBioDto> GetEmployeeBio(string username);
    }
}
