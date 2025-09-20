
using System.Diagnostics.Eventing.Reader;
using LocalLore.Service;
using Microsoft.AspNetCore.Mvc;
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


         
    }
}