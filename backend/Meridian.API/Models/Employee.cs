namespace Meridian.API.Models;

public class Employee
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Department { get; set; }
    
    // Explicit hybrid schedule locations (Values: "Office" or "Remote")
    public required string MondayLocation { get; set; }
    public required string TuesdayLocation { get; set; }
    public required string WednesdayLocation { get; set; }
    public required string ThursdayLocation { get; set; }
    public required string FridayLocation { get; set; }
}
