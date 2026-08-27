using System.Globalization;

namespace ResearchSuite.Helpers
{
    public static class TextFormatHelper
    {
        public static string FormatCurrency(string amount)
        {
            if (string.IsNullOrEmpty(amount)) return "0";

            var cleanAmount = amount.Replace(" ", "");
            if (decimal.TryParse(cleanAmount, NumberStyles.Any, CultureInfo.InvariantCulture, out var decimalAmount))
            {
                var cultureInfo = new CultureInfo("en-ZA");
                cultureInfo.NumberFormat.NumberGroupSeparator = ",";
                cultureInfo.NumberFormat.NumberDecimalSeparator = ".";
                cultureInfo.NumberFormat.NumberDecimalDigits = 2;

                return decimalAmount.ToString("N", cultureInfo);
            }
            return "0";

        }

        public static bool IsLikelyJson(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return false;

            var trimmed = content.TrimStart();
            return trimmed.Length > 0 && (trimmed[0] == '{' || trimmed[0] == '[');
        }

        public static string Truncate(string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value) || value.Length <= maxLength)
                return value;
            return value.Substring(0, maxLength) + "... [truncated]";
        }
    }
}
