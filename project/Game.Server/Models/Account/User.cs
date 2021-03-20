using System.Text.Json.Serialization;

namespace Game.Server.Models.Account
{
    public class User
    {
        [JsonPropertyName("id")]
        public int ID { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("password")]
        public string Password { get; set; }

        public User(int id, string username, string password)
        {
            ID = id;
            Username = username;
            Password = password;
        }
    }
}
