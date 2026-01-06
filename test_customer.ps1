$body = @{
    fullName = "Test Khach Hang"
    phone = "0901234567"
    email = "test@example.com"
    memberSince = "2024-01-01"
    membershipTierId = 1
} | ConvertTo-Json

Write-Host "Testing customer creation API..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/customers" `
      -Method Post `
      -ContentType "application/json" `
      -Body $body -ErrorAction Stop
    
    Write-Host "Success!"
    $response.Content
}
catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response:"
    $responseBody
}
