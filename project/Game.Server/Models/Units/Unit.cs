using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Game.Server.Models.Units
{
    public class Unit
    {
        [JsonPropertyName("type")]
        public EUnitType Type { get; set; }

        [JsonPropertyName("cost")]
        public Dictionary<EResourceType, int> Cost { get; set; }

        [JsonPropertyName("constructionTime")]
        public int ConstructionTime { get; set; }

        [JsonPropertyName("speed")]
        public int Speed { get; set; }

        [JsonPropertyName("god")]
        public EGod God  { get; set; }

        [JsonPropertyName("attack")]
        public Dictionary<EWeaponType, int> Attack { get; set; }

        [JsonPropertyName("defense")]
        public Dictionary<EWeaponType, int> Defense { get; set; }

        [JsonPropertyName("booty")]
        public int Booty { get; set; }

        [JsonPropertyName("transport")]
        public int Transport { get; set; }

        public Unit(EUnitType type, Dictionary<EResourceType, int> cost, int constructionTime, int speed, EGod god, Dictionary<EWeaponType, int> attack, Dictionary<EWeaponType, int> defense, int booty, int transport)
        {
            Type = type;
            Cost = cost;
            ConstructionTime = constructionTime;
            Speed = speed;
            God = god;
            Attack = attack;
            Defense = defense;
            Booty = booty;
            Transport = transport;
        }
    }
}
