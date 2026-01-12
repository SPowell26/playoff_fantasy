-- Add roster_structure column to leagues table
-- This allows commissioners to customize roster positional counts

ALTER TABLE leagues 
ADD COLUMN IF NOT EXISTS roster_structure JSONB;

-- Set default roster structure for existing leagues
-- Format: {QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, FLEX: 1, BN: 3}
UPDATE leagues
SET roster_structure = '{"QB": 1, "RB": 2, "WR": 2, "TE": 1, "K": 1, "DEF": 1, "FLEX": 1, "BN": 3}'
WHERE roster_structure IS NULL;

