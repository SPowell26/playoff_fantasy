-- Update existing game_schedule table to support automated stat pulling
-- Add missing columns needed for cron scheduler

-- Add season_type column (regular, postseason, preseason)
ALTER TABLE game_schedule 
ADD COLUMN IF NOT EXISTS season_type VARCHAR(20) DEFAULT 'regular';

-- Add game_id column (ESPN game ID)
ALTER TABLE game_schedule 
ADD COLUMN IF NOT EXISTS game_id VARCHAR(50);

-- Add game_name column (e.g., "Chiefs vs Bills")
ALTER TABLE game_schedule 
ADD COLUMN IF NOT EXISTS game_name VARCHAR(255);

-- Update unique constraint to include season_type and game_id
-- First, drop the old unique constraint if it exists
ALTER TABLE game_schedule 
DROP CONSTRAINT IF EXISTS game_schedule_year_week_home_team_away_team_key;

-- Add new unique constraint
ALTER TABLE game_schedule 
ADD CONSTRAINT game_schedule_unique 
UNIQUE(year, week, season_type, game_id);

-- Add index for efficient lookups by date (for cron job)
CREATE INDEX IF NOT EXISTS idx_game_schedule_date ON game_schedule(game_date);

-- Update comment
COMMENT ON TABLE game_schedule IS 'Stores weekly NFL game schedules with game times for automated stat pulling';

