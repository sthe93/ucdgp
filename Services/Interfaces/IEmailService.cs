using ResearchSuite.Dtos.Oross;

namespace ResearchSuite.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmails(SendEmailReqeustDto sendEmailReqeustDto);
    }
}
