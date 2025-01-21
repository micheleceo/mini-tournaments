
/**
 * Determines the K-factor for a player based on their total matches played and rating.
 *
 * The K-factor is used to adjust the player's rating after each match. 
 * A higher K-factor means more significant rating changes, while a lower K-factor results 
 * in more stable ratings. The K-factor is calculated based on the player's total matches played
 * @param {number} totalMatchesPlayed - The total number of matches the player has played.
 * @param {number} rating - The current rating of the player.
 * @returns {number} The calculated K-factor for the player.
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
 * Calculates the rating increment for two teams based on their ratings and the result of their match.
 *
 * The rating increment is calculated using the Elo rating system, which takes into account the expected score of each team based on their ratings.
 * The difference between the expected score and the actual score is used to determine the rating change for each team.
 * @param {Team} team - The team for which to calculate the rating increment.
 * @param {Team} opponentTeam - The opponent team.
 * @param {number} teamResult - The actual result of the match for the team, from 0 (loss) to 1 (win).
 * @returns {number[]} An array with two elements, the rating change for the team and the opponent team, respectively.
 */
function calculateTeamsRatingIncrement(
	team,
	opponentTeam,
	teamResult
) {
	const teamExpectedScore = calculateExpectedScore(
		team.initialRating,
		opponentTeam.initialRating
	);
	const opponentTeamExpectedScore = calculateExpectedScore(
		opponentTeam.initialRating,
		team.initialRating
	);

	const teamRatingChange = team.KFactor * (teamResult - teamExpectedScore);
	const opponentteamRatingChange = opponentTeam.KFactor * (1 - teamResult - opponentTeamExpectedScore);

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
	calculateTeamKFactor,
	calculateTeamsRatingIncrement
};




