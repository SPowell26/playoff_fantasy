# Quick one-liner to trigger schedule fetch
# Replace YOUR_SYSTEM_API_KEY with your actual key from Railway

$SYSTEM_API_KEY = "YOUR_SYSTEM_API_KEY"

Invoke-WebRequest -Uri "https://playofffantasy-production.up.railway.app/api/status/fetch-schedule" `
    -Method POST `
    -Headers @{
        "X-System-API-Key" = $SYSTEM_API_KEY
        "Content-Type" = "application/json"
    } `
    -UseBasicParsing

