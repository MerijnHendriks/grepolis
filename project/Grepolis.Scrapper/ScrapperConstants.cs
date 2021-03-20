using System.Text.RegularExpressions;

namespace Grepolis.Scrapper
{
    public static class ScrapperConstants
    {
        /// <summary>
        /// To get URL's from css files
        /// </summary>
        public static readonly Regex LinkRegex;

        /// <summary>
        /// .css files to target
        /// </summary>
        public static readonly string[] CssPaths;

        /// <summary>
        /// .map files to target 
        /// </summary>
        public static readonly string[] MapPaths;

        static ScrapperConstants()
        {
            // https://stackoverflow.com/a/10576770
            LinkRegex = new Regex(@"\b(?:https?://|www\.)\S+\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);

            // obtained from game.min.js
            MapPaths = new string[]
            {
                "/cache/js/merged/base/game.base.js.map"
            };

            // obtained from index.html
            CssPaths = new string[]
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
        }
    }
}
