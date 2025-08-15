-- Check what leagues and teams exist
SELECT 'LEAGUES:' as type, id, name FROM leagues;

SELECT 'TEAMS:' as type, id, name, league_id FROM teams;

-- Check what players we have (first 10)
SELECT 'PLAYERS:' as type, id, name, position, team FROM players LIMIT 10;
