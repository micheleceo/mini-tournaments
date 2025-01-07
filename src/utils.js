function calculateTeamRatingIncrement(
  teamRating,
  opponentTeamRating,
  teamActualScore
) {
  const K_FACTOR = 32; // Adjust this factor to change the strength of the rating system

  const teamExpectedScore = calculateExpectedScore(
    teamRating,
    opponentTeamRating
  );
  const opponentteamExpectedScore = calculateExpectedScore(
    opponentTeamRating,
    teamRating
  );

  const teamRatingChange = K_FACTOR * (teamActualScore - teamExpectedScore);
  const opponentteamRatingChange =
    K_FACTOR * (1 - teamActualScore - opponentteamExpectedScore);

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

function calculateResult(teamAgamesWon, teamBgamesWon) {
  const delta = teamAgamesWon - teamBgamesWon;
  if (delta > 0) {
    return 1;
  } else if (delta < 0) {
    return 0;
  } else {
    return 0.5;
  }
}

function calculteTeamRating(player1Rating, player2Rating) {
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
		console.log(">>>>Round1 player ordered for match: ");
		newPlayersList = round1Players;
		newPlayersList.forEach((player) =>
			console.log(`${player.name} ${player.initialRating}`)
		);

    return newPlayersList;
	}

export {
  calculateTeamRatingIncrement,
  calculateExpectedScore,
  calculateResult,
  calculteTeamRating,
  shufflePlayers,
  balancePlayersTeams
};
