namespace Game.Server.Models
{
    public class Unit
    {
        public Resource[] Cost { get; set; }
        public int ConstructionTime { get; set; }
        public int Speed { get; set; }
        public EGod God  { get; set; }
    }
}
