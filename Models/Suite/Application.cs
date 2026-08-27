namespace ResearchSuite.Models.Suite
{
    public class Application
    {
        public int AppId { get; set; }
        public Guid ApplicationGuid { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string AppDescription { get; set; } = string.Empty;
        public string AppIcon { get; set; } = string.Empty;
        public string AppUrl { get; set; } = string.Empty;
        public string ConnectionString { get; set; } = string.Empty;
        public string Roles { get; set; } = string.Empty;
    }
}
