# Check if team_weekly_scores table exists and create it if needed

Write-Host "Checking if team_weekly_scores table exists..." -ForegroundColor Cyan

# Check if table exists
$checkTable = psql -U postgres -d fantasy_playoff_db -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_weekly_scores');"

if ($checkTable -match "t" -or $checkTable -match "true") {
    Write-Host "✅ Table team_weekly_scores already exists!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Checking if it has data..." -ForegroundColor Cyan
    psql -U postgres -d fantasy_playoff_db -c "SELECT COUNT(*) as total_records, COUNT(DISTINCT team_id) as teams, COUNT(DISTINCT week) as weeks FROM team_weekly_scores;"
} else {
    Write-Host "❌ Table does not exist. Creating it now..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create the table
    Get-Content create-team-weekly-scores-table.sql | psql -U postgres -d fantasy_playoff_db
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Table created successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error creating table. Please check the SQL file." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Next step: Run calculate-existing-scores.ps1 to populate scores for existing weeks" -ForegroundColor Yellow

