using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text.Json.Serialization;

namespace PetCareX.Api;

/// <summary>
/// Schema filter to exclude properties with JsonIgnore attribute from Swagger schema.
/// </summary>
public class SwaggerIgnoreFilter : ISchemaFilter
{
    /// <summary>
    /// Applies the filter to remove JsonIgnore properties.
    /// </summary>
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema?.Properties == null)
            return;

        var excludedProperties = context.Type.GetProperties()
            .Where(t => t.GetCustomAttribute<JsonIgnoreAttribute>()?.Condition == JsonIgnoreCondition.Always)
            .Select(d => d.Name.ToCamelCase());

        foreach (var excludedProperty in excludedProperties)
        {
            if (schema.Properties.ContainsKey(excludedProperty))
                schema.Properties.Remove(excludedProperty);
        }
    }
}

/// <summary>
/// String extension methods.
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Converts a string to camelCase.
    /// </summary>
    public static string ToCamelCase(this string str)
    {
        if (string.IsNullOrEmpty(str) || char.IsLower(str[0]))
            return str;
        return char.ToLower(str[0]) + str.Substring(1);
    }
}