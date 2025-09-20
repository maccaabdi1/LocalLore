using LocalLore.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace LocalLore.Service;

public class MongoDBService
{
    private readonly IMongoCollection<User> _userCollection;
    private readonly IMongoCollection<Gem> _gemCollection;

    public MongoDBService(IOptions<MongoDBSettings> mongoDBSettings)
    {
        var mongoClient = new MongoClient(
            mongoDBSettings.Value.ConnectionURI);

        var mongoDatabase = mongoClient.GetDatabase(
            mongoDBSettings.Value.DatabaseName);

        _userCollection = mongoDatabase.GetCollection<User>(
            mongoDBSettings.Value.UserCollectionName);

        _gemCollection = mongoDatabase.GetCollection<Gem>(
            mongoDBSettings.Value.GemCollectionName);
    }
    ///ALL USER STUFF
    public async Task<List<User>> GetUsers() =>
        await _userCollection.Find(new BsonDocument()).ToListAsync();

    public async Task CreateUser(User user) =>
        await _userCollection.InsertOneAsync(user);

    public async Task<User?> GetAsync(int id) =>
        await _userCollection.Find(x => x.Id == new ObjectId(id.ToString())).FirstOrDefaultAsync();

    public async Task<User> GetEmail(string email) =>
        await _userCollection.Find(x => x.Email == email).FirstOrDefaultAsync();
    ///ALL GEM STUFF
    public async Task<List<Gem>> GetGems() =>
        await _gemCollection.Find(new BsonDocument()).ToListAsync();
}   
