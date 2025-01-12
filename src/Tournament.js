class Tournament {
	constructor(players) {
		this.tournamentID = "";
		this.partecipantsPlayersList = players.map(player => ({
			name: player.name,
			initialRating: player.initialRating,
			totalMatchesPlayed: player.totalMatchesPlayed,
			K: calculateKFactor(player) 
		}));
		this.playersList = players.slice();
		//this.currentRound = 0;
		//this.teams = [];
		this.rounds = [];
	}


	/*gotoPreviousStep(currentRoundNumber) {
		const currrentRoundIndex = currentRoundNumber - 1;
		this.players = this.rounds[currrentRoundIndex].playersList;
		switchScreen(currentRoundNumber, currentRoundNumber - 1);
	}*/


	/**
	 * Calculates the tournament score for each player based on the selected scoring criterion.
	 * Resets and updates player statistics, calculates scores, and generates a ranking table.
	 *
	 * The function first resets all tournament statistics for each player, then updates these
	 * statistics based on the results of each match. The score for each player is calculated
	 * according to the selected criterion, which can be 'win-lose-draw', 'rating-increment',
	 * 'total-gamesWon', or 'relative-gamesWon'. The players are then ranked in descending order
	 * based on their scores, and the results are displayed in the ranking table.
	 */

	calculateTournamentScore(selectedCriterion) {
		// Calculate tournament final rating increment
		this.playersList.forEach((player) => {
			// Reset all fields just to be sure
			player.tournamentRatingIncrement = 0;
			player.tournamentGamesWon = 0;
			player.tournamentGamesLost = 0;
			player.tournamentMatchesWon = 0;
			player.tournamentMatchesDrawn = 0;
			player.tournamentMatchesLost = 0;
			player.tournamentScore = 0;

			// Update all torunament stuff
			player.matchResult.forEach((matchResult) => {
				player.tournamentRatingIncrement += matchResult.ratingIncrement;
				player.tournamentGamesWon += matchResult.gamesWon;
				player.tournamentGamesLost += matchResult.gamesLost;

				if (matchResult.gamesWon > matchResult.gamesLost) {
					player.tournamentMatchesWon++;
				} else if (matchResult.gamesWon < matchResult.gamesLost) {
					player.tournamentMatchesLost++;
				} else if (matchResult.gamesWon === matchResult.gamesLost) {
					player.tournamentMatchesDrawn++;
				}
			});
		});

		switch (selectedCriterion) {
			case "win-lose-draw":
				this.playersList.forEach((player) => {
					player.tournamentScore =
						player.tournamentMatchesWon * 3 +
						player.tournamentMatchesDrawn * 0.5;
				});
				break;
			case "rating-increment":
				this.playersList.forEach((player) => {
					player.tournamentScore = player.tournamentRatingIncrement;
				});
				break;
			case "total-gamesWon":
				this.playersList.forEach((player) => {
					player.tournamentScore = player.tournamentGamesWon;
				});
				break;
			case "relative-gamesWon":
				this.playersList.forEach((player) => {
					player.tournamentScore =
						player.tournamentGamesWon - player.tournamentGamesLost;
				});
				break;
			default:
				break;
		}

		// Sort players by score in descending order
		const playersRanking = [...this.playersList].sort(
			(a, b) => b.tournamentScore - a.tournamentScore
		);

		//TODO: riprendere da qui per pulire il codice
        return playersRanking;
		
	}

	recordTournamentResults(registeredPlayers) {
		this.tournamentID = this.getTournamentID();

		this.playersList.forEach((player) => {
			const index = registeredPlayers.findIndex(
				(registeredPlayers) => registeredPlayers.name === player.name
			);
			if (index !== -1) {
				registeredPlayers[index].rating +=
					player.tournamentRatingIncrement;
				registeredPlayers[index].totalGamesWon +=
					player.tournamentGamesWon;
				registeredPlayers[index].totalGamesLost +=
					player.tournamentGamesLost;
				registeredPlayers[index].totalMatchesWon +=
					player.tournamentMatchesWon;
				registeredPlayers[index].totalMatchesDrawn +=
					player.tournamentMatchesDrawn;
				registeredPlayers[index].totalMatchesLost +=
					player.tournamentMatchesLost;

				const maxScore = Math.max(
					...this.playersList.map((player) => player.tournamentScore)
				);
				if (player.score >= maxScore) {
					registeredPlayers[index].totalTournamentsWon++;
				} else if (player.score < maxScore) {
					registeredPlayers[index].totalTournamentsLost++;
				}
			} else {
				console.error("Player not found");
			}
		});
	}

	/**
	 * Restituisce la data e l'ora attuale della zona di Roma in formato stringa.
	 * @returns {string} Data e ora attuali in formato "AAAA-MM-DD-HH-MM"
	 */
	getTournamentID() {
		const now = new Date();
		const options = {
			timeZone: "Europe/Rome",
			hour12: false,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		};

		const romaDateTime = new Date()
			.toLocaleString("it-IT", options)
			.replace(/\//g, "-");

		// Formatta la data
		return romaDateTime;
	}
}

export default Tournament;

import { calculateKFactor } from "./utils.js";
