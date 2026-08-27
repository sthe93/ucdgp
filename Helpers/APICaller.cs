using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using ResearchSuite.Dtos;
using ResearchSuite.Dtos.Suite;
using ResearchSuite.Helpers.common;
using ResearchSuite.Helpers.Ucdp;
using ResearchSuite.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;

namespace ResearchSuite.Helpers
{
    public static class APICaller
    {
        private static readonly HttpClient httpClient = new();
        public static async Task<T?> HttpCallJsonAsync<T>(string url, string Method, string? token = null)
        {
            try
            {
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<T>(responseBody);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"Request error: {e.Message}");
                return default;
            }
        }

        public static async Task<TResponse?> HttpCallJsonAsync<TRequest, TResponse>(string url, string method, TRequest obj, string? token = null)
        {
            try
            {
                using var request = new HttpRequestMessage(new HttpMethod(method), url);

                if (!string.Equals(method, "GET", StringComparison.OrdinalIgnoreCase) && obj != null)
                {
                    string json = JsonConvert.SerializeObject(obj);
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");
                }

                if (!string.IsNullOrWhiteSpace(token))
                {
                    request.Headers.Authorization =
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                    var accessInfo = JwtHelper.ExtractGatewayAccessInfo(token);
                    GatewayHeaderHelper.ApplyHeaders(request, accessInfo);
                }

                using HttpResponseMessage response = await httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"HTTP {(int)response.StatusCode} {response.ReasonPhrase}: {url}\n{responseBody}");
                    return default;
                }

                if (typeof(TResponse) == typeof(string))
                    return (TResponse)(object)responseBody;

                return JsonConvert.DeserializeObject<TResponse>(responseBody);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"Request error: {e.Message}");
                return default;
            }
            catch (Exception e)
            {
                Console.WriteLine($"Unexpected error: {e.Message}");
                return default;
            }
        }
        public static async Task<TResponse?> AuthenticatedApiCallAsync<TRequest, TResponse>(string url, string method, TRequest obj)
        {
            var httpContext = HttpContextHolder.Accessor.HttpContext;
            if (httpContext == null)
                return default;

            var token = httpContext.Session.GetString("token");
            if (string.IsNullOrWhiteSpace(token))
                return default;

            using var request = new HttpRequestMessage(new HttpMethod(method), url);

            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var accessInfo = JwtHelper.ExtractGatewayAccessInfo(token);
            GatewayHeaderHelper.ApplyHeaders(request, accessInfo);

            if (!string.Equals(method, "GET", StringComparison.OrdinalIgnoreCase) && obj != null)
            {
                request.Content = new StringContent(
                    JsonConvert.SerializeObject(obj),
                    Encoding.UTF8,
                    "application/json");
            }

            using var response = await httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                httpContext.Session.Remove("token");

                throw new HttpRequestException($"AuthenticatedApiCallAsync Error: Status Code: {response.StatusCode}, Response Body: {body}");
            }


            if (!response.IsSuccessStatusCode)
            {
                if (!TextFormatHelper.IsLikelyJson(body))
                {
                    throw new HttpRequestException(
                        $"AuthenticatedApiCallAsync Error: Non-JSON response from {url}, Status: {response.StatusCode}, Non-JSON response received (likely an error page or redirect): {TextFormatHelper.Truncate(body, 2000)}");
                }

                ApiErrorResponse? error;
                try
                {
                    error = JsonConvert.DeserializeObject<ApiErrorResponse>(body);
                }
                catch (JsonReaderException ex)
                {
                    throw new HttpRequestException(
                        $"AuthenticatedApiCallAsync Error: Status Code: {response.StatusCode}, Body: {TextFormatHelper.Truncate(body, 2000)}", ex);
                }

                if (error != null && error.HandledInAPI == true)
                {
                    throw new ApiHandledException(error);
                }

                throw new HttpRequestException($"AuthenticatedApiCallAsync Error: Status Code: {response.StatusCode}, Response Body: {body}");
            }

            if (typeof(TResponse) == typeof(string))
                return (TResponse)(object)body;

            try
            {
                return JsonConvert.DeserializeObject<TResponse>(body);
            }
            catch (JsonReaderException ex)
            {
                throw new JsonReaderException($"AuthenticatedApiCallAsync Error: Status Code: {response.StatusCode}, Response Body: {body}, Error: {ex.Message}");
            }
        }


    }
}