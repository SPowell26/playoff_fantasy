-- Combined migration for recent scoring features
-- Run this on your hosted database to add the new columns

-- 1. Add defensive_touchdowns column to player_stats table
-- This column tracks individual defensive players' touchdowns (interception returns, fumble recoveries)
ALTER TABLE player_stats
ADD COLUMN IF NOT EXISTS defensive_touchdowns INTEGER DEFAULT 0;

COMMENT ON COLUMN player_stats.defensive_touchdowns IS 'Touchdowns scored by defensive players (interception returns, fumble recoveries)';

-- 2. Add two_point_conversions_passing and two_point_conversions_receiving columns to player_stats table
-- These columns track 2-point conversions for offensive players
ALTER TABLE player_stats
ADD COLUMN IF NOT EXISTS two_point_conversions_passing INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS two_point_conversions_receiving INTEGER DEFAULT 0;

COMMENT ON COLUMN player_stats.two_point_conversions_passing IS 'Number of 2-point conversions passed by the player';
COMMENT ON COLUMN player_stats.two_point_conversions_receiving IS 'Number of 2-point conversions received/rushed by the player';
