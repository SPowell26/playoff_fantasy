-- Add defensive_touchdowns column to player_stats table
-- This column tracks individual defensive players' touchdowns (interception returns, fumble recoveries)

ALTER TABLE player_stats
ADD COLUMN IF NOT EXISTS defensive_touchdowns INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN player_stats.defensive_touchdowns IS 'Touchdowns scored by defensive players (interception returns, fumble recoveries)';