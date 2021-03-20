using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;
using Game.Common.Utils;
using Grepolis.Scrapper.Constants;
using Grepolis.Scrapper.Models;

namespace Grepolis.Scrapper.Helpers
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

            result.Sort();
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

            result.Sort();
            return result.ToArray();
        }

        /// <summary>
        /// convert .jpg to .png
        /// </summary>
        public static byte[] ConvertJpgToPng(string filepath)
        {
            Bitmap image;

            using (MemoryStream ms = new MemoryStream())
            {
                using (FileStream fs = File.OpenRead(filepath))
                {
                    image = (Bitmap)Image.FromStream(fs);
                    image.Save(ms, ImageFormat.Png);
                    return ms.ToArray();
                }
            }
        }
    }
}
