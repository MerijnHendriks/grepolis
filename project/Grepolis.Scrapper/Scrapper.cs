using System;
using System.Text;
using Game.Common.Constants;
using Game.Common.Utils;

namespace Grepolis.Scrapper
{
    public class Scrapper
    {
        public readonly string CDN;
        public readonly string OutPath;

        public Scrapper(string cdn)
        {
            CDN = cdn;
            OutPath = "downloaded".FromCwd();
        }

        public void DownloadFile(string path)
        {
            VFS.WriteFile(OutPath + path, HttpRequest.Send(CDN + path, HttpMethod.Get));
        }

        public void DownloadFiles(string[] paths)
        {
            foreach (string path in paths)
            {
                Console.WriteLine(path);
                DownloadFile(path);
            }
        }

        public void Run()
        {
            // get js files
            DownloadFiles(ScrapperConstants.MapPaths);

            string[] mapFiles = VFS.GetFiles(OutPath + "/cache/js/merged/base/");

            foreach (string filepath in mapFiles)
            {
                string[] paths = ScrapperHelper.GetMapSourcePaths(VFS.ReadTextFile(filepath));
                DownloadFiles(paths);
            }

            // get css files
            DownloadFiles(ScrapperConstants.CssPaths);

            // get images
            string[] cssFiles = VFS.GetFiles(OutPath + "/cache/css/merged/");

            foreach (string filepath in cssFiles)
            {
                string[] paths = ScrapperHelper.GetCssImagePaths(VFS.ReadTextFile(filepath), CDN);
                DownloadFiles(paths);
            }
        }
    }
}
