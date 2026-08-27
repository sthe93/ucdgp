using Newtonsoft.Json;

namespace ResearchSuite.Helpers.common
{
    public static class ObjectSetGetJson
    {
        public static void SetObjectAsJson(this ISession session, string key, object value)
        {
            session.SetString(key, JsonConvert.SerializeObject(value));
        }

        public static T? GetObjectFromJson<T>(this ISession session, string key)
        {
            var value = session.GetString(key);
            if (string.IsNullOrWhiteSpace(value))
                return default;

            try
            {
                return JsonConvert.DeserializeObject<T>(value);
            }
            catch
            {
                return default;
            }
        }


    }
}
