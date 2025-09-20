namespace LocalLore.Models;

public class MongoDBSettings
{
    public string ConnectionURI { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string UserCollectionName { get; set; } = null!;
    public string GemCollectionName { get; set; } = null!;
}