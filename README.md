# Mini-Tournaments

Mini tournaments for 8 players with stats.

## Overview

This project facilitates the organization and management of mini-tournaments for up to 8 players.
The system includes features for tracking player stats, match results, and tournament standings.

## Features

-Easy setup and management of mini-tournaments
-Automatic calculation of player stats and standings
-User-friendly interface
-Real-time updates

## Warning :warning:

The players must be in the registered list. Currently, there is a JSON file for that.
After the tournament is finished, you can download the updated JSON file,
but there is no persistent storage at the moment.

## Technologies Used

-JavaScript
-HTML
-CSS

## Instructions

![Home screen](/assets/screenshots/home-screen.png)

-You can view the registered players with the relative rating (calculated with the ELO method)
-You can select the players starting from the first select and so on
-You can add a new one for the tournament, there is no memory so it'll be deleted for the next tournament
-You can reset the select box in case of error
-You can choose a method to organize the matches
    -_Random:_ set up the matches using Fisher-Yates algorithm to randomize the order of players
    -_Rating:_ balance criterion: Set up matches putting the player with the highest rating with the player who has the lowest rating and so on.
-Finally start the tournament!!!

![Round1](/assets/screenshots/Round1.jpg)

-After the **round 1** is finished insert the results
-For the next round you can select:
    -_Random:_ (like above)
    -_Semi-final and final:_ In this case there will be just another round.
        The winning teams will face each other for the first and second place
        The losing teams will face each other for the third and the fourth place
    -_Winners with Losers:_ in this case the winning players will be separated
        and will play in the same team with the defeated players.
    -_Fixed rotation:_ in this case there is a fixed rotation scheme for the players. This is the scheme:
    ![here](/assets/screenshots/FixedRotation.jpg)

-Select the criterion and go to next step

- After the **round 2** is finished insert the results and go to next step

![Score Calculation](/assets/screenshots/ScoreCalculation.jpg)

- You can select the following criteria for the tournament ranking:
  - Rating increment
    - Win lose draw: this is 3 for winning, 0 losing, 1 draw
    - Total games won
    - Games won minus games lose
- Select your favorite criterion and click "Calculate score"

This is an example of the final ranking screen:

![Final Ranking](/assets/screenshots/Final_rankig.jpg)
