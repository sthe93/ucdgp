namespace ResearchSuite.Dtos.Oross
{
     public class Response(bool successful, string message)
    {
        public bool Successful { get; set; } = successful;
        public string Message { get; set; } = message;
    }
}
