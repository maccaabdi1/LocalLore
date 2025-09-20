
using System.Diagnostics.Eventing.Reader;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers

{
    [Route("api/users")]
    [ApiController]

    public class UserController : ControllerBase
    {
        static private List<User> users = new List<User>
        {
            new User
            {

                Id = 1,
                Email = "poop1@gmail.com"
            }
        };
        [HttpGet]
        public ActionResult<List<EventBookmark>> GetUsers()
        {
            return Ok(users);}
    }
}

