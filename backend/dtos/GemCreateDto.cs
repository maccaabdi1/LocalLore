using System.Text.Json.Serialization;

public class GemCreateDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [JsonPropertyName("address")]
    public string Address { get; set; } = null!;

    [JsonPropertyName("coordinates")]
    public CoordinatesDto Coordinates { get; set; } = new CoordinatesDto();

    [JsonPropertyName("category")]
    public string Category { get; set; } = null!;

    [JsonPropertyName("photoUrl")]
    public string PhotoUrl { get; set; } = null!;

    [JsonPropertyName("upvotes")]
    public int Upvotes { get; set; }

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = null!;
}

public class CoordinatesDto
{
    [JsonPropertyName("lat")]
    public double Lat { get; set; }

    [JsonPropertyName("lng")]
    public double Lng { get; set; }
}
