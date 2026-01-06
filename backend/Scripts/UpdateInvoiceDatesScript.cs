using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;

namespace PetCareX.Api.Scripts
{
    /// <summary>
    /// Script để cập nhật ngày tháng năm của các Invoice từ hôm nay trở về tương lai
    /// </summary>
    public class UpdateInvoiceDatesScript
    {
        public static async Task Execute(ApplicationDbContext context)
        {
            Console.WriteLine("🔄 Bắt đầu cập nhật ngày tháng Invoice...");

            try
            {
                var invoices = await context.Invoices.ToListAsync();
                
                if (invoices.Count == 0)
                {
                    Console.WriteLine("❌ Không có Invoice nào để cập nhật");
                    return;
                }

                var oldestDate = invoices.Min(i => i.InvoiceDate);
                var newestDate = invoices.Max(i => i.InvoiceDate);
                var todayDate = DateTime.Today;
                var daysDifference = (newestDate.Date - oldestDate.Date).TotalDays;

                Console.WriteLine($"📊 Thông tin hiện tại:");
                Console.WriteLine($"   - Tổng Invoice: {invoices.Count}");
                Console.WriteLine($"   - Ngày cũ nhất: {oldestDate:yyyy-MM-dd}");
                Console.WriteLine($"   - Ngày mới nhất: {newestDate:yyyy-MM-dd}");
                Console.WriteLine($"   - Khoảng cách: {daysDifference} ngày");
                Console.WriteLine($"   - Hôm nay: {todayDate:yyyy-MM-dd}");

                // Cập nhật: Ngày cũ nhất thành (hôm nay - daysDifference), ngày mới nhất thành hôm nay
                foreach (var invoice in invoices)
                {
                    var daysFromOldest = (invoice.InvoiceDate.Date - oldestDate.Date).TotalDays;
                    var newDate = todayDate.AddDays(daysFromOldest - daysDifference);
                    
                    // Giữ lại giờ:phút:giây ban đầu
                    var timeOfDay = invoice.InvoiceDate.TimeOfDay;
                    invoice.InvoiceDate = newDate.Add(timeOfDay);
                }

                await context.SaveChangesAsync();
                
                Console.WriteLine("\n✅ Cập nhật thành công!");
                Console.WriteLine($"📅 Dữ liệu mới:");
                
                var updatedInvoices = await context.Invoices.ToListAsync();
                var newOldest = updatedInvoices.Min(i => i.InvoiceDate);
                var newNewest = updatedInvoices.Max(i => i.InvoiceDate);
                
                Console.WriteLine($"   - Ngày cũ nhất: {newOldest:yyyy-MM-dd HH:mm:ss}");
                Console.WriteLine($"   - Ngày mới nhất: {newNewest:yyyy-MM-dd HH:mm:ss}");
                
                // Hiển thị 5 Invoice gần đây nhất
                Console.WriteLine("\n📋 5 Invoice gần đây nhất:");
                var recent = updatedInvoices.OrderByDescending(i => i.InvoiceDate).Take(5).ToList();
                foreach (var inv in recent)
                {
                    Console.WriteLine($"   ID: {inv.InvoiceId}, Ngày: {inv.InvoiceDate:yyyy-MM-dd HH:mm:ss}, Số tiền: {inv.FinalAmount}đ");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi: {ex.Message}");
                throw;
            }
        }
    }
}
