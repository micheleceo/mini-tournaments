class Player {
    constructor(name, initialRating) {
        if (typeof initialRating !== 'number') {
            throw new TypeError("Rating must be a number");
          }
        // Initialize the player with the name and rating
        this.name = name;
        this.initialRating = initialRating;

        // Save matches results during the tournament
        this.matchResult = [];

        // Save the player's statistics after the tournament is finisched
        this.tournamentGamesWon = 0;
        this.tournamentGamesLost = 0;
        this.tournamentMatchesWon = 0;
        this.tournamentMatchesDrawn = 0;
        this.tournamentMatchesLost = 0;
        this.tournamentRatingIncrement = 0;
        this.tournamentScore = 0;
 
        
    }

    /**
    * Records a new round, updates round for the player, and updates game wins and relative points.
    * 
    * @param {number} roundindex - The index of the round being recorded.
    * @param {number} matchGamesWon - The number of games won by the player's team in the match.
    * @param {number} matchGamesLost - The number of games lost by the player's team in the match.
    * @param {number} matchRatingIncrement - The rating increment for the player after the match.
    */
    saveMatchResults(roundindex, matchGamesWon, matchGamesLost,matchRatingIncrement) {
        let matchResult = new MatchResult(matchGamesWon, matchGamesLost, matchRatingIncrement);
       /* matchResult.gamesWon = matchGamesWon;
        matchResult.gamesLost = matchGamesLost;
        matchResult.ratingIncrement = matchRatingIncrement;*/
        if(this.matchResult.length < roundindex+1){
            this.matchResult.push(matchResult); 
        }
        else{
            this.matchResult[roundindex] = matchResult;
        }
       
    }
}

//export default Player;
export default  Player ;
import MatchResult from './MatchResult.js';