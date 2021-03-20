// Reference
// https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
// http://www.iana.org/assignments/media-types/media-types.xhtml

using System.Collections.Generic;

namespace Game.Common.Constants
{
    public enum HttpMethod
    {
        Get = 0,
        Head,
        Post,
        Put,
        Delete,
        Connect,
        Options,
        Trace
    }

    public static class HttpConstants
    {
        /// <summary>
        /// HTML MIME types.
        /// </summary>
        public static readonly Dictionary<string, string> MIME;

        static HttpConstants()
        {
            MIME = new Dictionary<string, string>()
            {
                { ".bin", "application/octet-stream" },
                { ".txt", "text/plain" },
                { ".htm", "text/html" },
                { ".html", "text/html" },
                { ".css", "text/css" },
                { ".js", "text/javascript" },
                { ".map", "application/x-navimap" },
                { ".jpeg", "image/jpeg" },
                { ".jpg", "image/jpeg" },
                { ".png", "image/png" },
                { ".ico", "image/vnd.microsoft.icon" },
                { ".json", "application/json" }
            };
        }

        public static string GetMethodName(HttpMethod method)
        {
            switch (method)
            {
                case HttpMethod.Get:
                    return "GET";

                case HttpMethod.Head:
                    return "HEAD";

                case HttpMethod.Post:
                    return "POST";

                case HttpMethod.Put:
                    return "PUT";

                case HttpMethod.Delete:
                    return "DELETE";

                case HttpMethod.Connect:
                    return "CONNECT";

                case HttpMethod.Options:
                    return "OPTIONS";

                case HttpMethod.Trace:
                    return "TRACE";
            }

            return null;
        }

        /// <summary>
        /// Is MIME type valid?
        /// </summary>
		public static bool IsValidMime(string mime)
        {
            foreach (KeyValuePair<string, string> item in MIME)
            {
                if (item.Value == mime)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
