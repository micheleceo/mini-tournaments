
/**
 * Calculates the K-factor for a given player.
 *
 * The K-factor is a constant used in the Elo rating system
 * to determine how much a player's rating changes after each game.
 * The K-factor is based on the number of games played and the rating of the player.
 *
 * @param {Object} player - The player to calculate the K-factor for
 * @returns {number} The K-factor for the player
 */
function calculateKFactor(totalMatchesPlayed,rating) {
	if (totalMatchesPlayed <= 10) {
		return 40;
	} else if (totalMatchesPlayed <= 25) {
		if (rating < 1500) {
			return 30;
		}
		else
			return 25;
	}else {
		if (rating < 1800) {
			return 20;
		}
		else
			return 15;
	}
}

/**
 * Calculates the rating increment for a team based on the outcome of a match.
 *
 * @param {number} teamRating - The current rating of the team.
 * @param {number} opponentTeamRating - The current rating of the opposing team.
 * @param {number} teamResult - The actual score of the team in the match (0 or 1).
 * @returns {Array<number>} The rating increments for the team and the opponent team.
 */
function calculateTeamsRatingIncrement(
	team,
	opponentTeam,
	teamResult
) {
	const teamExpectedScore = calculateExpectedScore(
		team.rating,
		opponentTeam.rating
	);
	const opponentTeamExpectedScore = calculateExpectedScore(
		opponentTeam.rating,
		team.rating
	);

	const teamRatingChange = team.K_FACTOR * (teamResult - teamExpectedScore);
	const opponentteamRatingChange = opponentTeam.K_FACTOR * (1 - teamResult - opponentTeamExpectedScore);

	return [teamRatingChange, opponentteamRatingChange];
}

/**
 * Calculate the expected score of a player
 * @param {number} playerRating - Current rating of the player
 * @param {number} opponentRating - Current rating of the opponent
 * @returns {number} Expected score (between 0 and 1)
 */
function calculateExpectedScore(playerRating, opponentRating) {
	return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

function calculateResult(teamGamesWon, opponentTeamGamesWon) {
	const delta = teamGamesWon - opponentTeamGamesWon;
	if (delta > 0) {
		return 1;
	} else if (delta < 0) {
		return 0;
	} else {
		return 0.5;
	}
}

function calculateTeamRating(player1Rating, player2Rating) {
	return (player1Rating + player2Rating) / 2;
}

function calculateTeamKFactor(player1KFactor, player2KFactor) {
	return (player1KFactor + player2KFactor) / 2;
}

export {
	calculateExpectedScore,
	calculateResult,
	calculateTeamRating,
	calculateKFactor,
	calculateTeamKFactor
};




