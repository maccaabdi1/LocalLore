
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
                UserId = g.UserId.ToString(),
                Coordinates = g.Coordinates

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

            var gem = await _mongoDBService.GetGem(objectId);
            if (gem == null)
            {
                return NotFound(new { message = "gem not found." });
            }

            return Ok(gem);
        }
        [HttpPost]
        public async Task<ActionResult<Gem>> CreateGem([FromBody] GemCreateDto newGem)
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
        [HttpPatch("{id}/upvote")]
        public async Task<ActionResult> UpvoteGem(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
            {
                return BadRequest(new { message = "Invalid ID format." });
            }

            var gem = await _mongoDBService.GetGem(objectId);
            if (gem == null)
            {
                return NotFound(new { message = "Gem not found." });
            }

            gem.Upvotes += 1;
            await _mongoDBService.UpdateGem(gem);

            return NoContent();
        }
        [HttpPatch("{id}/downvote")]
        public async Task<ActionResult> DownvoteGem(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
            {
                return BadRequest(new { message = "Invalid ID format." });
            }

            var gem = await _mongoDBService.GetGem(objectId);
            if (gem == null)
            {
                return NotFound(new { message = "Gem not found." });
            }

            gem.Upvotes -= 1;
            await _mongoDBService.UpdateGem(gem);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGem(string id, [FromHeader(Name = "User-Id")] string userId)
        {
            if (!ObjectId.TryParse(id, out var gemObjectId))
            {
                return BadRequest(new { message = "Invalid gem ID format." });
            }

            if (!ObjectId.TryParse(userId, out var userObjectId))
            {
                return BadRequest(new { message = "Invalid user ID format." });
            }

            // Check if user exists and is admin
            var user = await _mongoDBService.GetUser(userObjectId);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            if (user.Role != "admin")
            {
                return StatusCode(403, new { message = "Only administrators can delete gems." });
            }

            var gem = await _mongoDBService.GetGem(gemObjectId);
            if (gem == null)
            {
                return NotFound(new { message = "Gem not found." });
            }

            await _mongoDBService.DeleteGem(gemObjectId);
            return NoContent();
        }
        
        


         
    }
}