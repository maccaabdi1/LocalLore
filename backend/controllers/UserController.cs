using System;
using System.Diagnostics.Eventing.Reader;
using System.Threading.Tasks;
using LocalLore.Models;
using LocalLore.Service;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers

{
    [Route("api/users")]
    [ApiController]

    public class UserController : ControllerBase
    {

        private readonly MongoDBService _mongoDBService;
        public UserController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        [HttpGet]
        public async Task<ActionResult<List<User>>> GetUsers()
        {
            var users = await _mongoDBService.GetAsync();
            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id.ToString(),
                Name = u.Name,
                Email = u.Email,
                Favorites = u.Favorites.Select(f => f.ToString()).ToList(),
                Role = u.Role
            }).ToList();
            return Ok(userDtos);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User newUser)
        {
            await _mongoDBService.CreateAsync(newUser);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await _mongoDBService.GetAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }
    }
}

