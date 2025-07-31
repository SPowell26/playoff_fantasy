// Data models for the fantasy football app

/**
 * Player Model
 * Represents an NFL player in the fantasy system
 */

export class Player {
    constructor(id, name, position, nflTeam){
        this.id = id; //Player ID e.g. 12345 (needs work lol)
        this.name = name; //Player name e.g. Patrick Mahomes
        this.position = position; //QB, RB, WR, TE, K, DEF
        this.team = this.nflTeam; //Current NFL team i.e. KC or BAL

        //Stats for fantasy scoring 
        this.stats={
            passingYards: 0,
            passingTD: 0,
            interceptions: 0,
            rushingYards: 0,
            rushingTD: 0,
            receivingYards: 0,
            receivingTD: 0,
            fumbles: 0,
            fieldGoals: 0,
            extraPoints: 0
        };
        
        //Status flags
        this.isActive = true;
        this.isEliminated = false;
        this.isInjured = false;
    }


  // Method to update player stats
  updateStats(newStats) {
    this.stats = { ...this.stats, ...newStats };
  }

  // Method to mark player as eliminated
  eliminate() {
    this.isEliminated = true;
    this.isActive = false;
  }

  injure(){
    this.isInjured = true;
  }

  // Method to get total fantasy points (will be calculated based on scoring rules)
  getFantasyPoints(scoringRules) {
    return (
      this.stats.passingYards * scoringRules.passingYards +
      this.stats.passingTD * scoringRules.passingTD +
      this.stats.interceptions * scoringRules.interceptions +
      this.stats.rushingYards * scoringRules.rushingYards +
      this.stats.rushingTD * scoringRules.rushingTD +
      this.stats.receivingYards * scoringRules.receivingYards +
      this.stats.receivingTD * scoringRules.receivingTD +
      this.stats.fumbles * scoringRules.fumbles
    );
  }
}
    

/**
 * Team Model
 * Represents a fantasy team in a league
 */
export class Team {
  constructor(id, leagueId, owner, name) {
    this.id = id;
    this.leagueId = leagueId;
    this.owner = owner;
    this.name = name;
    this.players = []; // Array of Player objects
    this.totalScore = 0;
    this.isEliminated = false;
  }

  // Method to add a player to the team
  addPlayer(player) {
    this.players.push(player);
  }

  // Method to remove a player from the team
  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId);
  }

  // Method to get players by position
  getPlayersByPosition(position) {
    return this.players.filter(player => player.position === position);
  }

  // Method to calculate total team score
  calculateTotalScore(scoringRules) {
    this.totalScore = this.players.reduce((total, player) => {
      return total + player.getFantasyPoints(scoringRules);
    }, 0);
    return this.totalScore;
  }

  // Method to check if team is eliminated (all players eliminated)
  checkElimination() {
    this.isEliminated = this.players.every(player => player.isEliminated);
    return this.isEliminated;
  }
}

/**
 * League Model
 * Represents a fantasy football league
 */
export class League {
  constructor(id, name, owner, maxTeams = 8) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.createdAt = new Date().toISOString();
    this.status = 'setup'; // setup, active, completed
    this.maxTeams = maxTeams;
    this.teams = []; // Array of Team objects
    
    // Default scoring rules
    this.scoringRules = {
      passingYards: 0.04,
      passingTD: 4,
      interceptions: -2,
      rushingYards: 0.1,
      rushingTD: 6,
      receivingYards: 0.1,
      receivingTD: 6,
      fumbles: -2
    };
    
    // Playoff teams (NFL teams in playoffs)
    this.playoffTeams = ["KC", "BAL", "BUF", "HOU", "SF", "DET", "GB", "TB"];
  }

  // Method to add a team to the league
  addTeam(team) {
    if (this.teams.length < this.maxTeams) {
      this.teams.push(team);
      return true;
    }
    return false; // League is full
  }

  // Method to remove a team from the league
  removeTeam(teamId) {
    this.teams = this.teams.filter(team => team.id !== teamId);
  }

  // Method to get league standings (sorted by total score)
  getStandings() {
    return this.teams
      .map(team => ({
        ...team,
        totalScore: team.calculateTotalScore(this.scoringRules)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  // Method to start the league (change status to active)
  startLeague() {
    if (this.teams.length >= 2) { // Minimum 2 teams
      this.status = 'active';
      return true;
    }
    return false;
  }

  // Method to get available players (not on any team)
  getAvailablePlayers(allPlayers) {
    const draftedPlayerIds = this.teams.flatMap(team => 
      team.players.map(player => player.id)
    );
    return allPlayers.filter(player => !draftedPlayerIds.includes(player.id));
  }
} 

//potential new rule adds free agency where at the conclusion of each week you can buy a player out of free agency with points already accumulated
//could do set amount of points the whole time, or higher cost for a divisonal round pickup vs superbowl pick up because of less potential to add to total, or could make an auction so you bid against others with a timer