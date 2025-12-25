using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace PetCareX.Api.Services
{
    /// <summary>
    /// Lightweight background service used during development to keep the process alive
    /// and emit periodic diagnostics messages. It is safe to remove in production.
    /// </summary>
    public class DebugKeepAliveService : BackgroundService
    {
        /// <summary>
        /// Runs the background loop until cancellation is requested.
        /// </summary>
        /// <param name="stoppingToken">Cancellation token signaled to stop execution.</param>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Log periodically to show service is alive
            while (!stoppingToken.IsCancellationRequested)
            {
                System.Console.WriteLine("DebugKeepAliveService: running");
                try
                {
                    await Task.Delay(5000, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
            System.Console.WriteLine("DebugKeepAliveService: stopping");
        }
    }
}
