namespace Grepolis.Scrapper.Models
{
    public class MapFile
    {
        public int version { get; set; }
        public string sourceRoot { get; set; }
        public string[] sources { get; set; }
        public string[] names { get; set; }
        public string mappings { get; set; }
    }
}
