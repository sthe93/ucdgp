using ResearchSuite.Dtos.Oross;
using ResearchSuite.Models.Oross;
using ResearchSuite.Services.Interfaces;
using System.Net;
using System.Text.Json;

namespace ResearchSuite.Services
{
    public class TraceItService(IHttpClientService httpClient, IConfiguration configuration) : ITraceItService
    {
        private readonly IHttpClientService httpClient = httpClient;
        private readonly IConfiguration configuration = configuration;
        private readonly string baseUrl = configuration["TraceIt:BaseUrl"];
        private readonly string credentials = configuration["TraceItCredentials"];

        #region Token
        private TokenResponse GetToken()
        {
            var creds = JsonSerializer.Deserialize<Credentials>(credentials);
            var data = new TokenData()
            {
                Username = creds.Username,
                Password = creds.Password
            };
            var url = this.baseUrl + "Auth/login";
            var token = this.httpClient.HttpPostAsync<TokenData, TokenResponse>(url, data).Result;
            return token;
        }

        class TokenData
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        class TokenResponse
        {
            public string token { get; set; }
        } 
        #endregion

        public Response CreateLog(CreateLogDto createLogDto)
        {
            var token = GetToken();
            var url = this.baseUrl + "audit-log/create";
            var result = this.httpClient.HttpPostAsync<CreateLogDto, HttpResponseMessage>(url, createLogDto, token.token).Result;
            return new Response(true, "");
        }
    }
}
