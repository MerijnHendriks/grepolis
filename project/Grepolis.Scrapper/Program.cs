namespace Grepolis.Scrapper
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Scrapper scrapper = new Scrapper("https://gpen.innogamescdn.com");
            scrapper.Run();
        }
    }
}
