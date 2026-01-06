# Test script to check invoice calculation logic
Write-Host "Testing invoice calculation logic..." -ForegroundColor Yellow

# Test data
$testInvoice = @{
    TotalAmount = 50000
    Items = @(
        @{
            Quantity = 1
            UnitPrice = 50000
            ProductName = "Test Product"
        }
    )
}

Write-Host "`nOriginal Invoice:" -ForegroundColor Cyan
Write-Host "TotalAmount: $($testInvoice.TotalAmount)" -ForegroundColor White

Write-Host "`nInvoice Items:" -ForegroundColor Cyan
foreach ($item in $testInvoice.Items) {
    $itemTotal = $item.Quantity * $item.UnitPrice
    Write-Host "  - $($item.ProductName): $($item.Quantity) x $($item.UnitPrice) = $itemTotal" -ForegroundColor White
}

# Calculate expected total from items
$calculatedTotal = 0
foreach ($item in $testInvoice.Items) {
    $calculatedTotal += $item.Quantity * $item.UnitPrice
}

Write-Host "`nCalculated Total from Items: $calculatedTotal" -ForegroundColor Green
Write-Host "Original TotalAmount: $($testInvoice.TotalAmount)" -ForegroundColor Green

if ($calculatedTotal -eq $testInvoice.TotalAmount) {
    Write-Host "✅ Calculation matches!" -ForegroundColor Green
} else {
    Write-Host "❌ Calculation MISMATCH!" -ForegroundColor Red
    Write-Host "Difference: $($calculatedTotal - $testInvoice.TotalAmount)" -ForegroundColor Red
}

Write-Host "`nPossible issues:" -ForegroundColor Yellow
Write-Host "1. Frontend sends incorrect TotalAmount" -ForegroundColor White
Write-Host "2. Database trigger recalculates incorrectly" -ForegroundColor White
Write-Host "3. Computed columns vs trigger calculation mismatch" -ForegroundColor White
Write-Host "4. Data type precision issues" -ForegroundColor White