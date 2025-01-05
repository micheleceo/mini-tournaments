
class Tournament {
    constructor() {
        this.tournamentID = '';
        this.player = [];
        this.currentRound = 0;
        this.team=[];
        this.round=[];
    }

    startTournament(registeredPlayers) {
       
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
    
    //TODO: forse da cancellare
    /*swap(playerA, playerB) {
        const temp = playerA;
        playerA = playerB;
        playerB = temp;
    }*/

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

    recordTournamentResults(registeredPlayers)  {

        this.tournamentID = this.getTournamentID();
        
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

    }

    getTournamentID() {
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


 

    restartTournament() {
        switchScreen(6, 1);
        // Reset all fileds
        for (let i = 1; i <= 8; i++) {
            document.getElementById(`player${i}-select`).value = '';
        }
    }
}

export default Tournament;
import Player from './Player.js';
import Team from './Team.js';
import Match from './Match.js';
import Round from './Round.js';
import { calculateResult, calculteTeamRating, calculateTeamRatingIncrement } from './utils.js';