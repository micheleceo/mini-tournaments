import { calculateKFactor } from "../utils/ELO.js";

class Player {
	constructor(name, initialRating, totalMatchesPlayed) {
		if (typeof initialRating !== "number") {
			throw new TypeError("Rating must be a number");
		}
		// Initialize the player with the info needed for the tournament
		this.name = name;
		this.initialRating = initialRating;
		this.totalMatchesPlayed = totalMatchesPlayed;
		this.KFactor =  calculateKFactor(totalMatchesPlayed, initialRating);

		// Save matches results during the tournament
		this.matchesResult = [];

		// Save the player's statistics after the tournament is finisched
		this.tournamentGamesWon = 0;
		this.tournamentGamesLost = 0;
		this.tournamentMatchesWon = 0;
		this.tournamentMatchesDrawn = 0;
		this.tournamentMatchesLost = 0;
		this.tournamentRatingIncrement = 0;
		this.tournamentScore = 0;
	}

	setMatchResults(roundIndex,matchResult){
		this.matchesResult[roundIndex] = matchResult;
	}
}

export default Player;

