using System.Collections.Generic;
using System.Text.Json.Serialization;
using Game.Server.Models.Buildings;


namespace Game.Server.Models
{
    public class PlayerCity
    {
        [JsonPropertyName("playerID")]
        public int PlayerID { get; set; }

        [JsonPropertyName("resources")]
        public Dictionary<EResourceType, int> Resources { get; set; }

        [JsonPropertyName("buildings")]
        public Dictionary<EBuildingType, Building> Buildings { get; set; }

        public void GenerateNewy()
        {
            Resources = new Dictionary<EResourceType, int>
            {
                { EResourceType.Wood, 150 },
                { EResourceType.Stone, 150 },
                { EResourceType.Iron, 150 },
                { EResourceType.Population, 10 },
                { EResourceType.Devotion, 0 },
                { EResourceType.Culture, 0 },
                { EResourceType.Research, 0 },
                { EResourceType.Battle, 0 }
            };
        }
    }
}
