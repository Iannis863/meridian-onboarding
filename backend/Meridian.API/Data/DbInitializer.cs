using Meridian.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Meridian.API.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Check if database is already seeded
        if (context.Employees.Any())
        {
            return;
        }

        var employees = new List<Employee>
        {
            new Employee
            {
                Name = "Alice Vance",
                Email = "alice.vance@meridian.com",
                Department = "Engineering",
                MondayLocation = "Office",
                TuesdayLocation = "Office",
                WednesdayLocation = "Office",
                ThursdayLocation = "Remote",
                FridayLocation = "Remote"
            },
            new Employee
            {
                Name = "Bob Smith",
                Email = "bob.smith@meridian.com",
                Department = "Engineering",
                MondayLocation = "Remote",
                TuesdayLocation = "Office",
                WednesdayLocation = "Office",
                ThursdayLocation = "Office",
                FridayLocation = "Remote"
            },
            new Employee
            {
                Name = "Charlie Brown",
                Email = "charlie.brown@meridian.com",
                Department = "Sales",
                MondayLocation = "Remote",
                TuesdayLocation = "Remote",
                WednesdayLocation = "Office",
                ThursdayLocation = "Office",
                FridayLocation = "Office"
            },
            new Employee
            {
                Name = "Diana Prince",
                Email = "diana.prince@meridian.com",
                Department = "Marketing",
                MondayLocation = "Office",
                TuesdayLocation = "Remote",
                WednesdayLocation = "Office",
                ThursdayLocation = "Remote",
                FridayLocation = "Office"
            },
            new Employee
            {
                Name = "Ethan Hunt",
                Email = "ethan.hunt@meridian.com",
                Department = "HR",
                MondayLocation = "Office",
                TuesdayLocation = "Office",
                WednesdayLocation = "Remote",
                ThursdayLocation = "Office",
                FridayLocation = "Remote"
            },
            new Employee
            {
                Name = "Fiona Gallagher",
                Email = "fiona.gallagher@meridian.com",
                Department = "Finance",
                MondayLocation = "Remote",
                TuesdayLocation = "Office",
                WednesdayLocation = "Remote",
                ThursdayLocation = "Office",
                FridayLocation = "Office"
            },
            new Employee
            {
                Name = "George Clark",
                Email = "george.clark@meridian.com",
                Department = "Engineering",
                MondayLocation = "Office",
                TuesdayLocation = "Remote",
                WednesdayLocation = "Office",
                ThursdayLocation = "Office",
                FridayLocation = "Remote"
            },
            new Employee
            {
                Name = "Hannah Abbott",
                Email = "hannah.abbott@meridian.com",
                Department = "Finance",
                MondayLocation = "Office",
                TuesdayLocation = "Office",
                WednesdayLocation = "Remote",
                ThursdayLocation = "Remote",
                FridayLocation = "Office"
            }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();
    }
}
