'use strict';
let data ;
let registeredPlayers;
let loggedIn = false;

class Player {
    constructor(name,initialRating) {
        if (typeof initialRating !== 'number') {
            throw new TypeError("Rating must be a number");
          }
        this.name = name;
        this.initialRating = initialRating;

        this.tournamentGamesWon = 0;
        this.tournamentGamesLost = 0;
        this.tournamentMatchesWon = 0;
        this.tournamentMatchesDrawn = 0;
        this.tournamentMatchesLost = 0;
        this.tournamentRatingIncrement = 0;
        this.tournamentScore = 0;
 
        this.matchResult = [];
    }

    /**
     * Records a new round, updates round for the player, and updates game wins and relative points.
     * @param {number} teamGameWins - Game won by the player's team
     * @param {number} opponentTeamGameWins - Games won by the opponent team
     */
    saveMatchResults(roundindex,matchGamesWon, matchGamesLost,matchRatingIncrement) {
        let matchResult = new MatchResult();
        matchResult.gamesWon = matchGamesWon;
        matchResult.gamesLost = matchGamesLost;
        matchResult.ratingIncrement = matchRatingIncrement;
        if(this.matchResult.length < roundindex+1){
            this.matchResult.push(matchResult); 
        }
        else{
            this.matchResult[roundindex] = matchResult;
        }
       
    }
}


class MatchResult {
/**
 * Creates an instance of MatchResult with an empty list of matches.
 */
    constructor() {
        this.gamesWon = 0;
        this.gamesLost = 0;
        this.ratingIncrement = 0;
    }
}


class Round {
/**
 * Creates an instance of Round with an empty list of matches.
 */
    constructor() {
        this.match = [];
    }
}


class Match {
/**
 * Initializes a new Match instance with an empty list of teams.
 */
    constructor() {
        this.team = [];
    }
}


class Team {
    /**
     * Initializes a new Team instance.
     * @param {Player} playerA - The first player in the team.
     * @param {Player} playerB - The second player in the team.
     * @param {number} gamesWon - The number of games won by the team.
     */

    constructor(playerA,playerB, gamesWon) {
       this.playerA = playerA;
       this.playerB = playerB;
       this.gamesWon = gamesWon;
    }
}


class Tournament {
    constructor() {
        this.player = [];
        this.currentRound = 0;
        this.team=[];
        this.round=[];
    }

    startTournament() {
       
        // Reset tournament
        this.player = [];

        // Build player list
        for (let i = 0; i < 8; i++) {
            const playerSelect = document.getElementById(`player${i+1}-select`);
            const playerName = playerSelect.value.trim() || playerSelect.getAttribute('data-default');
            const playerId = registeredPlayers.findIndex(rp  => rp.name === playerName);
            if (playerId !== -1) {
                this.player.push(new Player(registeredPlayers[playerId].name,registeredPlayers[playerId].rating));
            } else {
                console.error(`Cannot find player: ${playerName}`);
            }
           
        }
        
        //console.log("Tournament player list: ",this.player);

        /*this.buttonToround2 = document.getElementById('toround2');
        this.buttonToround3 = document.getElementById('toround3');*/
      /*  this.buttonToround2.hidden = true;
        this.buttonToround3.hidden = true;*/

        this.gotoNextStep(this.currentRound);

    }

    /**
     * Record the match points from the current round, shuffle the players, and set up
     * the matches for the next round. If the current round is 3, switch to the final
     * ranking screen.
     * @param {number} currentRoundNumber - The current round number.
     */
    gotoNextStep(currentRoundNumber) {

        if( currentRoundNumber >0){
            this.saveRoundResults(currentRoundNumber); 
        }
        
        switch (currentRoundNumber) {
            case 0:
                //  Organize players an create round 1
                const slected_Citerion = document.getElementById('selection-criterion-players');
                if(slected_Citerion.value == 'rating-balance'){
                    this.balancePlayersTeams();
                }
                else{
                    this.shufflePlayers();
                }
                this.setupRound(currentRoundNumber+1);
                // Go to Round 1
                switchScreen(1, 2);
                break;
            case 1:
                //  Organize players and create round 2
                const selectElement1 = document.getElementById('selection-criterion-1');
                this.organizePlayers(selectElement1,currentRoundNumber);
                if(selectElement1.value == 'semifinal_final'){
                    const selectElement2 = document.getElementById('selection-criterion-2');
                    selectElement2.style.display = 'none';
                }
                this.setupRound(currentRoundNumber+1);
                // Go to Round 2
                switchScreen(2, 3);
                break;
            case 2:
                //  Organize players and create a new round
                const selectElement = document.getElementById('selection-criterion-1');
                if(selectElement.value == 'semifinal_final'){
                   // Go to score calculation
                   switchScreen(3, 5);
                }
                else
                {
                    // Setup round 3
                    this.setupRound(currentRoundNumber+1);
                    switchScreen(3, 4);
                }
                break;
            case 3:
                switchScreen(4, 5);
                break;
            default:
                throw new Error(`Unknown round number: ${currentRoundNumber}`);
        }
    }


    organizePlayers(select,currentRoundNumber) {
        const roundIndex = currentRoundNumber - 1;

        switch (select.value) {
            case 'semifinal_final':
                //Winners vs Winners and Loosers vs Loosers
                this.player.sort((a, b) => b.matchResult[roundIndex].ratingIncrement - a.matchResult[roundIndex].ratingIncrement);
                console.log(">>>>>Player by mach rating increment: ");
                this.player.forEach(player => console.log(`${player.name} ${player.matchResult[roundIndex].ratingIncrement}`));
                break;
            case 'random':
                // Shuffle players
                this.shufflePlayers();
                break;
            case 'wvsl_cross':
                // Winners vs Losers crossed
                this.player.sort((a, b) => b.matchResult[roundIndex].gamesWon - a.matchResult[roundIndex].gamesWon);
                const roundPlayers = [0, 7, 1, 6, 2, 5, 3, 4].map(index => this.player[index]);
                this.player = roundPlayers;
            default:
                break;
        }
    }

    /**
     * Shuffles the players array using the Fisher-Yates algorithm to randomize the order of players.
     */
    shufflePlayers() {
        //Fisher-Yates algorithm
        for (let i = this.player.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.player[i], this.player[j]] = [this.player[j], this.player[i]];
        }
    }

    /**
     * Balances teams by sorting players based on their ratings and pairing the highest-rated player
     * with the lowest-rated player, the second highest with the second lowest, and so on. It then
     * reorders the player list for the first round matches.
     */
    balancePlayersTeams() {
        this.player.sort((a, b) => b.initialRating - a.initialRating);
        console.log(">>>>Tournament player order by rating: ");
        this.player.forEach(player => console.log(`${player.name} ${player.initialRating}`));
        //The player with the highest rating goes on a team with the player with the lowest rating
        const round1Players = [0, 7, 1, 6, 2, 5, 3, 4].map(index => this.player[index]);
        console.log(">>>>Round1 player ordered for match: ");
        this.player = round1Players;
        this.player.forEach(player => console.log(`${player.name} ${player.initialRating}`));
    }
    
    swap(playerA, playerB) {
        const temp = playerA;
        playerA = playerB;
        playerB = temp;
    }

    setupRound(roundNumber) {
        let teamIndex = (roundNumber-1) * 4;
        for (let i = 0; i < 4; i++) {
            const teamElements = document.getElementById(`team${++teamIndex}-players`)
            teamElements.innerHTML = `${this.player[i * 2].name} <br> ${this.player[i * 2 + 1].name}`;
        }
    }

    saveRoundResults(roundNumber) {
        let teamIndex = (roundNumber-1) * 4;
        let roundIndex = roundNumber -1;
        
        const team= [];
        //Create the teams
        for(let i = 0; i < 4; i++){
            team.push(new Team(this.player[i*2], this.player[i*2+1], parseInt(document.getElementById(`team${++teamIndex}-gamesWon`).value) || 0));
        }

        //Create the matches
        const match = [];
        match.push(new Match());
        match[0].team.push(team[0], team[1]);
        match.push(new Match());
        match[1].team.push(team[2], team[3]);
       
        //Create and add the round to the torunament
        this.round.push(new Round());
        this.round[roundIndex].match.push(match[0], match[1]);

        //Iteration through the 2 matches, calculate the result and update the player results with the rating increment
        for(let i = 0; i < 2; i++){
            
            const result = calculateResult(this.round[roundIndex].match[i].team[0].gamesWon, this.round[roundIndex].match[i].team[1].gamesWon);
            const teamAInitialRating = calculteTeamRating(this.player[i*4+0].initialRating, this.player[i*4+1].initialRating);
            const teamBInitialRating = calculteTeamRating(this.player[i*4+2].initialRating, this.player[i*4+3].initialRating);
            const [teamARatingIncrement, teamBRatingIncrement] = calculateTeamRatingIncrement(teamAInitialRating, teamBInitialRating, result);

            this.player[i*4+0].saveMatchResults(roundIndex,this.round[roundIndex].match[i].team[0].gamesWon, this.round[roundIndex].match[i].team[1].gamesWon,teamARatingIncrement);
            this.player[i*4+1].saveMatchResults(roundIndex,this.round[roundIndex].match[i].team[0].gamesWon, this.round[roundIndex].match[i].team[1].gamesWon,teamARatingIncrement);
            this.player[i*4+2].saveMatchResults(roundIndex,this.round[roundIndex].match[i].team[1].gamesWon, this.round[roundIndex].match[i].team[0].gamesWon,teamBRatingIncrement);
            this.player[i*4+3].saveMatchResults(roundIndex,this.round[roundIndex].match[i].team[1].gamesWon, this.round[roundIndex].match[i].team[0].gamesWon,teamBRatingIncrement);
        }
    }

    calculateTournamentScore() {
        // Calculate tournament final rating increment
        this.player.forEach(player => {
            // Reset all fields just to be sure
            player.tournamentRatingIncrement = 0;
            player.tournamentGamesWon = 0;
            player.tournamentGamesLost = 0;
            player.tournamentMatchesWon = 0;
            player.tournamentMatchesDrawn = 0;
            player.tournamentMatchesLost = 0;
            player.tournamentScore = 0;

             // Update all torunament stuff
            player.matchResult.forEach(matchResult => {
                player.tournamentRatingIncrement += matchResult.ratingIncrement;
                player.tournamentGamesWon += matchResult.gamesWon;
                player.tournamentGamesLost += matchResult.gamesLost;

                if (matchResult.gamesWon > matchResult.gamesLost) {
                    player.tournamentMatchesWon++;
                }
                else if (matchResult.gamesWon < matchResult.gamesLost) {
                    player.tournamentMatchesLost++;
                }
                else if (matchResult.gamesWon === matchResult.gamesLost) {
                    player.tournamentMatchesDrawn++;
                }
            })
        });

        const selectElement1 = document.getElementById('score-calculation-criterion');

        switch(selectElement1.value){
            case 'win-lose-draw':
                this.player.forEach(player => {
                player.tournamentScore = player.tournamentMatchesWon * 3 + player.tournamentMatchesDrawn * 0.5 ;
                });
                break;
            case 'rating-increment':
                this.player.forEach(player => {
                player.tournamentScore = player.tournamentRatingIncrement;
                });
                break;
            case 'total-gamesWon':
                this.player.forEach(player => {
                    player.tournamentScore = player.tournamentGamesWon; 
                });
                break;
            case 'relative-gamesWon':
                this.player.forEach(player => {
                    player.tournamentScore = player.tournamentGamesWon - player.tournamentGamesLost;
                });
                break;  
            default:
                break;
        }   

        // Sort players by score in descending order
        const playersRanking = [...this.player].sort((a, b) => b.tournamentScore - a.tournamentScore);

        // Create tournament ranking
        const rankigTable = document.getElementById('ranking-table');
        const tbody = rankigTable.querySelector('tbody');

        const rankingHTML = playersRanking.map((player, index) => `
            <tr>
                <td>${index + 1}°</td>
                <td>${player.name}</td> 
                <td>${player.tournamentScore.toFixed(2)}</td>
                <td>${player.tournamentRatingIncrement.toFixed(2)}</td>
            </tr>
        `).join('');

        // Insert HTML generated in tbody
        tbody.innerHTML = rankingHTML;

        switchScreen(5, 6);
    }

    recordTournamentResults() {

        const tournamentID = getTournametID();
        
        this.player.forEach(player => {
            const index = registeredPlayers.findIndex(registeredPlayers => registeredPlayers.name === player.name);
            if (index !== -1) {
               registeredPlayers[index].rating += player.tournamentRatingIncrement;
               registeredPlayers[index].totalGamesWon += player.tournamentGamesWon;
               registeredPlayers[index].totalGamesLost += player.tournamentGamesLost;
               registeredPlayers[index].totalMatchesWon += player.tournamentMatchesWon;
               registeredPlayers[index].totalMatchesDrawn += player.tournamentMatchesDrawn;
               registeredPlayers[index].totalMatchesLost += player.tournamentMatchesLost;
               const maxScore = Math.max(...this.player.map(player => player.tournamentScore));
               if(player.score >= maxScore)
               {
                registeredPlayers[index].totalTournamentsWon++
               }
               else 
               {
                registeredPlayers[index].totalTournamentsLost++
               }
               
            } else {
                console.error('Player not found');
            }
            
        });

        if (loggedIn) {
        // Salva i dati in Gdrive
        requestToDoPost(data);
        }
        else{
             // Converte l'oggetto in una stringa JSON
            const jsonData = JSON.stringify(data, null, 2); // Il 2 indica l'indentazione

            this.exportJSON(jsonData);
        }
    }


    exportJSON(jsonData) {
        // Crea un elemento <a> (link) invisibile
        const link = document.createElement('a');
        link.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData));
        link.setAttribute('download', 'registeredPlayers.json'); // Nome del file da scaricare

        // Aggiunge il link al documento (non è necessario che sia visibile)
        document.body.appendChild(link);

        // Simula il click sul link per avviare il download
        link.click();

        // Rimuove il link dal documento
        document.body.removeChild(link);
    }

    restartTournament() {
        switchScreen(6, 1);
        // Reset all fileds
        for (let i = 1; i <= 8; i++) {
            document.getElementById(`player${i}-select`).value = '';
        }
    }
}

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