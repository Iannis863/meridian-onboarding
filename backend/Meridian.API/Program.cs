using Meridian.API.Data;
using Meridian.API.Models;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Register DB Context with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS for local development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

// Initialize and Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the database.");
    }
}

// GET /api/employees: Fetch employees with optional department filter and search by name/email
app.MapGet("/api/employees", async (AppDbContext context, string? department, string? search) =>
{
    IQueryable<Employee> query = context.Employees;

    if (!string.IsNullOrEmpty(department))
    {
        query = query.Where(e => e.Department.ToLower() == department.ToLower());
    }

    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(e => e.Name.ToLower().Contains(search.ToLower()) || 
                             e.Email.ToLower().Contains(search.ToLower()));
    }

    return await query.ToListAsync();
})
.WithName("GetEmployees");

// GET /api/employees/day: Fetch where employees are located for a specific weekday (defaults to today)
app.MapGet("/api/employees/day", async (AppDbContext context, string? day) =>
{
    string targetDay = day ?? DateTime.Today.DayOfWeek.ToString();

    // Verify it is a weekday
    var weekdays = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };
    if (!weekdays.Contains(targetDay, StringComparer.OrdinalIgnoreCase))
    {
        targetDay = "Monday"; // Fallback for weekends
    }

    var employees = await context.Employees.ToListAsync();

    var result = employees.Select(e => new
    {
        e.Id,
        e.Name,
        e.Email,
        e.Department,
        Day = targetDay,
        Location = targetDay.ToLower() switch
        {
            "monday" => e.MondayLocation,
            "tuesday" => e.TuesdayLocation,
            "wednesday" => e.WednesdayLocation,
            "thursday" => e.ThursdayLocation,
            "friday" => e.FridayLocation,
            _ => "Office"
        }
    });

    return Results.Ok(result);
})
.WithName("GetEmployeesByDay");

// PUT /api/employees/{id}/schedule: Update hybrid schedule with 3-day office / 2-day remote validation
app.MapPut("/api/employees/{id}/schedule", async (int id, UpdateScheduleRequest request, AppDbContext context) =>
{
    var employee = await context.Employees.FindAsync(id);
    if (employee == null)
    {
        return Results.NotFound(new { Message = $"Employee with ID {id} not found." });
    }

    // Validate 3-day office / 2-day remote constraint
    var locations = new[] {
        request.MondayLocation,
        request.TuesdayLocation,
        request.WednesdayLocation,
        request.ThursdayLocation,
        request.FridayLocation
    };

    int officeCount = locations.Count(l => string.Equals(l, "Office", StringComparison.OrdinalIgnoreCase));
    int remoteCount = locations.Count(l => string.Equals(l, "Remote", StringComparison.OrdinalIgnoreCase));

    if (officeCount != 3 || remoteCount != 2)
    {
        return Results.BadRequest(new { 
            Message = "Invalid schedule. The hybrid work model requires exactly 3 days in the office and 2 days remote." 
        });
    }

    // Update and normalize locations
    employee.MondayLocation = string.Equals(request.MondayLocation, "Office", StringComparison.OrdinalIgnoreCase) ? "Office" : "Remote";
    employee.TuesdayLocation = string.Equals(request.TuesdayLocation, "Office", StringComparison.OrdinalIgnoreCase) ? "Office" : "Remote";
    employee.WednesdayLocation = string.Equals(request.WednesdayLocation, "Office", StringComparison.OrdinalIgnoreCase) ? "Office" : "Remote";
    employee.ThursdayLocation = string.Equals(request.ThursdayLocation, "Office", StringComparison.OrdinalIgnoreCase) ? "Office" : "Remote";
    employee.FridayLocation = string.Equals(request.FridayLocation, "Office", StringComparison.OrdinalIgnoreCase) ? "Office" : "Remote";

    await context.SaveChangesAsync();

    return Results.Ok(employee);
})
.WithName("UpdateEmployeeSchedule");

app.Run();

// DTO and validation records
public record UpdateScheduleRequest(
    string MondayLocation,
    string TuesdayLocation,
    string WednesdayLocation,
    string ThursdayLocation,
    string FridayLocation
);


