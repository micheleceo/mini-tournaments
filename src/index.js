"use strict";
let data;
let registeredPlayers;
let loggedIn = false;

import Tournament from "./Tournament.js";
import Player from "./Player.js";
import Round from "./Round.js";
import { balancePlayersTeams, calculateResult, shufflePlayers, winnersVsLosersCrossed, winnersVsWinners } from "./utils.js";
import { calculateTeamRatingIncrement } from "./utils.js";
import MatchResult from "./MatchResult.js";

let tournament;
let currentScreen = 1;
let currentRoundNumber = 0;


// Global functions for HTML interface

function startTournament() {
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
		// Create torunament players array
		const tournamentPlayers = [];

		// Build player list
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
						registeredPlayers[playerId].rating
					)
				);
			} else {
				console.error(`Cannot find player: ${playerName}`);
			}
		}

		// Create a new tournament
		tournament = new Tournament(tournamentPlayers);

		startRound1();

	} else {
		alert("Please select all players before starting the tournament.");
		return;
	}
}

function startRound1() {
	let round1PlayersList = [];

	//  Organize players an create round 1
	const slected_Citerion = document.getElementById(
		"selection-criterion-players"
	);
	if (slected_Citerion.value == "rating-balance") {
		round1PlayersList = balancePlayersTeams(tournament.playersList);
	} else if (slected_Citerion.value == "random") {
		round1PlayersList = shufflePlayers(tournament.playersList);
	}

	// Create round 1
	let round1 = new Round(round1PlayersList);
	if(tournament.rounds.length == 0)
		tournament.rounds.push(round1);
	else {
		tournament.rounds[0] = round1;
	}
	
	setupRound(currentRoundNumber=1);
	// Go to Round 1
	switchScreen(1, 2);
}


function startRound2() {
	let round2PlayersList = [];

	//TODO: ripartire da qui e controllare dove vengono salvati i MathcResult
	setRoundResults(currentRoundNumber=1);

	const selectElement1 = document.getElementById(
		"selection-criterion-1"
	); 

	switch (selectElement1.value) {
		case "semifinal_final":
			round2PlayersList = winnersVsWinners(0,tournament.rounds[0].playersList);
			const selectElement2 = document.getElementById(
				"selection-criterion-2"
			);
			selectElement2.style.display = "none";
			break;
		case "random":
			round2PlayersList = shufflePlayers(tournament.rounds[0].playersList);
			break;
		case "wvsl_cross":
			round2PlayersList = winnersVsLosersCrossed(0,tournament.rounds[0].playersList);
			break;
	}

	// Create round 2
	let round2 = new Round(round2PlayersList);
	if(tournament.rounds.length == 1)
		tournament.rounds.push(round2);
	else {
		tournament.rounds[0] = round2;
	}

	//TODO: modify next step button text to "Go to score calculation"
	setupRound(currentRoundNumber=2);

	// Go to Round 2
	switchScreen(2, 3);
}

function nextStep() {
	setRoundResults(currentRoundNumber=2);

	//  Organize players and create a new round
	const selectElement = document.getElementById(
		"selection-criterion-1"
	);
	if (selectElement.value == "semifinal_final") {
		// Go to score calculation
		switchScreen(3, 5);
	} else {
		// Setup round 3
		setupRound(currentRoundNumber=3);
		switchScreen(3, 4);
	}
}


function gotoScoreCalculation() {
	switchScreen(4, 5);
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
			tournament.rounds[roundIndex].playersList[i * 2].name
		} <br> 
		  ${tournament.rounds[roundIndex].playersList[i * 2 + 1].name}`;
	}
}

function setRoundResults(roundNumber) {
	let roundIndex = roundNumber - 1;
	let teamIndex = roundIndex * 4;

	//Iteration through the 2 matches, calculate the result and update the player results with the rating increment
	for (let i = 0; i < 2; i++) {

		let teamA = tournament.rounds[roundIndex].matches[i].teams[0];
		let teamB = tournament.rounds[roundIndex].matches[i].teams[1];

        const teamAgamesWon = parseInt(
			document.getElementById(`team${++teamIndex}-gamesWon`).value 
		) || 0;
		teamA.gamesWon = teamAgamesWon;

		const teamBgamesWon = parseInt(
			document.getElementById(`team${++teamIndex}-gamesWon`).value
		) || 0;
		teamB.gamesWon = teamBgamesWon;

		//Update player results with the rating increment
		
		//Calculate rating increment
		const [teamARatingIncrement, teamBRatingIncrement] =
			calculateTeamRatingIncrement(
				teamA.initialRating,
				teamB.initialRating,
				calculateResult(
					teamAgamesWon,
					teamBgamesWon)
			);

		let teamAmatchResult = new MatchResult(
			teamAgamesWon,
			teamBgamesWon,
			teamARatingIncrement
		);
		tournament.rounds[roundIndex].playersList[i * 4 + 0].saveMatchResults(roundIndex,teamAmatchResult);
		tournament.rounds[roundIndex].playersList[i * 4 + 1].saveMatchResults(roundIndex,teamAmatchResult);

		let teamBmatchResult = new MatchResult(
			teamBgamesWon,
			teamAgamesWon,
			teamBRatingIncrement
		);
		tournament.rounds[roundIndex].playersList[i * 4 + 2].saveMatchResults(roundIndex,teamBmatchResult);
		tournament.rounds[roundIndex].playersList[i * 4 + 3].saveMatchResults(roundIndex,teamBmatchResult);
	
	}
}

function calculateTournamentScore() {
	const selectElement = document.getElementById(
		"score-calculation-criterion"
	);
	const playersRanking = tournament.calculateTournamentScore(selectElement.value);

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
	// Reset all fileds
	resetInputs();

	switchScreen(6, 1);
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

function displayPlayersList() {
	const modal = document.getElementById("playesrsListModal");
	const playersTbody = document.getElementById("players-tbody");
	const nameHeader = document.getElementById("name-header");
	const ratingHeader = document.getElementById("rating-header");

	let sortBy = "name"; // Default sort by name
	let sortOrder = "asc"; // Default sort order ascending

	function renderPlayersList() {
		playersTbody.innerHTML = "";
		let sortedPlayers = [...registeredPlayers];

		if (sortBy === "name") {
			sortedPlayers.sort((a, b) => {
				if (a.name < b.name) return sortOrder === "asc" ? -1 : 1;
				if (a.name > b.name) return sortOrder === "asc" ? 1 : -1;
				return 0;
			});
		} else if (sortBy === "rating") {
			sortedPlayers.sort((a, b) => {
				return sortOrder === "asc"
					? a.rating - b.rating
					: b.rating - a.rating;
			});
		}

		sortedPlayers.forEach((player) => {
			const row = document.createElement("tr");
			row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.rating.toFixed(2)}</td>
            `;
			playersTbody.appendChild(row);
		});
	}

	nameHeader.addEventListener("click", () => {
		sortBy = "name";
		sortOrder = sortOrder === "asc" ? "desc" : "asc";
		renderPlayersList();
	});

	ratingHeader.addEventListener("click", () => {
		sortBy = "rating";
		sortOrder = sortOrder === "asc" ? "desc" : "asc";
		renderPlayersList();
	});

	modal.style.display = "block";
	renderPlayersList();

	// Add an event to close the modal
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.style.display = "none";
		}
	});
}

let url =
	"https://script.google.com/macros/s/AKfycbx44BoWtW35013PtfBDmyb00pd7c1z1yewlXFcFxtcxgYo_Ch_7cUhEWrgJ-ak3k"; // Replace with your deployed script URL

//Grdrive requests
async function requestToDoGet() {
	let jsonfile;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Network response was not ok: ${response.statusText}`
			);
		}

		jsonfile = await response.json();
		return jsonfile;
	} catch (error) {
		console.error(
			"There has been a problem with your fetch operation:",
			error
		);
		return "error";
	}
}

async function requestToDoPost(json_data) {
	try {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(json_data),
		});

		if (!response.ok) {
			throw new Error(
				`Network response was not ok: ${response.statusText}`
			);
		}

		const data = await response.json();
	} catch (error) {
		console.error(
			"There has been a problem with your fetch operation:",
			error
		);
	}
}

async function showPasswordPopup() {
	const password = prompt("Please enter the password:");
	url = url + password + "/exec";
	const response = await requestToDoGet();

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
window.startTournament = startTournament;
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
window.nextStep = nextStep;
window.gotoScoreCalculation = gotoScoreCalculation;


// Esporta le funzioni se necessario
export {
	startTournament,
	handleSelectChange,
	gotoScoreCalculation,
	startRound1,
	startRound2,
	nextStep,
	gotoPreviousStep,
	calculateTournamentScore,
	recordTournamentResults,
	restartTournament,
	switchScreen,
	displayNewPlayerForm,
	cancel,
	insertNewPlayer,
	displayPlayersList,
	showPasswordPopup,
	resetInputs,
	resetSelects,
	registeredPlayers,
};


