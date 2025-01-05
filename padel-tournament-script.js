'use strict';
let data ;
let registeredPlayers;
let loggedIn = false;

import Player from './Player.js';
import Team from './Team.js';
import Match from './Match.js';
import Round from './Round.js';
import MatchResult from './MatchResult.js';
import Tournament from './Tournamet.js';

// Instantiate the tournament
const tournament = new Tournament();

// Global functions for HTML interface
function startTournament() {
    const selects = document.querySelectorAll('.player-select');
    let allSelected = true;

    selects.forEach((select) => {
        if (select.value === '') {
        allSelected = false;
        }
    });

    if (allSelected) {
        // Start the tournament
        tournament.startTournament();
    } else {
        alert('Please select all players before starting the tournament.');
        return;
    }
}

function gotoNextStep(currentRound) {
    tournament.gotoNextStep(currentRound);
}

function calculateTournamentScore() {
    tournament.calculateTournamentScore();
}

function recordTournamentResults() {
    tournament.recordTournamentResults();
}

function restartTournament() {
    tournament.restartTournament();
}

function switchScreen(currentScreen, nextScreen) {
    document.getElementById(`screen${currentScreen}`).classList.remove('active');
    document.getElementById(`screen${nextScreen}`).classList.add('active');
}

function calculateTeamRatingIncrement(teamRating, opponentTeamRating, teamActualScore) {
    const K_FACTOR = 32; // Adjust this factor to change the strength of the rating system

    const teamExpectedScore = calculateExpectedScore(teamRating, opponentTeamRating);
    const opponentteamExpectedScore = calculateExpectedScore(opponentTeamRating, teamRating);

    const teamRatingChange = K_FACTOR * (teamActualScore - teamExpectedScore);
    const opponentteamRatingChange = K_FACTOR * (1 - teamActualScore - opponentteamExpectedScore);

    return [teamRatingChange, opponentteamRatingChange];
}

/**
     * Calculate the expected score of a player
     * @param {number} playerRating - Current rating of the player
     * @param {number} opponentRating - Current rating of the opponent
     * @returns {number} Expected score (between 0 and 1)
     */
function calculateExpectedScore(playerRating, opponentRating) {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}


function calculateResult(teamAgamesWon, teamBgamesWon) {
    const delta = teamAgamesWon - teamBgamesWon;
    if( delta > 0){
        return 1; 
    }else if( delta < 0){
        return 0;
    }else{
        return 0.5;
    }
}

function calculteTeamRating(player1Rating, player2Rating){
    return (player1Rating+player2Rating)/2; 
}


function handleSelectChange(event) {
    const selectedPlayer = event.target.value;

    const allSelects = document.querySelectorAll('.player-select');
    const index = Array.from(allSelects).indexOf(event.target);
  
    // Disable current select
    event.target.disabled = true;
  
    // Enable next select removing selected options
    const nextSelect = allSelects[index + 1];
    if (nextSelect) {
        nextSelect.disabled = false;

        // Remove selected opsions
        nextSelect.innerHTML = '';

        const remainingPlayers = Array.from(allSelects).slice(0, index + 1).reduce((acc, select) => {
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption) {
            acc.push(selectedOption.value);
            }
            return acc;
        }, []);
        const options = registeredPlayers.filter(rP => !remainingPlayers.includes(rP.name));

        // Add empty option in first place
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.text = '';
        nextSelect.add(emptyOption);

        // Add other options from othìì
        options.forEach(g => {
            const option = document.createElement('option');
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
    const select1 = document.getElementById('player1-select');
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.text = '';
    select1.add(emptyOption)
    
    registeredPlayers.forEach(player => {
        const option = document.createElement('option');
        option.value = player.name;
        option.text = player.name;
        select1.add(option);
    });

    select1.disabled = false;
}


function resetSelects() {
    const allSelects = document.querySelectorAll('.player-select');
    allSelects.forEach(select => {
      select.value = '';
      select.disabled = true;
      while (select.options.length > 0) {
        select.remove(0);
      }
    });
    initializeFirstSelect();
}


// Inizialize all selects at DOM ready
document.addEventListener('DOMContentLoaded', async function() {

   data = await getJsonData();

   // CHeck if some error occurred
   if (data === null) {
    alert('Error fetching JSON file. Refresh da page to try again.');
    return;
   }

   registeredPlayers = data.registeredPlayers;

   console.log(registeredPlayers);

   initializeFirstSelect();  
});


async function getJsonData() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/micheleceo/mini-tournaments/refs/heads/main/registeredPlayers.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      return jsonData; 
    } catch (error) {
      console.error('Error fetching JSON file:', error);
      return null; // Gestisci l'errore restituendo null o un valore di default
    }
}


/**
 * Shows the new player modal and sets the input field value to an empty string.
 */
function displayNewPlayerForm() {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'block';
    document.getElementById('newPlayerName').value = '';
}


/**
 * Closes the new player modal by setting its display property to 'none'.
 */
function cancel() {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'none';
}


function insertNewPlayer() {

    const newPlayerName = document.getElementById('newPlayerName').value;
    if (newPlayerName.trim() === '') {
        alert('Insert valid name');
        return;
    }
    if ( registeredPlayers.some(player => player.name === newPlayerName) ){
        alert('This player is already registered');
        return;
    }
    
    //TODO Add new player to DB
    
    // Add new player to the registered players
    registeredPlayers.push({
        name: newPlayerName,
        rating: 1500
    });

    const modal = document.getElementById('playerModal');

    // Close modal
    modal.style.display = 'none';

    resetSelects();
}

function displayPlayersList() {
    const modal = document.getElementById('playesrsListModal');
    const playersTbody = document.getElementById('players-tbody');
    const nameHeader = document.getElementById('name-header');
    const ratingHeader = document.getElementById('rating-header');

    let sortBy = 'name'; // Default sort by name
    let sortOrder = 'asc'; // Default sort order ascending

    function renderPlayersList() {
        playersTbody.innerHTML = '';
        let sortedPlayers = [...registeredPlayers];

        if (sortBy === 'name') {
            sortedPlayers.sort((a, b) => {
                if (a.name < b.name) return sortOrder === 'asc' ? -1 : 1;
                if (a.name > b.name) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        } else if (sortBy === 'rating') {
            sortedPlayers.sort((a, b) => {
                return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            });
        }

        sortedPlayers.forEach((player) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.rating.toFixed(2)}</td>
            `;
            playersTbody.appendChild(row);
        });
    }

    nameHeader.addEventListener('click', () => {
        sortBy = 'name';
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        renderPlayersList();
    });

    ratingHeader.addEventListener('click', () => {
        sortBy = 'rating';
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        renderPlayersList();
    });

    modal.style.display = 'block';
    renderPlayersList();

    // Add an event to close the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function getTournametID() {
    const now = new Date();
    const options = { 
        timeZone: 'Europe/Rome',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };

    const romaDateTime = new Date().toLocaleString('it-IT', options).replace(/\//g, '-');

    // Formatta la data
    return romaDateTime;
}

let url = 'https://script.google.com/macros/s/AKfycbx44BoWtW35013PtfBDmyb00pd7c1z1yewlXFcFxtcxgYo_Ch_7cUhEWrgJ-ak3k'; // Replace with your deployed script URL

//Grdrive requests
async function requestToDoGet() {
    let jsonfile;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      jsonfile = await response.json();
      return jsonfile;
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      return "error";
    }
  }


  async function requestToDoPost(json_data) {
  
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(json_data)
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json();
      
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
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
        registeredPlayers  = data.data
        resetSelects();
    }

}

window.handleSelectChange = handleSelectChange;
// Esporta la funzione se necessario

export {tournament, MatchResult, Round, Match, Team, Player, registeredPlayers, loggedIn, showPasswordPopup, handleSelectChange };