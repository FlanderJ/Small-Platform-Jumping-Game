# Small-Platform-Jumping-Game
A small platform jumping game written in JavaScript, with Phaser library.

Game Project

A platform jumping game with 3 different levels was created. Each level's goal is to reach the “goal” flag by jumping on platforms and collecting two types of stars, normal and sparkly, which provide respectively 1 and 2 points when collected and avoiding collecting skulls. Both stars and skulls are falling from the “sky”. The player can shoot these falling objects by pressing the “spacebar”, these bullets will destroy themselves and the object it hits (stars or skulls) when they collide. The character can be moved by using the keyboard button “a” to move left and “d” to move right.
At the start of each level, the player has 3 health, and when the player is “hit” by a skull it will decrease their health value by 1 unit. If the health of the player goes to zero, the level is restarted, and health is set to 3 again (points gathered in this level will be gone, but if this happens in level 2 or 3 the points from earlier levels won’t be lost). After the goal of the last (third) level is reached the game asks for the name of the player, and when the player inputs their name and clicks “Ok” the score is saved into “Local Storage” and the best 5 of performances are displayed in a form of a table, with the names of the player and their scores displayed in that table.
As the player progresses to the next level the difficulty of the game slightly increases on each level. The first level is quite straightforward jumping. The second level has more inconsistent jumping platforms and on the third level, the jumping platforms are moving constantly from left to right and right to left until the edge of the screen is reached. In addition, in the third level, the starting positions of moving platforms in the vertical dimension are generated randomly.
There is also background music running constantly when playing the game, and action sounds are added when doing the most essential actions in the game, such as jumping, shooting, taking damage and dying.

Tools used

The game was built using the basic properties of JavaScript and the properties provided by Phaser. The sound effects of the game and background music were downloaded from freesound.org. The graphical objects were created using “Dall-E 2”. All functionalities are included in the same JavaScript file called “basic.js”. The HTML file includes just the minimum required to make the game work properly. There are definitions for the player input field, which has a display property set to “gone” at the beginning and the scoreboard table, which is also set to invisible at the beginning. CSS file is empty since it was not much use in simple game implementation. Some basic CSS style properties are set in the HTML file for the scoreboard to be in the right place (center of the screen). The scoreboard table is filled dynamically in the JavaScript file.


NOTE! The game is not optimized in any way, it's just a small project to learn the basics of creating games!
