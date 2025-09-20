
using System.Diagnostics.Eventing.Reader;
using LocalLore.Service;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
namespace Backend.Controllers

{
    [Route("/gems")]
    [ApiController]

    public class GemController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;

        public GemController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }
        [HttpGet]
        public async Task<ActionResult<List<Gem>>> GetGems()
        {
            var gems = await _mongoDBService.GetGems();
            var gemsDtos = gems.Select(g => new GemDto
            {
                Id = g.Id.ToString(),
                Name = g.Name,
                Description = g.Description,
                Address = g.Address,
                Category = g.Category,
                PhotoUrl = g.PhotoURL,
                Upvotes = g.Upvotes,
                UserId = g.UserId.ToString()


            }).ToList();
            return Ok(gemsDtos);
        }
       [HttpGet("{id}")]
        public async Task<ActionResult<Gem>> GetGemById(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
            {
                return BadRequest(new { message = "Invalid ID format." });
            }

            var gem = await _mongoDBService.GetUser(objectId);
            if (gem == null)
            {
                return NotFound(new { message = "gem not found." });
            }

            return Ok(gem);
        }
        [HttpPost]
        public async Task<ActionResult<Gem>> CreateUser([FromBody] GemCreateDto newGem)
        {
            var gem = new Gem
            {
                Name = newGem.Name,
                Description = newGem.Description,
                Address = newGem.Address,
                Coordinates = new Coordinates { Lat = newGem.Coordinates.Lat, Lng = newGem.Coordinates.Lng },
                Category = newGem.Category,
                PhotoURL = newGem.PhotoUrl,
                Upvotes = newGem.Upvotes,
                UserId = MongoDB.Bson.ObjectId.Parse(newGem.UserId)
            };

            await _mongoDBService.CreateGem(gem);
            return CreatedAtAction(nameof(GetGemById), new { id = gem.Id }, gem);
        }
        
        


         
    }
}