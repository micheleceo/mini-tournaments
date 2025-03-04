import Round from "./models/Round.js";

class Tournament {
	constructor(tournamentPlayers) {
		this.tournamentID = "";
		this.playersList = tournamentPlayers;
		this.finalPlayersList = [];
		this.rounds = [];
	}

	createRound(roundNumber, round) {
		const roundIndex = roundNumber - 1;
		this.rounds[roundIndex] = round;
	}

	saveRoundMatches(roundNumber) {
		const roundIndex = roundNumber - 1;
		this.rounds[roundIndex].afterPlayersList = this.playersList;
	}

	setFinalPlayersList() {
		this.finalPlayersList =
			this.rounds[this.rounds.length - 1].playersAfterRound;
	}

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

	calculateTournamentScore(selectScoreCriterion) {
		// Calculate tournament final rating increment
		this.finalPlayersList.forEach((player) => {
			// Reset all fields just to be sure
			player.tournamentRatingIncrement = 0;
			player.tournamentGamesWon = 0;
			player.tournamentGamesLost = 0;
			player.tournamentMatchesWon = 0;
			player.tournamentMatchesDrawn = 0;
			player.tournamentMatchesLost = 0;
			player.tournamentScore = 0;

			// Update all torunament stuff
			player.matchesResult.forEach((matchResult) => {
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

		switch (selectScoreCriterion) {
			case "win-lose-draw":
				this.finalPlayersList.forEach((player) => {
					player.tournamentScore =
						player.tournamentMatchesWon * 3 +
						player.tournamentMatchesDrawn * 0.5;
				});
				break;
			case "rating-increment":
				this.finalPlayersList.forEach((player) => {
					player.tournamentScore = player.tournamentRatingIncrement;
				});
				break;
			case "total-gamesWon":
				this.finalPlayersList.forEach((player) => {
					player.tournamentScore = player.tournamentGamesWon;
				});
				break;
			case "relative-gamesWon":
				this.finalPlayersList.forEach((player) => {
					player.tournamentScore =
						player.tournamentGamesWon - player.tournamentGamesLost;
				});
				break;
			default:
				break;
		}

		// Sort players by score in descending order
		const playersRanking = [...this.finalPlayersList].sort(
			(a, b) => b.tournamentScore - a.tournamentScore
		);

		return playersRanking;
	}

	recordTournamentResults(registeredPlayers) {
		this.tournamentID = this.getTournamentID();

		const maxScore = Math.max(
			...this.finalPlayersList.map((player) => player.tournamentScore)
		);

		this.finalPlayersList.forEach((player) => {
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

				if (player.tournamentScore >= maxScore) {
					registeredPlayers[index].totalTournamentsWon++;
				} else if (player.tournamentScore < maxScore) {
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

	restartTournament() {
		// Reset all fileds
		resetInputs();

		switchScreen(6, 1);
	}
}

export default Tournament;
