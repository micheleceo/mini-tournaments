"use strict";
let data;
let registeredPlayers;
let loggedIn = false;

import Tournament from "./Tournament.js";
import Player from "./models/Player.js";
import Round from "./models/Round.js";
import MatchResult from "./models/MatchResult.js";
import { displayPlayersList } from "./displayPlayersList.js";

import {
	calculateResult,
	calculateTeamsRatingIncrement
} from "./utils/ELO.js";

import {
	balancePlayersTeams,
	shufflePlayers,
	winnersVsWinners
} from "./utils/PlayersOrganizer.js";

import {
	requestToDoGet,
	showPasswordPopup,
	requestToDoPost
} from "./requests.js";



// Instantiate the tournament
let tournament;
let currentRoundNumber = 0;

// Create torunament players array
let tournamentPlayers = [];
let roundsPlayersList = [];
//TODO: risolvere prolebi di copia degli array
let roundsUpdatedPlayersList = [];

function startRound1() {
	initializeTournament();

	//  Organize players an create round 1
	const slectedCriterion = document.getElementById(
		"selection-criterion-players"
	);

	switch (slectedCriterion.value) {
		case "rating-balance":
			roundsPlayersList.push(balancePlayersTeams(tournament.playersList));
			break;
		case "random":
			roundsPlayersList.push(shufflePlayers(tournament.playersList));
			break;
		default:
			break;
	}

	setupRound((currentRoundNumber = 1));

	// Go to Round 1
	switchScreen(1, 2);
}

function initializeTournament() {
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
		//	roundsBeforePlayersList.push(tournamentPlayers);
	} else {
		alert("Please select all players before starting the tournament.");
		return;
	}
}

function startRound2() {
	saveRound((currentRoundNumber = 1));

	//  Organize players and create round 2
	const selectElement1 = document.getElementById("selection-criterion-1");

	switch (selectElement1.value) {
		case "semifinal_final":
			roundsPlayersList.push(
				winnersVsWinners(roundsUpdatedPlayersList[0], 0)
			);
			const selectElement2 = document.getElementById(
				"selection-criterion-2"
			);
			selectElement2.style.display = "none";
			break;
		case "winners_vs_losers":
		//TODO: implementare da foglio
		case "random":
			roundsPlayersList.push(
				shufflePlayers(roundsUpdatedPlayersList[0], 0)
			);
			break;
		default:
			break;
	}

	//TODO: modify next step button text to "Go to score calculation"
	setupRound((currentRoundNumber = 2));

	// Go to Round 2
	switchScreen(2, 3);
}


function nextStep() {
	saveRound((currentRoundNumber = 2));

	//  Organize players and create a new round
	const selectElement = document.getElementById("selection-criterion-1");
	if (selectElement.value == "semifinal_final") {
		// Go to score calculation
		gotoScoreCalculationFromRound(2);
	} else {
		//  Organize players and create round 2
		const selectElement2 = document.getElementById("selection-criterion-2");
		switch (selectElement2.value) {
			case "winners_vs_losers":
				roundsPlayersList.push(
					winnersVsWinners(roundsUpdatedPlayersList[1], 0)
				);
			break;
			case "random":
				roundsPlayersList.push(
					shufflePlayers(roundsUpdatedPlayersList[1], 0)
				);
				break;
			default:
				break;
		}
		// Setup round 3
		setupRound(currentRoundNumber=3);
		switchScreen(3, 4);
	}
}

function gotoScoreCalculationFromRound(roundNumber) {
	if(roundNumber == 3){
		saveRound((currentRoundNumber = 3));
	}
	switchScreen(roundNumber + 1, 5);
}

function gotoPreviousStep(currentRoundNumber) {
	const currrentRoundIndex = currentRoundNumber - 1;
	this.players = this.rounds[currrentRoundIndex].playersList;
	switchScreen(currentRoundNumber, currentRoundNumber - 1);
}

function setupRound(roundNumber) {
	let roundIndex = roundNumber - 1;
	let teamIndex = (roundNumber - 1) * 4;
	for (let i = 0; i < 4; i++) {
		const teamElements = document.getElementById(
			`team${++teamIndex}-players`
		);
		teamElements.innerHTML = `${
			roundsPlayersList[roundIndex][i * 2].name
		} <br> 
		  ${roundsPlayersList[roundIndex][i * 2 + 1].name}`;
	}
}

function saveRound(roundNumber) {
	let roundIndex = roundNumber - 1;
	let teamIndex = roundIndex * 4;

	//TODO: valutare se serve salvare il round nel torneo già da adesso
	tournament.rounds.push(new Round(roundsPlayersList[roundIndex]));
	let roundUpdatedPlayersList = [...roundsPlayersList[roundIndex]];

	//Iteration through the 2 matches, calculate the result and update the player results with the rating increment
	for (let i = 0; i < 2; i++) {
		//TODO: forse meglio una funzione saveRound
		const teamAgamesWon =
			parseInt(
				document.getElementById(`team${++teamIndex}-gamesWon`).value
			) || 0;
		tournament.rounds[roundIndex].matches[i].teams[0].gamesWon = teamAgamesWon;
		const teamA = tournament.rounds[roundIndex].matches[i].teams[0];

		const teamBgamesWon =
			parseInt(
				document.getElementById(`team${++teamIndex}-gamesWon`).value
			) || 0;
		tournament.rounds[roundIndex].matches[i].teams[1].gamesWon = teamBgamesWon;
		const teamB = tournament.rounds[roundIndex].matches[i].teams[1];

		const [teamARatingIncrement, teamBRatingIncrement] =
			calculateTeamsRatingIncrement(
				teamA,
				teamB,
				calculateResult(teamAgamesWon, teamBgamesWon)
			);

		roundUpdatedPlayersList[i * 4 + 0].addMatchResults(
			roundIndex,
			new MatchResult(teamAgamesWon, teamBgamesWon, teamARatingIncrement)
		);

		roundUpdatedPlayersList[i * 4 + 1].addMatchResults(
			roundIndex,
			new MatchResult(teamBgamesWon, teamAgamesWon, teamBRatingIncrement)
		);
		roundUpdatedPlayersList[i * 4 + 2].addMatchResults(
			roundIndex,
			new MatchResult(teamAgamesWon, teamBgamesWon, teamARatingIncrement)
		);

		roundUpdatedPlayersList[i * 4 + 3].addMatchResults(
			roundIndex,
			new MatchResult(teamBgamesWon, teamAgamesWon, teamBRatingIncrement)
		);

	}

	roundsUpdatedPlayersList.push(roundUpdatedPlayersList);
	tournament.playersList = roundUpdatedPlayersList;
}

function gotoFinalRanking() {
	const selectScoreCriterion = document.getElementById(
		"score-calculation-criterion"
	);
	const playersRanking = tournament.calculateTournamentScore(selectScoreCriterion.value);

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

	console.log(registeredPlayers);

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
window.gotoScoreCalculation = gotoScoreCalculationFromRound;
window.login = login;
window.showPlayersList = showPlayersList;
window.nextStep = nextStep;
window.gotoFinalRanking = gotoFinalRanking;

// Esporta le funzioni se necessario
export {
	initializeTournament as startTournament,
	handleSelectChange,
	gotoScoreCalculationFromRound as gotoScoreCalculation,
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
	gotoFinalRanking
};
