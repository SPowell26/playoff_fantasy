/**
 * Best Ball Scoring Service
 * Integrates with weekly update to calculate and store team scores
 */

import { calculateBestBallWeeklyScore, calculatePlayerFantasyPoints } from '../utils/best-ball-scoring.js';

/**
 * Calculate and store Best Ball weekly scores for all teams in a league
 * @param {Object} db - Database connection
 * @param {number} leagueId - League ID
 * @param {number} week - Week number
 * @param {number} year - Year
 * @param {string} seasonType - Season type (preseason, regular, playoffs)
 * @returns {Object} Results of the scoring calculation
 */
export async function calculateLeagueWeeklyScores(db, leagueId, week, year, seasonType) {
  try {
    console.log(`🏈 Calculating Best Ball weekly scores for League ${leagueId}, Week ${week}, ${year} ${seasonType}`);
    
    // Get all teams in the league
    const teamsResult = await db.query(
      `SELECT id, name, owner FROM teams WHERE league_id = $1`,
      [leagueId]
    );
    
    if (teamsResult.rows.length === 0) {
      console.log(`  ⚠️ No teams found for league ${leagueId}`);
      return { teamsProcessed: 0, scoresCalculated: 0, errors: [] };
    }
    
    const teams = teamsResult.rows;
    let scoresCalculated = 0;
    let errors = [];
    
    // Process each team
    for (const team of teams) {
      try {
        console.log(`  📊 Processing team: ${team.name} (${team.owner})`);
        
        // Get team roster with player stats for this week
        // Try to match season_type, but also allow stats without season_type or with different season_type
        const rosterResult = await db.query(`
          SELECT 
            tr.roster_position,
            p.id as player_id,
            p.name as player_name,
            p.position,
            p.team as nfl_team,
            ps.*
          FROM team_rosters tr
          JOIN players p ON tr.player_id = p.id
          LEFT JOIN player_stats ps ON p.id = ps.player_id 
            AND ps.week = $1 
            AND ps.year = $2
            AND (ps.season_type = $3 OR (ps.season_type IS NULL AND $3 = 'regular'))
          WHERE tr.team_id = $4
            AND tr.league_id = $5
          ORDER BY tr.roster_position, p.position, p.name
        `, [week, year, seasonType, team.id, leagueId]);
        
        if (rosterResult.rows.length === 0) {
          console.log(`    ⚠️ No roster found for team ${team.name}`);
          
          // Debug: Check if roster exists without stats
          const rosterCheck = await db.query(`
            SELECT COUNT(*) as roster_count 
            FROM team_rosters 
            WHERE team_id = $1 AND league_id = $2
          `, [team.id, leagueId]);
          console.log(`    🔍 Debug: Team has ${rosterCheck.rows[0].roster_count} players on roster`);
          
          continue;
        }
        
        // Debug: Count how many players have stats
        const playersWithStats = rosterResult.rows.filter(row => row.id !== null).length;
        console.log(`    📊 Found ${rosterResult.rows.length} roster players, ${playersWithStats} have stats for Week ${week}`);
        
        // Prepare players data for Best Ball calculation
        // Filter out players with positions that don't have scoring rules
        const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
        
        const teamPlayers = rosterResult.rows
          .filter(row => {
            // Normalize position and check if valid
            let position = row.position;
            if (position === 'D/ST' || position === 'DST' || position === 'DEF') {
              position = 'DEF';
            }
            return validPositions.includes(position);
          })
          .map(row => {
            // Normalize position: D/ST -> DEF
            let position = row.position;
            if (position === 'D/ST' || position === 'DST' || position === 'DEF') {
              position = 'DEF';
            }
            
            return {
            id: row.player_id,
            name: row.player_name,
            position: position,
            nflTeam: row.nfl_team,
            rosterPosition: row.roster_position,
          stats: {
            // Offensive stats
            passing_yards: row.passing_yards || 0,
            passing_touchdowns: row.passing_touchdowns || 0,
            interceptions: row.interceptions || 0,
            rushing_yards: row.rushing_yards || 0,
            rushing_touchdowns: row.rushing_touchdowns || 0,
            receiving_yards: row.receiving_yards || 0,
            receiving_touchdowns: row.receiving_touchdowns || 0,
            fumbles_lost: row.fumbles_lost || 0,
            two_point_conversions_passing: row.two_point_conversions_passing || 0,
            two_point_conversions_receiving: row.two_point_conversions_receiving || 0,
            punt_return_touchdowns: row.punt_return_touchdowns || 0,
            kickoff_return_touchdowns: row.kickoff_return_touchdowns || 0,
            
            // Defensive stats (for D/ST)
            sacks: row.sacks || 0,
            interceptions: row.interceptions_defense || 0,
            fumble_recoveries: row.fumble_recoveries || 0,
            safeties: row.safeties || 0,
            blocked_kicks: row.blocked_kicks || 0,
            defensive_touchdowns: row.defensive_touchdowns || 0,
            // Return TDs for D/ST (same fields as offensive players, but scored differently)
            points_allowed: row.points_allowed || 0,
            team_win: row.team_win || false,
            
            // Kicker stats
            field_goals_0_39: row.field_goals_0_39 || 0,
            field_goals_40_49: row.field_goals_40_49 || 0,
            field_goals_50_plus: row.field_goals_50_plus || 0,
            extra_points: row.extra_points || 0
          }
        };
        });
        
        if (teamPlayers.length === 0) {
          console.log(`    ⚠️ No valid players found for team ${team.name} (all players have invalid positions)`);
          continue;
        }
        
        // Calculate Best Ball weekly score
        const bestBallResult = calculateBestBallWeeklyScore(teamPlayers);
        
        console.log(`    ✅ Best Ball score: ${bestBallResult.weeklyScore} points`);
        console.log(`    📋 Optimal lineup: QB: ${bestBallResult.optimalLineup.QB?.playerName || 'None'} (${bestBallResult.optimalLineup.QB?.fantasyPoints || 0}), RB1: ${bestBallResult.optimalLineup.RB1?.playerName || 'None'} (${bestBallResult.optimalLineup.RB1?.fantasyPoints || 0})`);
        
        // Store weekly score in database
        try {
          const insertResult = await db.query(`
          INSERT INTO team_weekly_scores (
            league_id, team_id, week, year, season_type,
            qb_player_id, qb_fantasy_points,
            rb1_player_id, rb1_fantasy_points, rb2_player_id, rb2_fantasy_points,
            wr1_player_id, wr1_fantasy_points, wr2_player_id, wr2_fantasy_points,
            te_player_id, te_fantasy_points,
            flex_player_id, flex_fantasy_points,
            k_player_id, k_fantasy_points,
            def_player_id, def_fantasy_points,
            weekly_score, lineup_json, source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
          ON CONFLICT (league_id, team_id, week, year, season_type) DO UPDATE SET
            qb_player_id = EXCLUDED.qb_player_id,
            qb_fantasy_points = EXCLUDED.qb_fantasy_points,
            rb1_player_id = EXCLUDED.rb1_player_id,
            rb1_fantasy_points = EXCLUDED.rb1_fantasy_points,
            rb2_player_id = EXCLUDED.rb2_player_id,
            rb2_fantasy_points = EXCLUDED.rb2_fantasy_points,
            wr1_player_id = EXCLUDED.wr1_player_id,
            wr1_fantasy_points = EXCLUDED.wr1_fantasy_points,
            wr2_player_id = EXCLUDED.wr2_player_id,
            wr2_fantasy_points = EXCLUDED.wr2_fantasy_points,
            te_player_id = EXCLUDED.te_player_id,
            te_fantasy_points = EXCLUDED.te_fantasy_points,
            flex_player_id = EXCLUDED.flex_player_id,
            flex_fantasy_points = EXCLUDED.flex_fantasy_points,
            k_player_id = EXCLUDED.k_player_id,
            k_fantasy_points = EXCLUDED.k_fantasy_points,
            def_player_id = EXCLUDED.def_player_id,
            def_fantasy_points = EXCLUDED.def_fantasy_points,
            weekly_score = EXCLUDED.weekly_score,
            lineup_json = EXCLUDED.lineup_json,
            source = EXCLUDED.source,
            updated_at = CURRENT_TIMESTAMP
        `, [
          leagueId, team.id, week, year, seasonType,
          bestBallResult.optimalLineup.QB?.playerId || null,
          bestBallResult.optimalLineup.QB?.fantasyPoints || 0,
          bestBallResult.optimalLineup.RB1?.playerId || null,
          bestBallResult.optimalLineup.RB1?.fantasyPoints || 0,
          bestBallResult.optimalLineup.RB2?.playerId || null,
          bestBallResult.optimalLineup.RB2?.fantasyPoints || 0,
          bestBallResult.optimalLineup.WR1?.playerId || null,
          bestBallResult.optimalLineup.WR1?.fantasyPoints || 0,
          bestBallResult.optimalLineup.WR2?.playerId || null,
          bestBallResult.optimalLineup.WR2?.fantasyPoints || 0,
          bestBallResult.optimalLineup.TE?.playerId || null,
          bestBallResult.optimalLineup.TE?.fantasyPoints || 0,
          bestBallResult.optimalLineup.FLEX?.playerId || null,
          bestBallResult.optimalLineup.FLEX?.fantasyPoints || 0,
          bestBallResult.optimalLineup.K?.playerId || null,
          bestBallResult.optimalLineup.K?.fantasyPoints || 0,
          bestBallResult.optimalLineup.DEF?.playerId || null,
          bestBallResult.optimalLineup.DEF?.fantasyPoints || 0,
          bestBallResult.weeklyScore,
          JSON.stringify(bestBallResult.optimalLineup),
          'best_ball_engine'
        ]);
        
        console.log(`    💾 Score stored successfully (rowCount: ${insertResult.rowCount})`);
        scoresCalculated++;
        
        } catch (insertError) {
          console.error(`    ❌ Error storing score in database:`, insertError);
          throw insertError; // Re-throw to be caught by outer try-catch
        }
        
      } catch (teamError) {
        console.error(`    ❌ Error processing team ${team.name}:`, teamError.message);
        errors.push({
          teamId: team.id,
          teamName: team.name,
          error: teamError.message
        });
      }
    }
    
    console.log(`🏈 Best Ball weekly scoring complete for League ${leagueId}`);
    console.log(`  📊 Teams processed: ${teams.length}`);
    console.log(`  ✅ Scores calculated: ${scoresCalculated}`);
    console.log(`  ❌ Errors: ${errors.length}`);
    
    return {
      teamsProcessed: teams.length,
      scoresCalculated,
      errors
    };
    
  } catch (error) {
    console.error(`❌ Error calculating league weekly scores:`, error);
    throw error;
  }
}

/**
 * Get team standings for a specific week
 * @param {Object} db - Database connection
 * @param {number} leagueId - League ID
 * @param {number} week - Week number
 * @param {number} year - Year
 * @param {string} seasonType - Season type
 * @returns {Array} Array of team standings sorted by weekly score
 */
export async function getTeamStandings(db, leagueId, week, year, seasonType) {
  try {
    const result = await db.query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.owner,
        tws.weekly_score,
        tws.lineup_json,
        ROW_NUMBER() OVER (ORDER BY tws.weekly_score DESC) as rank
      FROM teams t
      LEFT JOIN team_weekly_scores tws ON t.id = tws.team_id 
        AND tws.week = $1 
        AND tws.year = $2 
        AND tws.season_type = $3
      WHERE t.league_id = $4
      ORDER BY tws.weekly_score DESC NULLS LAST, t.name ASC
    `, [week, year, seasonType, leagueId]);
    
    return result.rows;
  } catch (error) {
    console.error(`❌ Error getting team standings:`, error);
    throw error;
  }
}

/**
 * Get season totals for all teams in a league
 * Calculates on-the-fly from player stats (not cached scores) to always use latest scoring logic
 * @param {Object} db - Database connection
 * @param {number} leagueId - League ID
 * @param {number} year - Year
 * @param {string} seasonType - Season type
 * @returns {Array} Array of team season totals sorted by total score
 */
export async function getSeasonTotals(db, leagueId, year, seasonType) {
  try {
    // Get all teams in the league
    const teamsResult = await db.query(
      `SELECT id, name, owner FROM teams WHERE league_id = $1`,
      [leagueId]
    );
    
    if (teamsResult.rows.length === 0) {
      return [];
    }
    
    // Get all weeks that have stats for this season
    const weeksResult = await db.query(`
      SELECT DISTINCT week 
      FROM player_stats 
      WHERE year = $1 AND season_type = $2
      ORDER BY week ASC
    `, [year, seasonType]);
    
    const weeks = weeksResult.rows.map(row => row.week);
    
    if (weeks.length === 0) {
      // No weeks with stats, return teams with zero scores
      return teamsResult.rows.map(team => ({
        team_id: team.id,
        team_name: team.name,
        owner: team.owner,
        weeks_played: 0,
        season_total: 0,
        average_weekly_score: null,
        best_weekly_score: null,
        worst_weekly_score: null
      }));
    }
    
    // Calculate weekly scores for each team and week on-the-fly
    const teamScores = new Map(); // team_id -> { weeklyScores: [], totals }
    
    for (const team of teamsResult.rows) {
      teamScores.set(team.id, {
        team_id: team.id,
        team_name: team.name,
        owner: team.owner,
        weeklyScores: []
      });
    }
    
    // Calculate scores for each week
    for (const week of weeks) {
      for (const team of teamsResult.rows) {
        try {
          // Get team roster with player stats for this week
          const rosterResult = await db.query(`
            SELECT 
              tr.roster_position,
              p.id as player_id,
              p.name as player_name,
              p.position,
              p.team as nfl_team,
              ps.*
            FROM team_rosters tr
            JOIN players p ON tr.player_id = p.id
            LEFT JOIN player_stats ps ON p.id = ps.player_id 
              AND ps.week = $1 
              AND ps.year = $2
              AND (ps.season_type = $3 OR (ps.season_type IS NULL AND $3 = 'regular'))
            WHERE tr.team_id = $4
              AND tr.league_id = $5
            ORDER BY tr.roster_position, p.position, p.name
          `, [week, year, seasonType, team.id, leagueId]);
          
          if (rosterResult.rows.length === 0) continue;
          
          // Prepare players data for Best Ball calculation
          const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
          
          const teamPlayers = rosterResult.rows
            .filter(row => {
              let position = row.position;
              if (position === 'D/ST' || position === 'DST' || position === 'DEF') {
                position = 'DEF';
              }
              return validPositions.includes(position);
            })
            .map(row => {
              let position = row.position;
              if (position === 'D/ST' || position === 'DST' || position === 'DEF') {
                position = 'DEF';
              }
              
              // Map stats correctly - interceptions are different for offensive vs defensive
              const stats = {
                passing_yards: row.passing_yards || 0,
                passing_touchdowns: row.passing_touchdowns || 0,
                rushing_yards: row.rushing_yards || 0,
                rushing_touchdowns: row.rushing_touchdowns || 0,
                receiving_yards: row.receiving_yards || 0,
                receiving_touchdowns: row.receiving_touchdowns || 0,
                fumbles_lost: row.fumbles_lost || 0,
                two_point_conversions_passing: row.two_point_conversions_passing || 0,
                two_point_conversions_receiving: row.two_point_conversions_receiving || 0,
                punt_return_touchdowns: row.punt_return_touchdowns || 0,
                kickoff_return_touchdowns: row.kickoff_return_touchdowns || 0,
                sacks: row.sacks || 0,
                fumble_recoveries: row.fumble_recoveries || 0,
                safeties: row.safeties || 0,
                blocked_kicks: row.blocked_kicks || 0,
                defensive_touchdowns: row.defensive_touchdowns || 0,
                points_allowed: row.points_allowed || 0,
                team_win: row.team_win || false,
                field_goals_0_39: row.field_goals_0_39 || 0,
                field_goals_40_49: row.field_goals_40_49 || 0,
                field_goals_50_plus: row.field_goals_50_plus || 0,
                extra_points: row.extra_points || 0
              };
              
              // Interceptions: offensive players get interceptions thrown (negative), D/ST gets interceptions made (positive)
              if (position === 'DEF') {
                stats.interceptions = row.interceptions_defense || 0; // D/ST: interceptions made
              } else {
                stats.interceptions = row.interceptions || 0; // Offensive: interceptions thrown
              }
              
              return {
                id: row.player_id,
                name: row.player_name,
                position: position,
                nflTeam: row.nfl_team,
                rosterPosition: row.roster_position,
                stats
              };
            });
          
          if (teamPlayers.length === 0) continue;
          
          // Calculate Best Ball weekly score using latest scoring logic
          const bestBallResult = calculateBestBallWeeklyScore(teamPlayers);
          const teamData = teamScores.get(team.id);
          const weeklyScore = bestBallResult.weeklyScore || 0;
          teamData.weeklyScores.push(weeklyScore);
          
          // Debug logging for first team
          if (team.id === teamsResult.rows[0].id) {
            console.log(`  📊 Week ${week} - ${team.name}: ${weeklyScore.toFixed(2)} points (${teamPlayers.length} players)`);
          }
          
        } catch (error) {
          console.error(`Error calculating score for team ${team.id} week ${week}:`, error);
        }
      }
    }
    
    // Convert to result format
    const results = Array.from(teamScores.values()).map(teamData => {
      // Store weekly scores with week numbers for debugging
      const weeklyScoresWithWeeks = [];
      for (let i = 0; i < weeks.length && i < teamData.weeklyScores.length; i++) {
        const score = teamData.weeklyScores[i];
        // Only include weeks where team actually has stats (score > 0 or team has players with stats)
        if (score > 0) {
          weeklyScoresWithWeeks.push({ week: weeks[i], score: score });
        }
      }
      
      const weeklyScores = weeklyScoresWithWeeks.map(w => w.score);
      const weeksPlayed = weeklyScores.length;
      const seasonTotal = weeklyScores.reduce((sum, score) => sum + score, 0);
      const averageScore = weeksPlayed > 0 ? seasonTotal / weeksPlayed : null;
      const bestWeek = weeklyScores.length > 0 ? Math.max(...weeklyScores) : null;
      const worstWeek = weeklyScores.length > 0 ? Math.min(...weeklyScores) : null;
      
      // Log for debugging
      console.log(`📊 Season totals for ${teamData.team_name}:`, {
        weeks: weeklyScoresWithWeeks.map(w => `Week ${w.week}: ${w.score.toFixed(2)}`).join(', '),
        total: seasonTotal.toFixed(2),
        weeksCount: weeksPlayed,
        weeksIncluded: weeklyScoresWithWeeks.map(w => w.week).join(', ')
      });
      
      return {
        team_id: teamData.team_id,
        team_name: teamData.team_name,
        owner: teamData.owner,
        weeks_played: weeksPlayed,
        season_total: Math.round(seasonTotal * 100) / 100, // Round to 2 decimals
        average_weekly_score: averageScore ? Math.round(averageScore * 100) / 100 : null,
        best_weekly_score: bestWeek ? Math.round(bestWeek * 100) / 100 : null,
        worst_weekly_score: worstWeek ? Math.round(worstWeek * 100) / 100 : null,
        // Include weekly breakdown for debugging (can be removed later)
        _weekly_breakdown: weeklyScoresWithWeeks
      };
    });
    
    // Sort by season total descending
    results.sort((a, b) => (b.season_total || 0) - (a.season_total || 0));
    
    return results;
  } catch (error) {
    console.error(`❌ Error getting season totals:`, error);
    throw error;
  }
}
