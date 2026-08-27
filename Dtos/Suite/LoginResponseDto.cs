namespace ResearchSuite.Dtos.Suite
{
    public class LoginResponseDto
    {
        public string TokenString { get; set; } = string.Empty;
    }

    public class LoginResponseTraceItDto
{
    public string token { get; set; } = string.Empty;
}

    public class ApiMessageResponse
{
    public string message { get; set; } = string.Empty;
}
}
