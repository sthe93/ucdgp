namespace ResearchSuite.Helpers
{
    public static class HttpContextHolder
    {
        public static IHttpContextAccessor Accessor { get; set; } = default!;
    }

}
