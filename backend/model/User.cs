public class User
{
    public int Id { get; set; }
    public string Email { get; set; }

    public string PasswaordHash { get; set; }

    public List<String> Favorites { get; set; }

    public string Role { get; set; }
}