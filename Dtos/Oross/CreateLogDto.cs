namespace ResearchSuite.Dtos.Oross
{
    public class CreateLogDto
    {
     public CreateLogDto(int level, string message, string exception, string source, string userName, string method)
        {
            Level = level;
            Message = message;
            Exception = exception;
            Source = source;
            UserName = userName;
            Method = method;
        }

        public int Id { get; set; }
        public int Level { get; set; }
        public string Message { get; set; }
        public string Exception { get; set; }
        public string Source { get; set; }
        public string UserName { get; set; }
        public string Method { get; set; }

    }
}
