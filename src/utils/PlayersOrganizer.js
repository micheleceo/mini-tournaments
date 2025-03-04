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

/**
 * Sorts the players list based on their rating increments after the given round index. This
 * function is used to set up the matches for the next round after the first round, putting
 * the winners of the first round against each other and the losers against each other.
 * @param {number} roundIndex - The index of the round for which the player rating increments
 * are used for sorting.
 * @returns {Player[]} The sorted players list.
 */
function winnersVsWinners(playersList,roundIndex){

	let newPlayersList = playersList.slice();
	//Winners vs Winners and Loosers vs Loosers
	newPlayersList.sort(
		(a, b) =>
			b.matchesResult[roundIndex].ratingIncrement -
			a.matchesResult[roundIndex].ratingIncrement
	);
	console.log(
		">>>>>Player rating increment for round " +
		(roundIndex+2).toString() +
		" Winners vs Winners and Loosers vs Loosers"
	);
	newPlayersList.forEach((player) =>
		console.log(
			`${player.name} ${player.matchesResult[roundIndex].ratingIncrement}`
		)
	);

	return newPlayersList;
}

function winnersWithLosersCrossed(playersList,roundIndex) {

	let newPlayersList = [];//playersList.slice();

	const court1Players = playersList.slice(0, 4);
	//Winners vs Losers crossed
	court1Players.sort(
		(a, b) =>
			b.matchesResult[roundIndex].gamesWon -
			a.matchesResult[roundIndex].gamesWon				
	)
	const court2Players = playersList.slice(4, 8);
	court2Players.sort(
		(a, b) =>
			b.matchesResult[roundIndex].gamesWon -
			a.matchesResult[roundIndex].gamesWon				
	)

    newPlayersList.push(court1Players[0]);
	newPlayersList.push(court2Players[2]);
	newPlayersList.push(court1Players[1]);
	newPlayersList.push(court2Players[3]);

	newPlayersList.push(court2Players[0]);
	newPlayersList.push(court1Players[2]);
	newPlayersList.push(court2Players[1]);
	newPlayersList.push(court1Players[3]);
    //OLD MAPPING
	/*const roundPlayers = [0, 7, 1, 6, 2, 5, 3, 4].map(
		(index) => newPlayersList[index]
	);*/

	//newPlayersList = roundPlayers;

	return newPlayersList;
}


function fixedRotation(playersList,roundIndex) {

	let tempPlayerList = playersList.slice();
	let newPlayersList = [];

	if(roundIndex === 0){
		newPlayersList = [0, 4, 1, 5, 6, 2, 7, 3].map(
			(index) => tempPlayerList[index]
		);
	}
	else if(roundIndex === 1){
		newPlayersList = [0, 4, 2, 6, 5, 1, 7, 3].map(
			(index) => tempPlayerList[index]
		);
	}
	return newPlayersList;
}

export {
	shufflePlayers,
	balancePlayersTeams,
	winnersVsWinners,
	winnersWithLosersCrossed,
	fixedRotation
};
