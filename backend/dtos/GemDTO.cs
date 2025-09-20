public class GemDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string PhotoUrl { get; set; } = null!;
    public int Upvotes { get; set; }
    public string UserId { get; set; } = null!;
}