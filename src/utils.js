
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
function calculateKFactor(player) {
	if (player.totalMatchesPlayed <= 10) {
		return 40;
	} else if (player.totalMatchesPlayed <= 25) {
		if (player.rating < 1500) {
			return 30;
		}
		else
			return 25;
	}else {
		if (player.rating < 1800) {
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
 * @param {number} teamActualScore - The actual score of the team in the match (0 or 1).
 * @returns {Array<number>} The rating increments for the team and the opponent team.
 */
function calculateTeamRatingIncrement(
	teamRating,
	opponentTeamRating,
	teamActualScore
) {
	//TODO: valutare se renderlo variabile
	const K_FACTOR = 32; // Adjust this factor to change the strength of the rating system

	const teamExpectedScore = calculateExpectedScore(
		teamRating,
		opponentTeamRating
	);
	const opponentTeamExpectedScore = calculateExpectedScore(
		opponentTeamRating,
		teamRating
	);

	const teamRatingChange = K_FACTOR * (teamActualScore - teamExpectedScore);
	const opponentteamRatingChange = K_FACTOR * (1 - teamActualScore - opponentTeamExpectedScore);

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

/**
 * Shuffles the players array using the Fisher-Yates algorithm to randomize the order of players.
 */
function shufflePlayers(playersList) {
	let newPlayersList = playersList.slice();
	//Fisher-Yates algorithm
	for (let i = newPlayersList.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newPlayersList[i], newPlayersList[j]] = [
			newPlayersList[j],
			newPlayersList[i],
		];
	}

	return newPlayersList;
}

/**
 * Balances teams by sorting players based on their ratings and pairing the highest-rated player
 * with the lowest-rated player, the second highest with the second lowest, and so on. It then
 * reorders the player list for the first round matches.
 */
function balancePlayersTeams(playersList) {
	let newPlayersList = playersList.slice();
	newPlayersList.sort((a, b) => b.initialRating - a.initialRating);
	console.log(">>>>Tournament player order by rating: ");
	newPlayersList.forEach((player) =>
		console.log(`${player.name} ${player.initialRating}`)
	);
	//The player with the highest rating goes on a team with the player with the lowest rating
	const round1Players = [0, 7, 1, 6, 2, 5, 3, 4].map(
		(index) => newPlayersList[index]
	);
	console.log(">>>>Round1 player ordered for match (balanced): ");
	newPlayersList = round1Players;
	newPlayersList.forEach((player) =>
		console.log(`${player.name} ${player.initialRating}`)
	);

	return newPlayersList;
}

function winnersVsWinners(roundIndex, playersList){

	let newPlayersList = playersList.slice();
	//Winners vs Winners and Loosers vs Loosers
	newPlayersList.sort(
		(a, b) =>
			b.matchResult[roundIndex].ratingIncrement -
			a.matchResult[roundIndex].ratingIncrement
	);
	console.log(
		">>>>>Player rating increment for round " +
		(roundIndex+2).toString() +
		" Winners vs Winners and Loosers vs Loosers"
	);
	newPlayersList.forEach((player) =>
		console.log(
			`${player.name} ${player.matchResult[roundIndex].ratingIncrement}`
		)
	);

	return newPlayersList;
}

function winnersVsLosersCrossed(roundIndex, playersList) {

	let newPlayersList = playersList.slice();
	//Winners vs Losers crossed
	newPlayersList.sort(
		(a, b) =>
			b.matchResult[roundIndex].gamesWon -
			a.matchResult[roundIndex].gamesWon				
	)

	const roundPlayers = [0, 7, 1, 6, 2, 5, 3, 4].map(
		(index) => newPlayersList[index]
	);

	newPlayersList = roundPlayers;

	return newPlayersList;
}

export {
	calculateTeamRatingIncrement,
	calculateExpectedScore,
	calculateResult,
	calculateTeamRating,
	shufflePlayers,
	balancePlayersTeams,
	winnersVsWinners,
	winnersVsLosersCrossed,
	calculateKFactor
};
