class Round {
	/**
	 * Creates an instance of Round with an empty list of matches.
	 */
	constructor(playersList) {
		this.beforePlayersList = playersList;
		this.match = [];
		this.afterPlayersList = [];
	}
}

export default Round;
