using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace LocalLore.Models;

public class User
{

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("name")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [BsonElement("email")]
    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;

    // public string PasswordHash { get; set; } = null!;

    [BsonElement("favorites")]
    [JsonPropertyName("favorites")]
    public List<ObjectId> Favorites { get; set; } = null!;

    [BsonElement("role")]
    [JsonPropertyName("role")]
    public string Role { get; set; } = null!;
}
