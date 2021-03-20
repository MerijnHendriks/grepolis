using Grepolis.Scrapper.Utils;

namespace Grepolis.Scrapper
{
    public class Program
    {
        public static void Main(string[] args)
        {
            ScrapperUtil scrapper = new ScrapperUtil("https://gpen.innogamescdn.com");
            scrapper.Run();
        }
    }
}
