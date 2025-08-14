-- Database Schema Update: Change ID columns from SERIAL to TEXT
-- Run this to fix the ID type mismatch issue

-- ============================================================================
-- UPDATE LEAGUES TABLE
-- ============================================================================
-- First, drop foreign key constraints that reference leagues.id
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_league_id_fkey;
ALTER TABLE team_rosters DROP CONSTRAINT IF EXISTS team_rosters_league_id_fkey;
ALTER TABLE league_members DROP CONSTRAINT IF EXISTS league_members_league_id_fkey;

-- Change leagues.id from SERIAL to TEXT
ALTER TABLE leagues ALTER COLUMN id TYPE TEXT;
ALTER TABLE leagues ALTER COLUMN id SET DEFAULT 'league_' || EXTRACT(EPOCH FROM NOW())::BIGINT;

-- Update foreign key columns to TEXT
ALTER TABLE teams ALTER COLUMN league_id TYPE TEXT;
ALTER TABLE team_rosters ALTER COLUMN league_id TYPE TEXT;
ALTER TABLE league_members ALTER COLUMN league_id TYPE TEXT;

-- Re-add foreign key constraints
ALTER TABLE teams ADD CONSTRAINT teams_league_id_fkey 
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE;
ALTER TABLE team_rosters ADD CONSTRAINT team_rosters_league_id_fkey 
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE;
ALTER TABLE league_members ADD CONSTRAINT league_members_league_id_fkey 
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE;

-- ============================================================================
-- UPDATE TEAMS TABLE
-- ============================================================================
-- Drop foreign key constraints that reference teams.id
ALTER TABLE team_rosters DROP CONSTRAINT IF EXISTS team_rosters_team_id_fkey;
ALTER TABLE league_members DROP CONSTRAINT IF EXISTS league_members_team_id_fkey;

-- Change teams.id from SERIAL to TEXT
ALTER TABLE teams ALTER COLUMN id TYPE TEXT;
ALTER TABLE teams ALTER COLUMN id SET DEFAULT 'team_' || EXTRACT(EPOCH FROM NOW())::BIGINT;

-- Update foreign key columns to TEXT
ALTER TABLE team_rosters ALTER COLUMN team_id TYPE TEXT;
ALTER TABLE league_members ALTER COLUMN team_id TYPE TEXT;

-- Re-add foreign key constraints
ALTER TABLE team_rosters ADD CONSTRAINT team_rosters_team_id_fkey 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE league_members ADD CONSTRAINT league_members_team_id_fkey 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- ============================================================================
-- VERIFY CHANGES
-- ============================================================================
-- Check the updated schema
SELECT 
    table_name, 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('leagues', 'teams', 'team_rosters', 'league_members')
    AND column_name IN ('id', 'league_id', 'team_id')
ORDER BY table_name, column_name;
