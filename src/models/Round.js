import Team from "./Team.js";
import Match from "./Match.js";
import { calculateTeamsRatingIncrement, calculateResult } from "../utils/ELO.js";
import MatchResult from "./MatchResult.js";

class Round {
	/**
	 * Creates an instance of Round with an empty list of matches.
	 */
	constructor(roundPlayersList) {
		//TODO: riprendere da qui perchè da errore
		// Uso la playersBeforeRound per salvare i giocatori prima del round
		// Se mi serve la lista aggiornata dopo il round, posso chiamare getAfterRoundPlayersList
		this.playersBeforeRound = roundPlayersList.slice();
		this.playersAfterRound= [];
		this.matches = [];
		this.setMatches(roundPlayersList);
	}

	setMatches(playersList) {
		this.matches = [];
		// Create the teams
		const team = [];
		for (let i = 0; i < 4; i++) {
			team.push(
				new Team(playersList[i * 2], playersList[i * 2 + 1])
			);
		}

		// Create the round matches
		this.matches.push(new Match());
		this.matches[0].teams.push(team[0], team[1]);
		this.matches.push(new Match());
		this.matches[1].teams.push(team[2], team[3]);
	}

	updateResults(team1gamesWon, team2gamesWon, team3gamesWon, team4gamesWon) {
		this.playersAfterRound = this.playersBeforeRound.slice();

		this.matches[0].teams[0].setGamesWon(team1gamesWon);
		this.matches[0].teams[1].setGamesWon(team2gamesWon);
		this.matches[1].teams[0].setGamesWon(team3gamesWon);
		this.matches[1].teams[1].setGamesWon(team4gamesWon);

		const [team1RatingIncrement, team2RatingIncrement] = 
		calculateTeamsRatingIncrement(
			this.matches[0].teams[0],
			this.matches[0].teams[1],
			calculateResult(team1gamesWon, team2gamesWon)
		);

		const matchResult1 = new MatchResult(team1gamesWon, team2gamesWon, team1RatingIncrement);

		this.playersAfterRound[0].matchesResult.push(matchResult1);
		this.playersAfterRound[1].matchesResult.push(matchResult1);


		const matchResult2 = new MatchResult(team2gamesWon, team1gamesWon, team2RatingIncrement);
		this.playersAfterRound[2].matchesResult.push(matchResult2);
		this.playersAfterRound[3].matchesResult.push(matchResult2);

		const [team3RatingIncrement, team4RatingIncrement] = 
		calculateTeamsRatingIncrement(
			this.matches[1].teams[0],
			this.matches[1].teams[1],
			calculateResult(team3gamesWon, team4gamesWon)
		);

		const matchResult3 = new MatchResult(team3gamesWon, team4gamesWon, team3RatingIncrement);
		this.playersAfterRound[4].matchesResult.push(matchResult3);
		this.playersAfterRound[5].matchesResult.push(matchResult3);

		const matchResult4 = new MatchResult(team4gamesWon, team3gamesWon, team4RatingIncrement);
		this.playersAfterRound[6].matchesResult.push(matchResult4);
		this.playersAfterRound[7].matchesResult.push(matchResult4);

	}

	/*getAfterRoundPlayersList() {
		const playersAfterRound = [];
		this.matches.forEach((match) => {
			match.teams.forEach((team) => {
				playersAfterRound.push(team.player[0]);
				playersAfterRound.push(team.player[1]);
			});
		});
		return playersAfterRound;
	}*/
}

export default Round;

