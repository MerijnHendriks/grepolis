using System;
using Game.Common.Constants;
using Game.Common.Utils;
using Grepolis.Scrapper.Constants;
using Grepolis.Scrapper.Helpers;

namespace Grepolis.Scrapper.Utils
{
    public class ScrapperUtil
    {
        public readonly string CDN;
        public readonly string OutPath;

        public ScrapperUtil(string cdn)
        {
            CDN = cdn;
            OutPath = "downloaded".FromCwd();
        }

        public void DownloadFile(string path)
        {
            Console.WriteLine(path);

            string filepath = OutPath + path;
            byte[] body = HttpRequest.Send(CDN + path, HttpMethod.Get);

            if (body != null)
            {
                // save file
                VFS.WriteFile(filepath, body);
            }

            if (body != null && path.GetFileExtension() == ".jpg")
            {
                // convert jpg to png
                VFS.WriteFile(filepath.Replace(".jpg", ".png"), ScrapperHelper.ConvertJpgToPng(filepath));
                VFS.DeleteFile(filepath);
            }
        }

        public void DownloadFiles(string[] paths)
        {
            foreach (string path in paths)
            {
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
