"use strict";
let data;
let registeredPlayers;
let loggedIn = false;

import Tournament from "./Tournament.js";
import Player from "./models/Player.js";
import Round from "./models/Round.js";
import { displayPlayersList } from "./displayPlayersList.js";


import {
	balancePlayersTeams,
	shufflePlayers,
	winnersVsLosersCrossed,
	winnersVsWinners
} from "./utils/PlayersOrganizer.js";

import {
	requestToDoGet,
	showPasswordPopup,
	requestToDoPost
} from "./requests.js";

// Instantiate the tournament
let tournament;
let roundNumber;

// Create torunament players array
let tournamentPlayers = [];

function startRound1() {
	//Inizilize the tournament with the selected players list
	initializeTournament();

	//  Organize players an create round 1
	const slectedCriterion = document.getElementById(
		"selection-criterion-players"
	);

	let round1PlayersList;

	switch (slectedCriterion.value) {
		case "rating-balance":
			round1PlayersList = balancePlayersTeams(
				tournament.playersList
			);
			break;
		case "random":
			round1PlayersList = shufflePlayers(tournament.playersList);
			break;
		default:
			break;
	}

	const round1 = new Round(round1PlayersList);
	tournament.createRound((roundNumber = 1), round1);

	setupGUIForRound(1);

	// Go to Round 1
	switchScreen(1, 2);
}

function initializeTournament() {
	// Check if all players are selected
	const selects = document.querySelectorAll(".player-select");
	let allSelected = true;

	selects.forEach((select) => {
		if (select.value === "") {
			allSelected = false;
		}
	});

	const matchInputs = document.querySelectorAll(".match input");
	matchInputs.forEach((input) => {
		input.value = "";
	});

	if (allSelected) {
		// Build players list
		for (let i = 0; i < 8; i++) {
			const playerSelect = document.getElementById(
				`player${i + 1}-select`
			);
			const playerName =
				playerSelect.value.trim() ||
				playerSelect.getAttribute("data-default");
			const playerId = registeredPlayers.findIndex(
				(rp) => rp.name === playerName
			);
			if (playerId !== -1) {
				tournamentPlayers.push(
					new Player(
						registeredPlayers[playerId].name,
						registeredPlayers[playerId].rating,
						registeredPlayers[playerId].totalMatchesWon +
							registeredPlayers[playerId].totalMatchesDrawn +
							registeredPlayers[playerId].totalMatchesLost
					)
				);
			} else {
				console.error(`Cannot find player: ${playerName}`);
			}
		}

		// Create a new tournament
		tournament = new Tournament(tournamentPlayers);
	} else {
		alert("Please select all players before starting the tournament.");
		return;
	}
}

function startRound2() {
	saveRound(1);

	//  Organize players and create round 2
	const selectElement1 = document.getElementById("selection-criterion-1");

	let round2PlayersList;

	switch (selectElement1.value) {
		case "semifinal_final":
			round2PlayersList  = winnersVsWinners(
				tournament.rounds[0].playersAfterRound,
				0
			);
			// Hide the second selection criterion
			const selectElement2 = document.getElementById(
				"selection-criterion-2"
			);
			selectElement2.style.display = "none";
			break;
		case "winners_vs_losers_cross":
			round2PlayersList = winnersVsLosersCrossed(
				tournament.rounds[0].playersAfterRound,
				0
			);
		case "random":
			round2PlayersList  = shufflePlayers(
				tournament.rounds[0].playersAfterRound,
				0
			);
			break;
		default:
			break;
	}

	const round2 = new Round(round2PlayersList);
	tournament.createRound((roundNumber = 2), round2);


	//TODO: modify next step button text to "Go to score calculation"
	setupGUIForRound(2);

	// Go to Round 2
	switchScreen(2, 3);
}

function nextStep() {
	//  Organize players and create a new round
	const selectElement = document.getElementById("selection-criterion-1");
	if (selectElement.value == "semifinal_final") {
		// Go to score calculation
		gotoScoreCalculationFromRound(2);
	} else {
		startRound3();
	}
}

function startRound3() {

	saveRound(2);

	let round3PlayersList;

	//  Organize players and create round 3
	const selectElement2 = document.getElementById("selection-criterion-2");
	switch (selectElement2.value) {
		//TODO: ripredenre da qui, definire i critere per il terzo round
		case "winners_vs_losers":
			round3PlayersList = winnersVsWinners(tournament.rounds[1].playersAfterRound, 1);
			break;
		case "random":
			round3PlayersList = shufflePlayers(tournament.rounds[1].playersAfterRound, 1);
			break;
		default:
			break;
	}

	const round3 = new Round(round3PlayersList);
	tournament.createRound((roundNumber = 3), round3);

	// Setup round 3
	setupGUIForRound((roundNumber = 3));
	switchScreen(3, 4);
}

function gotoScoreCalculationFromRound(roundNumber) {
	if (roundNumber == 2) {
		saveRound((roundNumber = 2));
	}
	if (roundNumber == 3) {
		saveRound((roundNumber = 3));
	}

	tournament.setFinalPlayersList();

	switchScreen(roundNumber + 1, 5);
}

function gotoPreviousStep(currentRoundNumber) {
	const currrentRoundIndex = currentRoundNumber - 1;
	this.players = this.rounds[currrentRoundIndex].playersList;
	switchScreen(currentRoundNumber, currentRoundNumber - 1);
}

function setupGUIForRound(roundNumber) {
	let roundIndex = roundNumber - 1;
	let teamIndex = (roundNumber - 1) * 4;
	for (let i = 0; i < 4; i++) {
		const teamElements = document.getElementById(
			`team${++teamIndex}-players`
		);
		teamElements.innerHTML = `${
			tournament.rounds[roundIndex].playersBeforeRound[i * 2].name
		} <br> 
		  ${tournament.rounds[roundIndex].playersBeforeRound[i * 2 + 1].name}`;
	}
}

function saveRound(roundNumber) {
	let roundIndex = roundNumber - 1;
	let teamIndex = roundIndex * 4;

	//TODO: Qui si potrebbe implementare un ciclo e chiamrar la funzione updateResults con un array di risultati
	// Fatti controllare che funzioni
	let teamsGamesWon = [];
	for (let i = 0; i < 4; i++) {
		teamsGamesWon.push(
			parseInt(
				document.getElementById(`team${++teamIndex}-gamesWon`).value
			) || 0
		);
	}
	

	/*const team1gamesWon =
		parseInt(
			document.getElementById(`team${++teamIndex}-gamesWon`).value
		) || 0;

	const team2gamesWon =
		parseInt(
			document.getElementById(`team${++teamIndex}-gamesWon`).value
		) || 0;

	const team3gamesWon =
		parseInt(
			document.getElementById(`team${++teamIndex}-gamesWon`).value
		) || 0;

	const team4gamesWon =
		parseInt(
			document.getElementById(`team${++teamIndex}-gamesWon`).value
		) || 0;*/

	tournament.rounds[roundIndex].updateResults(
		teamsGamesWon[0],
		teamsGamesWon[1],
		teamsGamesWon[2],
		teamsGamesWon[3]
	);

}

function gotoFinalRanking() {
	const selectScoreCriterion = document.getElementById(
		"score-calculation-criterion"
	);
	const playersRanking = tournament.calculateTournamentScore(
		selectScoreCriterion.value
	);

	// Display the ranking table
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

function calculateTournamentScore() {
	tournament.calculateTournamentScore();
}

function recordTournamentResults() {
	tournament.recordTournamentResults(registeredPlayers);

	if (loggedIn) {
		// Save data to Google Drive
		requestToDoPost(data);
	} else {
		// Convert data to JSON
		const jsonData = JSON.stringify(data, null, 2); // Il 2 indica l'indentazione
		exportJSON(jsonData);
	}
}

function exportJSON(jsonData) {
	// Create an invisible link element to download the JSON file
	const link = document.createElement("a");
	link.setAttribute(
		"href",
		"data:text/json;charset=utf-8," + encodeURIComponent(jsonData)
	);
	link.setAttribute("download", "registeredPlayers.json"); // Nome del file da scaricare

	// Add the link to the DOM is necessary to trigger the download
	document.body.appendChild(link);

	// Simulate a click on the link to download the JSON file
	link.click();

	// Remove the link from the DOM
	document.body.removeChild(link);
}

function restartTournament() {
	tournament.restartTournament();
}

function switchScreen(currentScreen, nextScreen) {
	document
		.getElementById(`screen${currentScreen}`)
		.classList.remove("active");
	document.getElementById(`screen${nextScreen}`).classList.add("active");
}

function handleSelectChange(event) {
	const selectedPlayer = event.target.value;

	const allSelects = document.querySelectorAll(".player-select");
	const index = Array.from(allSelects).indexOf(event.target);

	// Disable current select
	event.target.disabled = true;

	// Enable next select removing selected options
	const nextSelect = allSelects[index + 1];
	if (nextSelect) {
		nextSelect.disabled = false;

		// Remove selected opsions
		nextSelect.innerHTML = "";

		const remainingPlayers = Array.from(allSelects)
			.slice(0, index + 1)
			.reduce((acc, select) => {
				const selectedOption = select.options[select.selectedIndex];
				if (selectedOption) {
					acc.push(selectedOption.value);
				}
				return acc;
			}, []);
		const options = registeredPlayers.filter(
			(rP) => !remainingPlayers.includes(rP.name)
		);

		// Add empty option in first place
		const emptyOption = document.createElement("option");
		emptyOption.value = "";
		emptyOption.text = "";
		nextSelect.add(emptyOption);

		// Add other options from othìì
		options.forEach((g) => {
			const option = document.createElement("option");
			option.value = g.name;
			option.text = g.name;
			nextSelect.add(option);
		});
	}
}

/**
 * Initialize first select with all players.
 * Disable all other selects.
 */
function initializeFirstSelect() {
	// Initialize player1 options
	const select1 = document.getElementById("player1-select");
	const emptyOption = document.createElement("option");
	emptyOption.value = "";
	emptyOption.text = "";
	select1.add(emptyOption);

	registeredPlayers.forEach((player) => {
		const option = document.createElement("option");
		option.value = player.name;
		option.text = player.name;
		select1.add(option);
	});

	select1.disabled = false;
}

function resetSelects() {
	const allSelects = document.querySelectorAll(".player-select");
	allSelects.forEach((select) => {
		select.value = "";
		select.disabled = true;
		while (select.options.length > 0) {
			select.remove(0);
		}
	});
	initializeFirstSelect();
}

function resetInputs() {
	const inputs = document.querySelectorAll("input");
	inputs.forEach((input) => {
		input.value = "";
	});

	resetSelects();
}

// Inizialize all selects at DOM ready
document.addEventListener("DOMContentLoaded", async function () {
	data = await getJsonData();

	// CHeck if some error occurred
	if (data === null) {
		alert("Error fetching JSON file. Refresh da page to try again.");
		return;
	}

	registeredPlayers = data.registeredPlayers;

	//console.log(registeredPlayers);

	initializeFirstSelect();
});

async function getJsonData() {
	try {
		const response = await fetch("./assets/data/registeredPlayers.json");
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const jsonData = await response.json();
		return jsonData;
	} catch (error) {
		console.error("Error fetching JSON file:", error);
		return null; // Gestisci l'errore restituendo null o un valore di default
	}
}

/**
 * Shows the new player modal and sets the input field value to an empty string.
 */
function displayNewPlayerForm() {
	const modal = document.getElementById("playerModal");
	modal.style.display = "block";
	document.getElementById("newPlayerName").value = "";
}

/**
 * Closes the new player modal by setting its display property to 'none'.
 */
function cancel() {
	const modal = document.getElementById("playerModal");
	modal.style.display = "none";
}

//TODO: valutere di spostarlo in un altro file
function insertNewPlayer() {
	const newPlayerName = document.getElementById("newPlayerName").value;
	if (newPlayerName.trim() === "") {
		alert("Insert valid name");
		return;
	}
	if (registeredPlayers.some((player) => player.name === newPlayerName)) {
		alert("This player is already registered");
		return;
	}

	//TODO Maybe add new player to DB

	// Add new player to the registered players
	registeredPlayers.push({
		name: newPlayerName,
		rating: 1500,
	});

	const modal = document.getElementById("playerModal");

	// Close modal
	modal.style.display = "none";

	resetSelects();
}

function showPlayersList() {
	displayPlayersList(registeredPlayers);
}

async function login() {
	const response = await showPasswordPopup();
	if (response === "error") {
		alert("Incorrect password!");
	} else {
		loggedIn = true;
		data = response;
		registeredPlayers = data.data;
		resetSelects();
	}
}

// Esporta le funzioni se necessario
export {
	initializeTournament as startTournament,
	handleSelectChange,
	gotoScoreCalculationFromRound,
	startRound1,
	startRound2,
	gotoPreviousStep,
	calculateTournamentScore,
	recordTournamentResults,
	restartTournament,
	switchScreen,
	displayNewPlayerForm,
	cancel,
	insertNewPlayer,
	displayPlayersList,
	resetInputs,
	resetSelects,
	registeredPlayers,
	login,
	showPlayersList,
	nextStep,
	gotoFinalRanking,
};

// Assegna le funzioni all'oggetto window
window.handleSelectChange = handleSelectChange;
window.startTournament = initializeTournament;
window.gotoPreviousStep = gotoPreviousStep;
window.calculateTournamentScore = calculateTournamentScore;
window.recordTournamentResults = recordTournamentResults;
window.restartTournament = restartTournament;
window.switchScreen = switchScreen;
window.displayNewPlayerForm = displayNewPlayerForm;
window.cancel = cancel;
window.insertNewPlayer = insertNewPlayer;
window.displayPlayersList = displayPlayersList;
window.showPasswordPopup = showPasswordPopup;
window.resetSelects = resetSelects;
window.resetInputs = resetInputs;
window.registeredPlayers = registeredPlayers;
window.startRound1 = startRound1;
window.startRound2 = startRound2;
window.gotoScoreCalculationFromRound = gotoScoreCalculationFromRound;
window.login = login;
window.showPlayersList = showPlayersList;
window.nextStep = nextStep;
window.gotoFinalRanking = gotoFinalRanking;
