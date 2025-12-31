# PowerShell script to import stats for a specific week
# Usage: .\import-specific-week.ps1 -Week 1 -Year 2025

param(
    [Parameter(Mandatory=$true)]
    [int]$Week,
    
    [Parameter(Mandatory=$true)]
    [int]$Year
)

$baseUrl = "http://localhost:3001"
$apiUrl = "$baseUrl/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Import Specific Week Stats" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Importing Week $Week, Year $Year..." -ForegroundColor Yellow
Write-Host "   This may take a minute as it processes all games..." -ForegroundColor Gray

try {
    $body = @{
        week = $Week
        year = $Year
    } | ConvertTo-Json

    $importResult = Invoke-RestMethod -Uri "$apiUrl/stats/import-week" -Method POST -ContentType "application/json" -Body $body
    
    # Handle both camelCase and snake_case response formats
    $gamesProcessed = if ($importResult.gamesProcessed) { $importResult.gamesProcessed } else { $importResult.games_processed }
    $gamesFailed = if ($importResult.gamesFailed) { $importResult.gamesFailed } else { $importResult.games_failed }
    $statsProcessed = if ($importResult.statsProcessed) { $importResult.statsProcessed } else { $importResult.stats_processed }
    $playersCreated = if ($importResult.playersCreated) { $importResult.playersCreated } else { $importResult.players_created }
    
    Write-Host "✅ Import complete!" -ForegroundColor Green
    Write-Host "   Week: $($importResult.week)" -ForegroundColor Gray
    Write-Host "   Year: $($importResult.year)" -ForegroundColor Gray
    Write-Host "   Games processed: $gamesProcessed" -ForegroundColor Gray
    Write-Host "   Games failed: $gamesFailed" -ForegroundColor Gray
    Write-Host "   Stats processed: $statsProcessed" -ForegroundColor Gray
    if ($playersCreated -gt 0) {
        Write-Host "   Players created: $playersCreated" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Import Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to import week: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "   Error: $($errorDetails.error)" -ForegroundColor Yellow
        if ($errorDetails.message) {
            Write-Host "   Message: $($errorDetails.message)" -ForegroundColor Yellow
        }
    }
    exit 1
}

