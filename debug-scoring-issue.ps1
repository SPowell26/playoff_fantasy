# Debug script to check why scores aren't being calculated

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Debug Scoring Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$leagueId = 1
$week = 1
$year = 2025
$seasonType = "regular"

Write-Host "Checking database state for:" -ForegroundColor Yellow
Write-Host "  League ID: $leagueId"
Write-Host "  Week: $week"
Write-Host "  Year: $year"
Write-Host "  Season Type: $seasonType"
Write-Host ""

# Check if teams exist
Write-Host "1. Checking teams in league..." -ForegroundColor Cyan
psql -U postgres -d fantasy_playoff_db -c "SELECT id, name, owner FROM teams WHERE league_id = $leagueId;"

Write-Host ""
Write-Host "2. Checking rosters for teams..." -ForegroundColor Cyan
psql -U postgres -d fantasy_playoff_db -c "
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(tr.player_id) as roster_count
FROM teams t
LEFT JOIN team_rosters tr ON t.id = tr.team_id AND tr.league_id = $leagueId
WHERE t.league_id = $leagueId
GROUP BY t.id, t.name
ORDER BY t.name;
"

Write-Host ""
Write-Host "3. Checking if players on rosters have stats for Week $week..." -ForegroundColor Cyan
psql -U postgres -d fantasy_playoff_db -c "
SELECT 
    t.name as team_name,
    COUNT(DISTINCT tr.player_id) as total_players,
    COUNT(DISTINCT ps.player_id) as players_with_stats
FROM teams t
JOIN team_rosters tr ON t.id = tr.team_id AND tr.league_id = $leagueId
LEFT JOIN player_stats ps ON tr.player_id = ps.player_id 
    AND ps.week = $week 
    AND ps.year = $year
    AND (ps.season_type = '$seasonType' OR (ps.season_type IS NULL AND '$seasonType' = 'regular'))
WHERE t.league_id = $leagueId
GROUP BY t.id, t.name
ORDER BY t.name;
"

Write-Host ""
Write-Host "4. Sample of player stats for Week $week..." -ForegroundColor Cyan
psql -U postgres -d fantasy_playoff_db -c "
SELECT 
    p.name,
    p.position,
    ps.week,
    ps.year,
    ps.season_type,
    ps.fantasy_points
FROM players p
JOIN player_stats ps ON p.id = ps.player_id
WHERE ps.week = $week AND ps.year = $year
LIMIT 10;
"

Write-Host ""
Write-Host "5. Checking team_weekly_scores table..." -ForegroundColor Cyan
psql -U postgres -d fantasy_playoff_db -c "
SELECT 
    team_id,
    week,
    year,
    season_type,
    weekly_score
FROM team_weekly_scores
WHERE week = $week AND year = $year AND season_type = '$seasonType'
LIMIT 10;
"

