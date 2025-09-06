import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fantasy_playoff_db',
  password: process.env.DB_PASSWORD || 'your_password_here',
  port: 5432,
});

async function debugPhillyDST() {
  try {
    console.log('🔍 Debugging Philadelphia D/ST stats...');
    
    // Check if Philadelphia D/ST player exists
    const dstPlayerResult = await pool.query(
      "SELECT id, name, position, team FROM players WHERE position = 'D/ST' AND team = 'PHI'"
    );
    
    if (dstPlayerResult.rows.length === 0) {
      console.log('❌ No Philadelphia D/ST player found in database');
      return;
    }
    
    const dstPlayer = dstPlayerResult.rows[0];
    console.log(`✅ Found Philadelphia D/ST player:`, dstPlayer);
    
    // Check D/ST stats for Philadelphia
    const dstStatsResult = await pool.query(
      "SELECT * FROM player_stats WHERE player_id = $1 ORDER BY week DESC, year DESC",
      [dstPlayer.id]
    );
    
    console.log(`\n📊 Philadelphia D/ST stats (${dstStatsResult.rows.length} records):`);
    console.log('Week | Year | Sacks | INTs | FumRec | Safeties | BlkKicks | PR TDs | KR TDs | Def TDs | Pts Allowed | Team Win | Fantasy Pts');
    console.log('-----|------|-------|------|--------|----------|----------|--------|--------|---------|-------------|----------|-------------');
    
    dstStatsResult.rows.forEach(stat => {
      console.log(
        `${stat.week.toString().padStart(4)} | ` +
        `${stat.year.toString().padStart(4)} | ` +
        `${(stat.sacks || 0).toString().padStart(5)} | ` +
        `${(stat.interceptions_defense || 0).toString().padStart(3)} | ` +
        `${(stat.fumble_recoveries || 0).toString().padStart(6)} | ` +
        `${(stat.safeties || 0).toString().padStart(8)} | ` +
        `${(stat.blocked_kicks || 0).toString().padStart(8)} | ` +
        `${(stat.punt_return_touchdowns || 0).toString().padStart(6)} | ` +
        `${(stat.kickoff_return_touchdowns || 0).toString().padStart(6)} | ` +
        `${(stat.defensive_touchdowns || 0).toString().padStart(7)} | ` +
        `${(stat.points_allowed || 0).toString().padStart(11)} | ` +
        `${(stat.team_win ? 'Yes' : 'No').padStart(9)} | ` +
        `${(stat.fantasy_points || 0).toString().padStart(12)}`
      );
    });
    
    // Check what stats are available for this week
    const currentWeek = 1;
    const currentYear = 2025;
    
    const currentStats = dstStatsResult.rows.find(stat => 
      stat.week === currentWeek && stat.year === currentYear
    );
    
    if (currentStats) {
      console.log(`\n🎯 Current Week ${currentWeek}, ${currentYear} Philadelphia D/ST Stats:`);
      console.log(`  Sacks: ${currentStats.sacks || 0}`);
      console.log(`  Interceptions: ${currentStats.interceptions_defense || 0}`);
      console.log(`  Fumble Recoveries: ${currentStats.fumble_recoveries || 0}`);
      console.log(`  Safeties: ${currentStats.safeties || 0}`);
      console.log(`  Blocked Kicks: ${currentStats.blocked_kicks || 0}`);
      console.log(`  Punt Return TDs: ${currentStats.punt_return_touchdowns || 0}`);
      console.log(`  Kickoff Return TDs: ${currentStats.kickoff_return_touchdowns || 0}`);
      console.log(`  Defensive TDs: ${currentStats.defensive_touchdowns || 0}`);
      console.log(`  Points Allowed: ${currentStats.points_allowed || 0}`);
      console.log(`  Team Win: ${currentStats.team_win ? 'Yes' : 'No'}`);
      console.log(`  Fantasy Points: ${currentStats.fantasy_points || 0}`);
    } else {
      console.log(`\n❌ No stats found for Week ${currentWeek}, ${currentYear}`);
    }
    
    // Check all D/ST players to see if any have stats
    const allDstStats = await pool.query(`
      SELECT 
        p.team,
        COUNT(ps.player_id) as stat_records,
        SUM(ps.sacks) as total_sacks,
        SUM(ps.interceptions_defense) as total_ints,
        SUM(ps.fumble_recoveries) as total_fum_rec,
        SUM(ps.safeties) as total_safeties,
        SUM(ps.blocked_kicks) as total_blocked_kicks,
        SUM(ps.punt_return_touchdowns) as total_pr_tds,
        SUM(ps.kickoff_return_touchdowns) as total_kr_tds,
        SUM(ps.defensive_touchdowns) as total_def_tds
      FROM players p
      LEFT JOIN player_stats ps ON p.id = ps.player_id
      WHERE p.position = 'D/ST'
      GROUP BY p.team
      ORDER BY p.team
    `);
    
    console.log(`\n📊 All D/ST Teams Summary:`);
    console.log('Team | Records | Sacks | INTs | FumRec | Safeties | BlkKicks | PR TDs | KR TDs | Def TDs');
    console.log('-----|---------|-------|------|--------|----------|----------|--------|--------|---------');
    
    allDstStats.rows.forEach(team => {
      console.log(
        `${team.team.padStart(4)} | ` +
        `${team.stat_records.toString().padStart(7)} | ` +
        `${(team.total_sacks || 0).toString().padStart(5)} | ` +
        `${(team.total_ints || 0).toString().padStart(3)} | ` +
        `${(team.total_fum_rec || 0).toString().padStart(6)} | ` +
        `${(team.total_safeties || 0).toString().padStart(8)} | ` +
        `${(team.total_blocked_kicks || 0).toString().padStart(8)} | ` +
        `${(team.total_pr_tds || 0).toString().padStart(6)} | ` +
        `${(team.total_kr_tds || 0).toString().padStart(6)} | ` +
        `${(team.total_def_tds || 0).toString().padStart(7)}`
      );
    });
    
  } catch (error) {
    console.error('❌ Error debugging Philadelphia D/ST:', error);
  } finally {
    await pool.end();
  }
}

debugPhillyDST();
