using ResearchSuite.Dtos;

namespace ResearchSuite.Models
{
    public class ApiHandledException : Exception
    {
        public ApiErrorResponse Error { get; }

        public ApiHandledException(ApiErrorResponse error)
            : base($"API handled exception: {error?.Message}")
        {
            Error = error;
        }
    }
}
