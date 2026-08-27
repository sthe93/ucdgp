using static System.Net.Mime.MediaTypeNames;

namespace ResearchSuite.Models.Suite
{
    public class UserApplication
    {
        public string Username { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public IList<Application> Applications { get; set; } = new List<Application>();
    }
}
