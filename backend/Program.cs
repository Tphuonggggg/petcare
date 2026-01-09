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
    
    // Configure Swagger to respect JsonIgnore attributes
    options.SchemaFilter<PetCareX.Api.SwaggerIgnoreFilter>();
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    try
    {
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions => {
                sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery);
                // Disable OutputClause to work with database triggers
                sqlOptions.ExecutionStrategy(x => new Microsoft.EntityFrameworkCore.SqlServer.Storage.Internal.SqlServerExecutionStrategy(x));
            });
        Console.WriteLine("✅ DbContext configured successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ DbContext configuration error: {ex.Message}");
        throw;
    }
});

// AutoMapper
try
{
    builder.Services.AddAutoMapper(typeof(PetCareX.Api.Mapping.MappingProfile));
    Console.WriteLine("✅ AutoMapper configured successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ AutoMapper configuration error: {ex.Message}");
}

// Register Stored Procedure Service
try
{
    builder.Services.AddScoped<PetCareX.Api.Services.IStoredProcedureService, PetCareX.Api.Services.StoredProcedureService>();
    Console.WriteLine("✅ Stored Procedure Service registered successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Stored Procedure Service registration error: {ex.Message}");
}
Console.WriteLine("⚠️ Stored Procedure Service temporarily disabled for testing");

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

// Add global exception handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next.Invoke();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Request exception: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync($"Error: {ex.Message}");
    }
});

// Always enable Swagger for API documentation
app.UseSwagger();
app.UseSwaggerUI();

// Only redirect to HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

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