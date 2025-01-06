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

export {
  calculateTeamRatingIncrement,
  calculateExpectedScore,
  calculateResult,
  calculteTeamRating,
};
