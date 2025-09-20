public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;

    public string PasswaordHash { get; set; } = null!;

    public List<String> Favorites { get; set; } = null!;

    public string Role { get; set; } = null!;
}