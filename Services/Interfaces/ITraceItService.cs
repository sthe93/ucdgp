using ResearchSuite.Dtos.Oross;

namespace ResearchSuite.Services.Interfaces
{
    public interface ITraceItService
    {
        Response CreateLog(CreateLogDto createLogDto);
    }
}
