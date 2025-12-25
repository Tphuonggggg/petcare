using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace PetCareX.Api.Services
{
    /// <summary>
    /// Temporary diagnostic hosted service used to emit periodic heartbeat messages
    /// and surface any exceptions during startup. Remove when debugging is complete.
    /// </summary>
    public class DiagnosticHostedService : IHostedService, IDisposable
    {
        private Timer? _timer;

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine($"DiagnosticHostedService: StartAsync (pid={Environment.ProcessId})");
            // Log a heartbeat every 5 seconds
            _timer = new Timer(_ => Console.WriteLine($"DiagnosticHostedService: heartbeat at {DateTime.UtcNow:o}"), null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("DiagnosticHostedService: StopAsync");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
