using LocalLore.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace LocalLore.Service;

public class MongoDBService
{
    private readonly IMongoCollection<User> _userCollection;

    public MongoDBService(IOptions<MongoDBSettings> mongoDBSettings)
    {
        var mongoClient = new MongoClient(
            mongoDBSettings.Value.ConnectionURI);

        var mongoDatabase = mongoClient.GetDatabase(
            mongoDBSettings.Value.DatabaseName);

        _userCollection = mongoDatabase.GetCollection<User>(
            mongoDBSettings.Value.CollectionName);
    }

    public async Task<List<User>> GetAsync() =>
        await _userCollection.Find(new BsonDocument()).ToListAsync();

    public async Task CreateAsync(User user) =>
        await _userCollection.InsertOneAsync(user);

    public async Task<User?> GetAsync(int id) =>
        await _userCollection.Find(x => x.Id == new ObjectId(id.ToString())).FirstOrDefaultAsync();

}