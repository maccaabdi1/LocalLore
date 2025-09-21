using System;
using System.Diagnostics.Eventing.Reader;
using System.Threading.Tasks;
using LocalLore.Models;
using LocalLore.Service;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Backend.Controllers
{
    [Route("/users")]
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
            var users = await _mongoDBService.GetUsers();

            if (users == null)
            {
                return Ok(new List<UserDto>()); // Return an empty list if no users are found
            }

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id.ToString(),
                Name = u.Name,
                Email = u.Email,
                Favorites = (u.Favorites != null ? u.Favorites.Select(f => f.ToString()).ToList() : new List<string>()), // Handle null Favorites
                Role = u.Role
            }).ToList();

            return Ok(userDtos);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User newUser)
        {
            await _mongoDBService.CreateUser(newUser);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
        }

        public class RegisterRequest
        {
            public string Email { get; set; } = null!;
            public string Name { get; set; } = null!;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = null!;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required");

            var existingUser = await _mongoDBService.GetEmail(request.Email);
            if (existingUser != null)
                return Conflict("Email already in use");

            var newUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                Role = "user"
            };

            await _mongoDBService.CreateUser(newUser);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required");

            var user = await _mongoDBService.GetEmail(request.Email);
            if (user == null)
                return NotFound("User not found");

            return Ok(new { message = "Log in successful", user });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
            {
                return BadRequest(new { message = "Invalid ID format." });
            }

            var user = await _mongoDBService.GetUser(objectId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(user);
        }
    }
}

