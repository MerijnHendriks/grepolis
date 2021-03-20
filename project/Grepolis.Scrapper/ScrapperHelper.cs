using System.Collections.Generic;
using System.Text.RegularExpressions;
using Game.Common.Utils;

namespace Grepolis.Scrapper
{
    public static class ScrapperHelper
    {
        /// <summary>
        /// get .js link paths from .map file
        /// </summary>
        public static string[] GetMapSourcePaths(string map)
        {
            MapFile data = Json.Deserialize<MapFile>(map);
            List<string> result = new List<string>();
            string rootPath = data.sourceRoot.Replace("/placeholder/placeholder", "");

            foreach (string url in data.sources)
            {
                string path = rootPath + url.Replace("../..", "");

                if (!result.Contains(path))
                {
                    result.Add(path);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// get links from .css files
        /// </summary>
        public static string[] GetCssImagePaths(string css, string cdn)
        {
            List<string> result = new List<string>();

            foreach (Match match in ScrapperConstants.LinkRegex.Matches(css))
            {
                string path = match.Value.Replace(cdn, "");

                if (!result.Contains(path))
                {
                    result.Add(path);
                }
            }

            return result.ToArray();
        }
    }
}
