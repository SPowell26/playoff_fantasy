# Quick script to check if the database schema has the required columns

$query = @"
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'player_stats' 
AND column_name IN ('season_type', 'receptions', 'league_id', 'team_id', 'game_id')
ORDER BY column_name;
"@

Write-Host "Checking player_stats table schema..." -ForegroundColor Yellow
Write-Host ""

try {
    $result = psql -U postgres -d fantasy_playoff_db -c $query 2>&1
    
    if ($result -match "column_name") {
        Write-Host $result
        Write-Host ""
        
        if ($result -match "season_type" -and $result -match "receptions") {
            Write-Host "✅ Schema looks good! season_type and receptions columns exist." -ForegroundColor Green
        } else {
            Write-Host "❌ Missing columns! Run the migration:" -ForegroundColor Red
            Write-Host "   cd backend" -ForegroundColor Yellow
            Write-Host "   psql -U postgres -d fantasy_playoff_db -f ..\fix-player-stats-schema.sql" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not check schema. Make sure PostgreSQL is running." -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

