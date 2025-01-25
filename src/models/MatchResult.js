import { calculateResult } from '../utils/ELO.js';

/**
 * Represents the result of a match for a team, including the number of games won and lost, and the rating increment.
 */
class MatchResult {
	/**
	 * Creates an instance of MatchResult with the specified games won, games lost, and rating increment.
	 *
	 * @param {number} gamesWon The number of games won.
	 * @param {number} gamesLost The number of games lost.
	 * @param {number} ratingIncrement The rating increment.
	 */
	constructor(gamesWon, gamesLost, ratingIncrement) {
		this.gamesWon = gamesWon;
		this.gamesLost = gamesLost;
		this.ratingIncrement = ratingIncrement;
	}

	getResult() {
		calculateResult(this.gamesWon, this.gamesLost);
	}
}

export default MatchResult;
