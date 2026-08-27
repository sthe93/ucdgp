using ResearchSuite.Models.Oross;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Services.Interfaces
{
    public interface ILookupService
    {
        Task<List<LookupDto>> GetLookups(int lookupTypeId);
    }
}
