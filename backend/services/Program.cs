using LocalLore.Models;
using LocalLore.Service;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDBSettings>(
    builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<MongoDBService>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddControllers(); // Add this line to register the controllers

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapControllers();
}

app.UseHttpsRedirection();



app.MapGet("/locallore", () =>
{

})
.WithName("GetUsers");

app.MapControllers(); // Add this line to map the controller routes

app.Run();


