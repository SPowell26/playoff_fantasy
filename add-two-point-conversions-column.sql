-- Add two_point_conversions_passing and two_point_conversions_receiving columns to player_stats table
-- These columns track 2-point conversions for offensive players

ALTER TABLE player_stats
ADD COLUMN IF NOT EXISTS two_point_conversions_passing INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS two_point_conversions_receiving INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN player_stats.two_point_conversions_passing IS '2-point conversions thrown by QB (2 points each)';
COMMENT ON COLUMN player_stats.two_point_conversions_receiving IS '2-point conversions caught by receiver (2 points each)';
