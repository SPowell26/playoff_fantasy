# PowerShell script to check current stats status
# Usage: .\check-stats-status.ps1

$baseUrl = "http://localhost:3001"
$apiUrl = "$baseUrl/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stats Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current week status
Write-Host "Current Week Status:" -ForegroundColor Yellow
try {
    $currentWeek = Invoke-RestMethod -Uri "$apiUrl/status/current-week" -Method GET
    Write-Host "✅ Current Week: $($currentWeek.currentWeek)" -ForegroundColor Green
    Write-Host "   ESPN Week: $($currentWeek.espnWeek)" -ForegroundColor Gray
    Write-Host "   Season Type: $($currentWeek.seasonType)" -ForegroundColor Gray
    Write-Host "   Year: $($currentWeek.seasonYear)" -ForegroundColor Gray
    Write-Host "   Last Updated: $($currentWeek.lastUpdated)" -ForegroundColor Gray
    if ($currentWeek.isPlayoffs) {
        Write-Host "   Playoff Round: $($currentWeek.playoffRound)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get current week status: $_" -ForegroundColor Red
    Write-Host ""
}

# Check available weeks
Write-Host "Available Weeks in Database:" -ForegroundColor Yellow
try {
    $availableWeeks = Invoke-RestMethod -Uri "$apiUrl/stats/available-weeks" -Method GET
    Write-Host "✅ Found $($availableWeeks.count) week(s):" -ForegroundColor Green
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
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan

