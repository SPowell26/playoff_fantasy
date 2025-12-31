# PowerShell script to import 2025-2026 regular season stats
# Usage: .\import-weekly-stats.ps1

$baseUrl = "http://localhost:3001"
$apiUrl = "$baseUrl/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fantasy Stats Import Tool" -ForegroundColor Cyan
Write-Host "  2025-2026 Regular Season" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current week status
Write-Host "Step 1: Checking current week status..." -ForegroundColor Yellow
try {
    $currentWeek = Invoke-RestMethod -Uri "$apiUrl/status/current-week" -Method GET
    Write-Host "✅ Current Week: $($currentWeek.currentWeek)" -ForegroundColor Green
    Write-Host "   ESPN Week: $($currentWeek.espnWeek)" -ForegroundColor Gray
    Write-Host "   Season Type: $($currentWeek.seasonType)" -ForegroundColor Gray
    Write-Host "   Year: $($currentWeek.seasonYear)" -ForegroundColor Gray
    if ($currentWeek.isPlayoffs) {
        Write-Host "   Playoff Round: $($currentWeek.playoffRound)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get current week status: $_" -ForegroundColor Red
    Write-Host "   Make sure your backend server is running!" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check what weeks are already imported
Write-Host "Step 2: Checking available weeks in database..." -ForegroundColor Yellow
try {
    $availableWeeks = Invoke-RestMethod -Uri "$apiUrl/stats/available-weeks" -Method GET
    Write-Host "✅ Found $($availableWeeks.count) week(s) in database:" -ForegroundColor Green
    if ($availableWeeks.weeks.Count -gt 0) {
        foreach ($week in $availableWeeks.weeks) {
            Write-Host "   - Week $($week.week), Year $($week.year)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   No weeks found in database yet." -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get available weeks: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Import current week
Write-Host "Step 3: Importing current week stats..." -ForegroundColor Yellow
Write-Host "   This may take a minute as it processes all games..." -ForegroundColor Gray
try {
    $importResult = Invoke-RestMethod -Uri "$apiUrl/stats/weekly-update" -Method POST
    Write-Host "✅ Import complete!" -ForegroundColor Green
    Write-Host "   Games processed: $($importResult.games_processed)" -ForegroundColor Gray
    Write-Host "   Games failed: $($importResult.games_failed)" -ForegroundColor Gray
    Write-Host "   Player stats inserted: $($importResult.player_stats_inserted)" -ForegroundColor Gray
    Write-Host "   Player stats updated: $($importResult.player_stats_updated)" -ForegroundColor Gray
    if ($importResult.dst_stats_inserted) {
        Write-Host "   D/ST stats inserted: $($importResult.dst_stats_inserted)" -ForegroundColor Gray
    }
    if ($importResult.dst_stats_updated) {
        Write-Host "   D/ST stats updated: $($importResult.dst_stats_updated)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to import current week: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "   Error: $($errorDetails.error)" -ForegroundColor Yellow
        if ($errorDetails.message) {
            Write-Host "   Message: $($errorDetails.message)" -ForegroundColor Yellow
        }
    }
    exit 1
}

# Step 4: Verify import
Write-Host "Step 4: Verifying import..." -ForegroundColor Yellow
try {
    $updatedWeeks = Invoke-RestMethod -Uri "$apiUrl/stats/available-weeks" -Method GET
    Write-Host "✅ Verification complete!" -ForegroundColor Green
    Write-Host "   Total weeks in database: $($updatedWeeks.count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed to verify import: $_" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Import Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Run this script again during games to get live updates!" -ForegroundColor Yellow
Write-Host "   The import uses ON CONFLICT, so it's safe to re-run." -ForegroundColor Gray
Write-Host ""

