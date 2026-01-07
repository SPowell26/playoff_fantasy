-- Update unique constraint for player_stats to include season_type
-- This allows the same player to have stats for week 1 in both regular season and postseason

-- Drop existing constraint if it exists
ALTER TABLE player_stats 
DROP CONSTRAINT IF EXISTS player_stats_player_week_year_unique;

-- Create new unique constraint including season_type
ALTER TABLE player_stats 
ADD CONSTRAINT player_stats_player_week_year_season_unique 
UNIQUE (player_id, week, year, season_type);

-- Verify the constraint was created
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'player_stats'::regclass
AND conname = 'player_stats_player_week_year_season_unique';

