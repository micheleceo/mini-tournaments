class Round {
	/**
	 * Creates an instance of Round with an empty list of matches.
	 */
	constructor(roundPlayersList) {
		this.playersList = roundPlayersList.slice();
		this.matches = [];

		// Create the teams
		const team = [];
		for (let i = 0; i < 4; i++) {
		team.push(
			new Team(
				this.playersList[i * 2],
				this.playersList[i * 2 + 1],
			)
		);
		}

		// Create the round matches
		this.matches.push(new Match());
		this.matches[0].teams.push(team[0], team[1]);
		this.matches.push(new Match());
		this.matches[1].teams.push(team[2], team[3]);

	}
  
}

export default Round;
import Team from "./Team.js";
import Match from "./Match.js";
