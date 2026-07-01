using Microsoft.EntityFrameworkCore;
using Meridian.API.Models;

namespace Meridian.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
}
