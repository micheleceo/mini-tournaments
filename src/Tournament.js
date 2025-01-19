import Player from "./Player.js";
import Team from "./Team.js";
import Match from "./Match.js";
import Round from "./Round.js";
import {
	calculateResult,
	calculateTeamRatingIncrement,
} from "./utils.js";


class Tournament {
	constructor(players) {
		this.tournamentID = "";
		this.playersList = players.slice();
		this.rounds = [];
	}

	organizePlayersForRound(select, currentRoundNumber) {
		const roundIndex = currentRoundNumber - 1;

		switch (select.value) {
			case "semifinal_final":
				//Winners vs Winners and Loosers vs Loosers
				this.playersList.sort(
					(a, b) =>
						b.matchResult[roundIndex].ratingIncrement -
						a.matchResult[roundIndex].ratingIncrement
				);
				console.log(
					">>>>>Player rating increment after round: " +
						currentRoundNumber
				);
				this.playersList.forEach((player) =>
					console.log(
						`${player.name} ${player.matchResult[roundIndex].ratingIncrement}`
					)
				);
				break;
			case "random":
				// Shuffle players
				this.shufflePlayers();
				break;
			case "wvsl_cross":
				// Winners vs Losers crossed
				this.playersList.sort(
					(a, b) =>
						b.matchResult[roundIndex].gamesWon -
						a.matchResult[roundIndex].gamesWon
				);
				const roundPlayers = [0, 7, 1, 6, 2, 5, 3, 4].map(
					(index) => this.playersList[index]
				);
				this.playersList = roundPlayers;
			default:
				break;
		}
	}

	saveRoundMatches(roundNumber) {
		const roundIndex = roundNumber - 1;
		this.rounds[roundIndex].afterPlayersList = this.playersList;
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

	calculateTournamentScore() {
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

		const selectElement1 = document.getElementById(
			"score-calculation-criterion"
		);

		switch (selectElement1.value) {
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

		// Create tournament ranking
		const rankigTable = document.getElementById("ranking-table");
		const tbody = rankigTable.querySelector("tbody");

		const rankingHTML = playersRanking
			.map(
				(player, index) => `
            <tr>
                <td>${index + 1}°</td>
                <td>${player.name}</td> 
                <td>${player.tournamentScore.toFixed(2)}</td>
                <td>${player.tournamentRatingIncrement.toFixed(2)}</td>
            </tr>
        `
			)
			.join("");

		// Insert HTML generated in tbody
		tbody.innerHTML = rankingHTML;

		switchScreen(5, 6);
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

	restartTournament() {
		// Reset all fileds
		resetInputs();

		switchScreen(6, 1);
	}
}

export default Tournament;
