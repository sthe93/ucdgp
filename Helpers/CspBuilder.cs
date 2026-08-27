using System.Text;

namespace ResearchSuite.Helpers
{
    public static class CSPBuilder
    {
        public static string BuildCSP(string scriptNonce, string styleNonce, bool isDevelopment = false)
        {
            var sb = new StringBuilder();

            sb.Append("script-src 'self' 'nonce-" + scriptNonce + "' https://rum-agent.na-01.cloud.solarwinds.com; ");
            sb.Append("style-src 'self' 'unsafe-inline' blob:; ");

            sb.Append("font-src 'self'; ");
            sb.Append("img-src 'self' data:; ");
            sb.Append("media-src 'self'; ");
            sb.Append("manifest-src 'self'; ");

            sb.Append("connect-src 'self' https://rum-agent.na-01.cloud.solarwinds.com https://rum.collector.na-01.cloud.solarwinds.com");

            // Correct connect-src
            if (isDevelopment)
            {
                sb.Append(" https://localhost:7230 ws://localhost:7230 wss://localhost:7230");
            }
            sb.Append("; ");

            sb.Append("object-src 'none'; ");
            sb.Append("base-uri 'self'; ");
            sb.Append("form-action 'self'; ");
            sb.Append("frame-src 'self' blob:; ");

            sb.Append("frame-ancestors 'self'; ");
            sb.Append("child-src 'self' blob:; ");
            return sb.ToString();
        }

    }
}
