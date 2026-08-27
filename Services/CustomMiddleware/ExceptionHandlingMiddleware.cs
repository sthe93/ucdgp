using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using ResearchSuite.Dtos;
using ResearchSuite.Dtos.Oross;
using ResearchSuite.Dtos.Suite;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Oross;
using ResearchSuite.Services.Interfaces;
using System;
using System.Net.Http.Headers;
using System.Security.Policy;
using System.Text;
using System.Text.Json;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Services.CustomMiddleware
{
    //public class ExceptionHandlingMiddleware (RequestDelegate next, IHttpClientFactory httpClientFactory, IHostEnvironment env, IConfiguration configuration, IOptions<AppSettings> appSettings)
    //{

    public class ExceptionHandlingMiddleware
    {

        private readonly AppSettings _appSettings;
        private readonly HttpClient _httpClient;
        private readonly RequestDelegate _next;

        private readonly string baseUrl;
        private readonly string username;
        private readonly string password;
        private readonly IHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExceptionHandlingMiddleware(IHttpContextAccessor httpContextAccessor, RequestDelegate next, IHttpClientFactory httpClientFactory, IHostEnvironment env, IConfiguration configuration, IOptions<AppSettings> appSettings)
        {
            _httpClient = httpClientFactory.CreateClient("LoggerClient");
            _appSettings = appSettings.Value;
            _next = next;
            baseUrl = configuration["TraceIt:BaseUrl"];
            username = configuration["TRACEIT_TOKEN_USER"];
            password = configuration["TRACEIT_TOKEN_PASSWORD"];
            _env = env;
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ApiHandledException ex)
            {
                Console.WriteLine($"Handled by API: {ex.Error.Message}");
                await DisplayErrorPage(context, ex, ex.Error.TraceId);
            }
            catch (Exception ex)
            {

                //string gateWayToken = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                string gateWayToken = string.Empty;
                var httpContext = _httpContextAccessor.HttpContext;

                if (httpContext != null && httpContext.Features.Get<ISessionFeature>() != null)
                {
                    gateWayToken = httpContext.Session.GetString("token") ?? string.Empty;
                }

                var loginRequest = new
                {
                    username = username,
                    password = password
                };

                string controllerName = context.Request.RouteValues["controller"]?.ToString();
                string actionName = context.Request.RouteValues["action"]?.ToString();

                var authLoginUrl = $"{_appSettings.ResearchGateway}Auth/login";
                var authLogin_result = await APICaller.HttpCallJsonAsync<object, LoginResponseTraceItDto>(authLoginUrl, "POST", loginRequest, gateWayToken);

                if (!string.IsNullOrWhiteSpace(authLogin_result?.token))
                {
                    string requestId = Guid.NewGuid().ToString();
                    var tokenResult = authLogin_result?.token;
                    var createUrl = $"{_appSettings.ResearchGateway}AuditLog/Create";
                    var logDetails = new CreateLogDto(2, $"Trace ID: {requestId} Message: {ex.Message} {ex.InnerException?.Message}", ex.ToString(), "Research Suite", "Research_Suite_USER", $"{controllerName}/{actionName}");

                    var response = await APICaller.HttpCallJsonAsync<CreateLogDto, ApiMessageResponse>(createUrl, "POST", logDetails, tokenResult);

                    await DisplayErrorPage(context, ex, requestId);
                }
            }
        }

        private async Task DisplayErrorPage(HttpContext context, Exception ex, string traceId)
        {
            context.Features.Set<IExceptionHandlerFeature>(new ExceptionHandlerFeature
            {
                Error = ex,
                Path = context.Request.Path
            });

            context.Items["TraceId"] = traceId;

            context.SetEndpoint(null);
            context.Request.RouteValues.Clear();

            context.Request.Path = "/Home/Error";
            context.Request.QueryString = QueryString.Empty; // avoid stale query params confusing the error action

            try
            {
                await _next(context);
            }
            catch (Exception secondEx)
            {
                // Error action itself failed — don't let this crash out to DeveloperExceptionPage
                Console.Error.WriteLine($"Error handling page itself threw {secondEx}");
                context.Response.ContentType = "text/plain";
                await context.Response.WriteAsync("An unexpected error occurred.");
            }
        }

        private TokenResponse GetToken()
        {
            var data = new TokenData()
            {
                Username = username,
                Password = password
            };
            var url = this.baseUrl + "Auth/login";
            var content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json");
            var response = _httpClient.PostAsync(url, content).Result;
            string responseBody = response.Content.ReadAsStringAsync().Result;
            return JsonSerializer.Deserialize<TokenResponse>(responseBody);
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

    }
}
