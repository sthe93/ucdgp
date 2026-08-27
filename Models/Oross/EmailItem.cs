using System.Text;
using Newtonsoft.Json;

namespace ResearchSuite.Models.Oross
{
    public class EmailItem
    {
        public string value { get; set; } = string.Empty;
        public string ConvertToList(string json)
        {
            if (string.IsNullOrEmpty(json)) return string.Empty;
            var list = JsonConvert.DeserializeObject<List<EmailItem>>(json)?.Select(i => i.value).ToList();
            var toReturn = new StringBuilder();
            for (int i = 0; i < list.Count; i++)
            {
                toReturn.Append(list[i]);
                if(i + 1 != list.Count) {
                    toReturn.Append(";");
                }
            }
            return toReturn.ToString();
        }
    }
}
