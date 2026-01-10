# Script to manually trigger schedule fetch on hosted site

# Get SYSTEM_API_KEY from Railway environment variables
# You can find this in: Railway → Backend Service → Variables → SYSTEM_API_KEY

$SYSTEM_API_KEY = Read-Host "Enter your SYSTEM_API_KEY from Railway"

if ([string]::IsNullOrWhiteSpace($SYSTEM_API_KEY)) {
    Write-Host "Error: SYSTEM_API_KEY is required!" -ForegroundColor Red
    exit 1
}

$url = "https://playofffantasy-production.up.railway.app/api/status/fetch-schedule"

Write-Host "🔄 Triggering schedule fetch on hosted site..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Headers @{
        "X-System-API-Key" = $SYSTEM_API_KEY
        "Content-Type" = "application/json"
    } -UseBasicParsing
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

