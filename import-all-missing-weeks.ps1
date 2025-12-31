# PowerShell script to import all missing weeks for 2025 regular season
# Usage: .\import-all-missing-weeks.ps1

param(
    [int]$StartWeek = 2,
    [int]$EndWeek = 17,
    [int]$Year = 2025
)

$baseUrl = "http://localhost:3001"
$apiUrl = "$baseUrl/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Import All Missing Weeks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Importing weeks $StartWeek through $EndWeek for year $Year" -ForegroundColor Yellow
Write-Host ""

$totalProcessed = 0
$totalFailed = 0
$successfulWeeks = @()
$failedWeeks = @()

for ($week = $StartWeek; $week -le $EndWeek; $week++) {
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host "Processing Week $week..." -ForegroundColor Yellow
    
    try {
        $body = @{
            week = $week
            year = $Year
        } | ConvertTo-Json

        $importResult = Invoke-RestMethod -Uri "$apiUrl/stats/import-week" -Method POST -ContentType "application/json" -Body $body
        
        # Handle both camelCase and snake_case response formats
        $gamesProcessed = if ($importResult.gamesProcessed) { $importResult.gamesProcessed } else { $importResult.games_processed }
        $gamesFailed = if ($importResult.gamesFailed) { $importResult.gamesFailed } else { $importResult.games_failed }
        $statsProcessed = if ($importResult.statsProcessed) { $importResult.statsProcessed } else { $importResult.stats_processed }
        $playersCreated = if ($importResult.playersCreated) { $importResult.playersCreated } else { $importResult.players_created }
        
        if ($gamesProcessed -gt 0) {
            Write-Host "  ✅ Week $week imported successfully!" -ForegroundColor Green
            Write-Host "     Games processed: $gamesProcessed" -ForegroundColor Gray
            if ($gamesFailed -gt 0) {
                Write-Host "     Games failed: $gamesFailed" -ForegroundColor Yellow
            }
            Write-Host "     Stats processed: $statsProcessed" -ForegroundColor Gray
            if ($playersCreated -gt 0) {
                Write-Host "     Players created: $playersCreated" -ForegroundColor Gray
            }
            $successfulWeeks += $week
            $totalProcessed++
        } else {
            Write-Host "  ⚠️  Week $week processed but no games found (might be a bye week)" -ForegroundColor Yellow
            Write-Host "     Response: $($importResult.message)" -ForegroundColor Gray
            $successfulWeeks += $week
            $totalProcessed++
        }
    } catch {
        Write-Host "  ❌ Failed to import Week $week" -ForegroundColor Red
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-Host "     Error: $($errorDetails.error)" -ForegroundColor Yellow
            if ($errorDetails.message) {
                Write-Host "     Message: $($errorDetails.message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "     Error: $_" -ForegroundColor Yellow
        }
        $failedWeeks += $week
        $totalFailed++
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500  # Small delay between requests
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Import Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total weeks processed: $totalProcessed" -ForegroundColor Green
Write-Host "Total weeks failed: $totalFailed" -ForegroundColor $(if ($totalFailed -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($successfulWeeks.Count -gt 0) {
    Write-Host "✅ Successfully imported weeks: $($successfulWeeks -join ', ')" -ForegroundColor Green
}

if ($failedWeeks.Count -gt 0) {
    Write-Host "❌ Failed weeks: $($failedWeeks -join ', ')" -ForegroundColor Red
    Write-Host "   You can try importing these individually:" -ForegroundColor Yellow
    foreach ($week in $failedWeeks) {
        Write-Host "   .\import-specific-week.ps1 -Week $week -Year $Year" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Verifying final status..." -ForegroundColor Yellow
try {
    $availableWeeks = Invoke-RestMethod -Uri "$apiUrl/stats/available-weeks" -Method GET
    Write-Host "✅ Database now contains $($availableWeeks.count) week(s)" -ForegroundColor Green
    if ($availableWeeks.weeks.Count -gt 0) {
        $year2025Weeks = $availableWeeks.weeks | Where-Object { $_.year -eq 2025 } | Sort-Object week
        if ($year2025Weeks.Count -gt 0) {
            Write-Host "   2025 weeks: $($year2025Weeks.week -join ', ')" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠️  Could not verify final status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

