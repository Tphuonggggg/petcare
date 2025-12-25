using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with automatic model validation producing 400 responses
builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context =>
        new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(context.ModelState);
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = System.IO.Path.ChangeExtension(System.Reflection.Assembly.GetEntryAssembly()?.Location, ".xml");
    if (System.IO.File.Exists(xmlFile)) options.IncludeXmlComments(xmlFile);
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// AutoMapper
builder.Services.AddAutoMapper(typeof(PetCareX.Api.Mapping.MappingProfile));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// DebugKeepAliveService removed.
// Temporary diagnostic hosted service to keep the process alive and emit heartbeats.
builder.Services.AddHostedService<PetCareX.Api.Services.DiagnosticHostedService>();

var app = builder.Build();

// Diagnostic lifecycle events to help capture unexpected shutdowns
app.Lifetime.ApplicationStarted.Register(() => Console.WriteLine("Application lifecycle: Started"));
app.Lifetime.ApplicationStopping.Register(() =>
{
    Console.WriteLine("Application lifecycle: Stopping");
    try
    {
        Console.WriteLine($"Stopping at: {DateTime.UtcNow:o}");
        Console.WriteLine("Stack trace (at stopping):\n" + Environment.StackTrace);
    }
    catch (Exception ex)
    {
        Console.WriteLine("Failed to write stopping diagnostics: " + ex);
    }
});
app.Lifetime.ApplicationStopped.Register(() => Console.WriteLine("Application lifecycle: Stopped"));

// Global exception handlers to catch non-logged errors
AppDomain.CurrentDomain.UnhandledException += (s, e) =>
{
    Console.WriteLine("UnhandledDomainException: " + (e.ExceptionObject?.ToString() ?? "(null)"));
};
TaskScheduler.UnobservedTaskException += (s, e) =>
{
    Console.WriteLine("UnobservedTaskException: " + e.Exception);
    e.SetObserved();
};

// Log key startup info (mask connection string for safety)
try
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection") ?? "(none)";
    var masked = conn.Length > 20 ? conn.Substring(0, 10) + "..." + conn.Substring(conn.Length - 7) : conn;
    Console.WriteLine($"Startup: Environment={builder.Environment.EnvironmentName}, ConnectionString={masked}");
}
catch (Exception ex)
{
    Console.WriteLine("Failed to read startup configuration: " + ex);
}

// Always enable Swagger for API documentation
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Enable CORS for browser-based requests (uses the default policy configured above)
app.UseCors();

app.UseAuthorization();

app.MapControllers();

try
{
    Console.WriteLine("Starting web host...");
    app.Run();
}
catch (Exception ex)
{
    // Ensure any startup exceptions are visible in console logs
    Console.WriteLine("Unhandled exception during host run: " + ex);
    throw;
}