-- Insert test player stats to test the modal display
-- This will let us see if the stats breakdown works, even with fake data

INSERT INTO player_stats (
    player_id, league_id, team_id, week, year, game_id,
    passing_yards, passing_touchdowns, interceptions,
    rushing_yards, rushing_touchdowns,
    receiving_yards, receiving_touchdowns,
    sacks, interceptions_defense, fumble_recoveries,
    field_goals_0_39, field_goals_40_49, field_goals_50_plus, extra_points,
    fantasy_points, source
) VALUES 
-- Test QB with passing stats
(1, 1, 1, 1, 2024, 1, 250, 2, 1, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18.0, 'test'),
-- Test RB with rushing stats  
(2, 1, 1, 1, 2024, 1, 0, 0, 0, 120, 1, 45, 0, 0, 0, 0, 0, 0, 0, 0, 22.5, 'test'),
-- Test WR with receiving stats
(3, 1, 1, 1, 2024, 1, 0, 0, 0, 0, 0, 95, 1, 0, 0, 0, 0, 0, 0, 0, 15.5, 'test'),
-- Test K with field goals
(4, 1, 1, 1, 2024, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 3, 12.0, 'test'),
-- Test DEF with defensive stats
(5, 1, 1, 1, 2024, 1, 0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 0, 0, 0, 0, 8.0, 'test');

-- Note: Make sure these player_ids exist in your players table
-- If they don't exist, you might need to adjust the IDs or create some test players first
