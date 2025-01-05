class Team {
    /**
     * Initializes a new Team instance.
     * @param {Player} playerA - The first player in the team.
     * @param {Player} playerB - The second player in the team.
     * @param {number} gamesWon - The number of games won by the team.
     */

    constructor(playerA,playerB, gamesWon) {
       this.playerA = playerA;
       this.playerB = playerB;
       this.gamesWon = gamesWon;
    }
}

export default Team;