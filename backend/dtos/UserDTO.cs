public class UserDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public List<string> Favorites { get; set; } = null!;
    public string Role { get; set; } = null!;
}