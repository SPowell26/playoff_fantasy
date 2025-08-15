-- Insert test player stats for specific players to test the modal display
-- Using the actual player IDs found in the database

-- First, let's check what leagues and teams exist
-- SELECT id, name FROM leagues;
-- SELECT id, name, league_id FROM teams;

-- Insert test stats for Week 3, 2025 (Conference Championship)
INSERT INTO player_stats (
    player_id, league_id, team_id, week, year, game_id,
    passing_yards, passing_touchdowns, interceptions,
    rushing_yards, rushing_touchdowns,
    receiving_yards, receiving_touchdowns,
    sacks, interceptions_defense, fumble_recoveries,
    field_goals_0_39, field_goals_40_49, field_goals_50_plus, extra_points,
    fantasy_points, source
) VALUES 
-- Patrick Mahomes (QB) - 3139477
(3139477, 1, 1, 3, 2025, 1, 285, 3, 0, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25.4, 'test'),

-- A.J. Brown (WR) - 4047646  
(4047646, 1, 1, 3, 2025, 1, 0, 0, 0, 0, 0, 125, 2, 0, 0, 0, 0, 0, 0, 0, 24.5, 'test'),

-- Saquon Barkley (RB) - 3929630
(3929630, 1, 1, 3, 2025, 1, 0, 0, 0, 145, 1, 25, 0, 0, 0, 0, 0, 0, 0, 0, 23.0, 'test'),

-- Brandon Aubrey (K) - 3953687
(3953687, 1, 1, 3, 2025, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 4, 18.0, 'test');

-- Note: Using league_id=1 and team_id=1 as placeholders
-- You may need to adjust these to match your actual league and team IDs
