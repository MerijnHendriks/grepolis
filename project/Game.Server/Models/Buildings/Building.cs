using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Game.Server.Models.Buildings
{
    public class Building
    {
        [JsonPropertyName("type")]
        public EBuildingType Type { get; set; }

        [JsonPropertyName("cost")]
        public Dictionary<EResourceType, int> Cost { get; set; }

        [JsonPropertyName("constructionTime")]
        public Dictionary<int, int> ConstructionTime { get; set; }

        [JsonIgnore]
        public Action OnBuild { get; set; }

        [JsonIgnore]
        public Action OnUpgrade { get; set; }

        [JsonIgnore]
        public Action OnUpdate { get; set; }
    }
}
