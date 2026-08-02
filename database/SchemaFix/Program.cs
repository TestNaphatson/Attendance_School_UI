using Npgsql;

string connectionString =
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=school_attendance_db;Username=postgres;Password=root";

string scriptPath = Path.GetFullPath(
    Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "fix-attendance-schema.sql")
);

string sql = await File.ReadAllTextAsync(scriptPath);
await using var connection = new NpgsqlConnection(connectionString);
await connection.OpenAsync();
await using var command = new NpgsqlCommand(sql, connection);
await command.ExecuteNonQueryAsync();

Console.WriteLine("Attendance schema updated successfully.");
