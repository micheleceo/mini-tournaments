class Team {
  /**
   * Initializes a new Team instance.
   * @param {Player} playerA - The first player in the team.
   * @param {Player} playerB - The second player in the team.
   * @param {number} gamesWon - The number of games won by the team.
   */

  constructor(playerA, playerB) {
    //TODO: se non serve basta meettere solo i nomi dei giocatori
    this.player = [playerA.name, playerB.name];
    this.initialRating = calculateTeamRating(playerA.initialRating, playerB.initialRating);
    this.KFactor = calculateTeamKFactor(playerA.KFactor, playerB.KFactor);
    this.gamesWon = 0;
  }

  /**
   * Sets the number of games won by the team.
   * @param {number} gamesWon - The number of games won by the team.
   */
  setGamesWon(gamesWon) {
    this.gamesWon = gamesWon;
  }
}

export default Team;
import { calculateTeamRating, calculateTeamKFactor } from "../utils/ELO.js";
