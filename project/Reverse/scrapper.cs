// Reference:
// https://stackoverflow.com/a/10576770

using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Grepolis
{
    public class MapFile
    {
        public int version { get; set; }
        public string sourceRoot { get; set; }
        public string[] sources { get; set; }
        public string[] names { get; set; }
        public string mappings { get; set; }
    }

    public class ScrapperConstants
    {
        /// <summary>
        /// To get URL's from css files
        /// </summary>
        public const Regex LinkRegex = new Regex(@"\b(?:https?://|www\.)\S+\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        /// <summary>
        /// .css files to target (obtained from index.html)
        /// </summary>
        public const string[] CssPaths = new string[]
        {
            "/cache/css/merged/game_0.css",
            "/cache/css/merged/game_1.css",
            "/cache/css/merged/game_2.css",
            "/cache/css/merged/game_3.css",
            "/cache/css/merged/game_4.css",
            "/cache/css/merged/game_5.css",
            "/cache/css/merged/game_6.css",
            "/cache/css/merged/game_7.css"
        };

        /// <summary>
        /// .map files to target (obtained from game.min.js)
        /// </summary>
        public const string[] mapPaths = new string[]
        {
            "/cache/js/merged/base/game.base.js.map"
        };
    }

    public static class ScrapperHelper
    {
        /// <summary>
        /// get .js link paths from .map file
        /// </summary>
        public static string[] GetMapSourcePaths(MapFile map)
        {
            List<string> result = new List<string>();
            string rootPath = map.sourceRoot.replace("/placeholder/placeholder", "");

            foreach (string url in map.sources)
            {
                string path = rootPath + url.replace("../..", "");

                if (!result.Contains(path))
                {
                    result.Add(path);
                }
            }
        }

        /// <summary>
        /// get links from .css files
        /// </summary>
        public static string[] GetCssImagePaths(string css, string cdn)
        {
            List<string> result = new List<string>();

            foreach (Match match in ScrapperConstants.LinkRegex.Matches(css))
            {
                string path = match.Value.replace(cdn, "");

                if (!result.Contains(path))
                {
                    result.Add(path);
                }
            }

            return result.ToArray();
        }
    }

    public class Scrapper
    {
        public readonly string CDN;
        public readonly string OutPath;

        public Scrapper(string cdn, string outPath)
        {
            CDN = cdn;
            OutPath = outPath;
        }

        public void DownloadFile(string path)
        {
            // code here
        }

        public void DownloadFiles(string[] paths)
        {
            // code here
        }

        public void Run()
        {
            /*
            string[] jsPaths = ScrapperHelper.GetMapSourcePaths();
            string[] cssPaths = ScrapperConstants.CssPaths;
            string[] imagePaths = ScrapperHelper.GetCssImagePaths();
            */
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            Scrapper scrapper = new Scrapper("https://gpen.innogamescdn.com", "./downloaded/");
        }
    }
}
