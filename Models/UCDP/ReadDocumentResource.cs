using Newtonsoft.Json;

namespace ResearchSuite.Models.UCDP
{
    public class ReadDocumentResource
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        [JsonProperty("filename")]
        public string Filename { get; set; }
        [JsonProperty("uploadType")]
        public string UploadType { get; set; }
        [JsonProperty("documentExtention")]
        public string DocumentExtention { get; set; }
        [JsonProperty("applicationId")]
        public int ApplicationId { get; set; }
    }
}
