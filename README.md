# Mini-Tournaments

Mini tournaments for 8 players with ELO rating calculation and statistics.

## Overview

This project facilitates the organization and management of mini-tournaments for up to 8 players. The system includes features for tracking player stats, match results, and tournament standings.

## Features

- Easy setup and management of mini-tournaments
- Automatic calculation of player stats and standings
- User-friendly interface
- Real-time updates

## Warning :warning:

Players must be in the registered list. Currently, there is a JSON file for this. After the tournament is finished, you can download the updated JSON file, but there is no persistent memory at the moment.

## Technologies Used

- JavaScript
- HTML
- CSS

## Instructions

![Home screen](/assets/screenshots/home-screen.png)

- You can view the registered players with their relative rating (calculated with the ELO method).
- You can select the players starting from the first selection and so on.
- You can add a new player for the tournament, but it will be deleted for the next tournament since there is no persistent memory.
- You can reset the selection box in case of error.
- You can choose a method to organize the matches:
  - _Random:_ set up the matches using the Fisher-Yates algorithm to randomize the order of players.
  - _Rating:_ balance criterion: set up matches by pairing the player with the highest rating with the player who has the lowest rating, and so on.

- Finally, start the tournament!

![Round 1](/assets/screenshots/Round1.jpg)

- After **Round 1** is finished, insert the results.
- For the next round, you can select:
  - _Random:_ (like above)
  - _Semi-final and final:_ In this case, there will be just another round. The winning teams will face each other for the first and second place, and the losing teams will face each other for the third and fourth place.
  - _Winners with Losers:_ In this case, the winning players will be separated and will play in the same team with the defeated players.
  - _Fixed rotation:_ In this case, there is a fixed rotation scheme for the players. Same color indicates same team, here is the scheme:
    ![Fixed Rotation](/assets/screenshots/FixedRotation.jpg)

- Select the criterion and go to the next step.

- After **Round 2** is finished, insert the results and go to the next step.

![Score Calculation](/assets/screenshots/ScoreCalculation.jpg)

- You can select the following criteria for the tournament ranking:
  - Rating increment
  - Win-lose-draw: 3 points for a win, 0 for a loss, 1 for a draw
  - Total games won
  - Games won minus games lost

- Select your preferred criterion and click "Calculate score".

This is an example of the final ranking screen:

![Final Ranking](/assets/screenshots/Final_rankig.jpg)
