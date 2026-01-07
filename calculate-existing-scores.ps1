# PowerShell script to calculate weekly scores for all existing weeks that don't have scores yet
# Usage: .\calculate-existing-scores.ps1 -LeagueId 1 -Year 2025 -SeasonType regular

param(
    [Parameter(Mandatory=$true)]
    [int]$LeagueId,
    
    [Parameter(Mandatory=$true)]
    [int]$Year,
    
    [Parameter(Mandatory=$false)]
    [string]$SeasonType = "regular"
)

$baseUrl = "http://localhost:3001"
$apiUrl = "$baseUrl/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Calculate Scores for Existing Weeks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# First, get available weeks (filtered by season type if specified)
Write-Host "Getting available weeks from database..." -ForegroundColor Yellow
try {
    $availableWeeksUrl = "$apiUrl/stats/available-weeks"
    if ($SeasonType) {
        $availableWeeksUrl += "?seasonType=$SeasonType"
    }
    $availableWeeks = Invoke-RestMethod -Uri $availableWeeksUrl -Method GET
    
    if ($availableWeeks.weeks.Count -eq 0) {
        Write-Host "❌ No weeks found in database" -ForegroundColor Red
        exit 1
    }
    
    # Filter for the specified year and get week numbers
    $weeksToProcess = $availableWeeks.weeks | Where-Object { $_.year -eq $Year } | Select-Object -ExpandProperty week | Sort-Object
    
    Write-Host "✅ Found $($weeksToProcess.Count) weeks to process: $($weeksToProcess -join ', ')" -ForegroundColor Green
    Write-Host ""
    
    $successCount = 0
    $failCount = 0
    
    foreach ($week in $weeksToProcess) {
        Write-Host "Processing Week $week..." -ForegroundColor Yellow
        
        try {
            # Import the week again - this will now calculate scores (since we updated import-week)
            $body = @{
                week = $week
                year = $Year
            } | ConvertTo-Json

            $result = Invoke-RestMethod -Uri "$apiUrl/stats/import-week" -Method POST -ContentType "application/json" -Body $body
            
            if ($result.bestBallResults -and $result.bestBallResults.Count -gt 0) {
                $leagueResult = $result.bestBallResults | Where-Object { $_.leagueId -eq $LeagueId }
                if ($leagueResult) {
                    Write-Host "  ✅ Week $week - Scores calculated: $($leagueResult.scoresCalculated)" -ForegroundColor Green
                    $successCount++
                } else {
                    Write-Host "  ⚠️  Week $week - No scores calculated for this league" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  ⚠️  Week $week - No scoring results" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ❌ Week $week failed: $_" -ForegroundColor Red
            $failCount++
        }
        
        Write-Host ""
        Start-Sleep -Milliseconds 500
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Success: $successCount weeks" -ForegroundColor Green
    Write-Host "Failed: $failCount weeks" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

