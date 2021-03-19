namespace Game.Server.Models
{
    public class GroundUnit : Unit
    {
        public Resource[] Cost { get; set; }
        public GroundUnitCombat Attack { get; set; }
        public GroundUnitCombat Defense { get; set; }
        public int Booty { get; set; }
    }
}
