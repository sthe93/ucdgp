using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using ResearchSuite.Dtos.Suite;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Services
{
    public class LoginService : ILoginService
    {
        private readonly AppSettings settings;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration configuration;
        public LoginService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> options, IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            settings = options.Value;
            this.configuration = configuration;
        }

        public async Task<EmployeeBioDto> GetEmployeeBio(string username)
        {
            var _username = configuration["INTEGRATIONCIRCLE_TOKEN_INTERNAL_USER"];
            var password = configuration["INTEGRATIONCIRCLE_TOKEN_INTERNAL_PASSWORD"];
            var credentials = new LoginRequestDto
            {
                GrantType = "password",
                Username = _username,
                Password = password
            };

            var loginUrl = $"{settings.ResearchGateway}Auth/GetToken";
            var tokenResponse = await APICaller.HttpCallJsonAsync<LoginRequestDto, TokenResponse>(loginUrl, "POST", credentials);


            var url = $"{settings.ResearchGateway}GetEmployeeBio/Username/{username}";
            var result = await APICaller.HttpCallJsonAsync<string, EmployeeBioDto>(url, "GET", "", tokenResponse.TokenString);
            return result;
        }

        //public async Task<string?> Login(string username, string password)
        //{
        //    var encodedUsername = Uri.EscapeDataString(username);
        //    var encodedPassword = Uri.EscapeDataString(password);
        //    var url = $"{settings.ResearchGateway}Authentication/Login?Username={encodedUsername}&Password={encodedPassword}";
        //    var result = await APICaller.HttpCallJsonAsync<string, LoginResponseDto>(url, "POST", "");
        //    _httpContextAccessor.HttpContext?.Session.SetString("token", result?.TokenString ?? "");
        //    return result?.TokenString;
        //}
        public async Task<string?> Login(string username, string password)
        {
            var url = $"{settings.ResearchGateway}Authentication/LoginJson";

            var loginRequest = new LoginResource
            {
                Username = username,
                Password = password
            };

            var result = await APICaller.HttpCallJsonAsync<LoginResource, LoginResponseDto>(url, "POST", loginRequest);

            _httpContextAccessor.HttpContext?.Session.SetString("token", result?.TokenString ?? "");

            return result?.TokenString;
        }
    }
}
