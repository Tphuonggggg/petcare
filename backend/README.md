# PetCareX Backend (ASP.NET Core)

This folder contains a starter ASP.NET Core Web API project scaffolded for use with an existing SQL Server database.

Quick steps:

1. Open PowerShell and go to this folder:

   cd backend

2. Install EF Core CLI (if you don't have it):

   dotnet tool install --global dotnet-ef

3. Restore packages and run:

   dotnet restore
   dotnet run

4. To reverse-engineer your existing database into EF Core models (run from `backend`):

   dotnet ef dbcontext scaffold "Server=.;Database=YourDatabaseName;Trusted_Connection=True;" Microsoft.EntityFrameworkCore.SqlServer -o Models -c ApplicationDbContext --context-dir Data --force

5. Update connection string:

- For development you can edit `appsettings.json` `ConnectionStrings.DefaultConnection`.
- For safer handling in production, set environment variable `ConnectionStrings__DefaultConnection` with your connection string.

Notes:
- Project targets .NET 8. If you need a different version, edit `<TargetFramework>` in `PetCareX.Api.csproj`.
- Swagger is enabled; XML comments are included in Swagger when you build the project with documentation file generation enabled.
