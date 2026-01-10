using System;

namespace PetCareX.Api.Services;

/// <summary>
/// Helper class for managing Vietnam timezone (UTC+7)
/// </summary>
public static class TimeZoneHelper
{
    private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    /// <summary>
    /// Gets current time in Vietnam timezone (UTC+7)
    /// </summary>
    public static DateTime GetVietnamNow()
    {
        return TimeZoneInfo.ConvertTime(DateTime.UtcNow, VietnamTimeZone);
    }

    /// <summary>
    /// Gets today's date in Vietnam timezone
    /// </summary>
    public static DateTime GetVietnamToday()
    {
        return GetVietnamNow().Date;
    }

    /// <summary>
    /// Converts UTC DateTime to Vietnam timezone
    /// </summary>
    public static DateTime ConvertToVietnam(DateTime utcDateTime)
    {
        if (utcDateTime.Kind == DateTimeKind.Unspecified)
            utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
        
        return TimeZoneInfo.ConvertTime(utcDateTime, VietnamTimeZone);
    }

    /// <summary>
    /// Gets current time as DateOnly in Vietnam timezone
    /// </summary>
    public static DateOnly GetVietnamDateOnly()
    {
        return DateOnly.FromDateTime(GetVietnamToday());
    }
}
