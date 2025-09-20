using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

public class Gem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("name")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [BsonElement("description")]
    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [BsonElement("category")]
    [JsonPropertyName("category")]
    public string Category { get; set; } = null!;

    [BsonElement("photoUrl")]
    [JsonPropertyName("photoUrl")]
    public string PhotoURL { get; set; } = null!;

    [BsonElement("address")]
    [JsonPropertyName("address")]
    public string Address { get; set; } = null!;

    [BsonElement("upvotes")]
    [JsonPropertyName("upvotes")]
    public int Upvotes { get; set; } = 0;

    [BsonElement("coordinates")]
    [JsonPropertyName("coordinates")]
    public Coordinates Coordinates { get; set; } = new Coordinates();
    
    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("userId")]
    public ObjectId UserId { get; set; }

}

public class Coordinates
{
    [BsonElement("lat")]
    [JsonPropertyName("lat")]
    public double Lat { get; set; }

    [BsonElement("lng")]
    [JsonPropertyName("lng")]
    public double Lng { get; set; }
}