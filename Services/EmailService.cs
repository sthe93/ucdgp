using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ResearchSuite.Dtos.Oross;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Services
{
    public class EmailService : IEmailService
    {
        private readonly AppSettings settings;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public EmailService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> options)
        {
            _httpContextAccessor = httpContextAccessor;
            settings = options.Value;
        }
        public async Task SendEmails(SendEmailReqeustDto sendEmailReqeustDto)
        {
            var url = $"{settings.ResearchGateway}Submit/SendEmails";
            string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
            var result = await APICaller.AuthenticatedApiCallAsync<SendEmailReqeustDto, HttpResponseMessage>(url, "POST", sendEmailReqeustDto);
        }
    }
}
