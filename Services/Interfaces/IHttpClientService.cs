namespace ResearchSuite.Services.Interfaces
{
     public interface IHttpClientService
    {
        Task<T> HttpGetAsync<T>(string url, string token = "");
        Task<TResponse> HttpPostAsync<TRequest, TResponse>(string url, TRequest _object, string token = "");
    }
}
