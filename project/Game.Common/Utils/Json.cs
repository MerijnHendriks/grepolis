using System.Text.Json;
using System.Text.Json.Serialization;

namespace Game.Common.Utils
{
    public static class Json
    {
        private static JsonSerializerOptions options;

        static Json()
        {
            // prettify, allow comments, "123" is not a number
            options = new JsonSerializerOptions
            {
                WriteIndented = true,
                ReadCommentHandling = JsonCommentHandling.Skip,
                NumberHandling = JsonNumberHandling.Strict
            };
        }

        /// <summary>
        /// Convert object to json.
        /// Includes derived class members into object (bottom-up).
        /// </summary>
        public static string Serialize<T>(T o)
        {
            return JsonSerializer.Serialize(o, options);
        }

        /// <summary>
        /// Convert json to object.
        /// </summary>
        public static T Deserialize<T>(string json)
        {
            return JsonSerializer.Deserialize<T>(json, options);
        }
    }
}
