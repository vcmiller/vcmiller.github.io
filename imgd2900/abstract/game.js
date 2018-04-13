// game.js for Perlenspiel 3.2

// The "use strict" directive in the following line is important. Don't alter or remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't alter or remove them!

/*jslint nomen: true, white: true */
/*global PS */

/*
This is a template for creating new Perlenspiel games.
All event-handling functions are commented out by default.
Uncomment and add code to the event handlers required by your project.
*/

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
[system] = an object containing engine and platform information; see API documentation for details.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.init() event handler:

/* COLOR INFORMATION (RGB values)
    Grid background (Purple): 209, 183, 251
    Grid/Canvas Color (off-white): 255,
 */

class PlayerBead {
    constructor(x, y, mirrored, size) {
        this.x = x;
        this.y = y;
        this.mirrored = mirrored;
        this.size = size;
    }
}

class Splitter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const game = {
    frameNumber: 0,
    players: [],
    width: 8,
    height: 8,
    splitters: [],
    goals: [],

    walls: [
        new Wall(5, 0),
        new Wall(5, 1),
        new Wall(5, 2),
        new Wall(5, 3),
    ],

    tick: function () {
        game.frameNumber++;
        game.render();
    },

    init: function () {
        game.players[0] = new PlayerBead(0, 0, false, 1);
        game.splitters[0] = new Splitter(5, 5);
        game.splitters[1] = new Splitter(1, 3);

        game.goals[0] = new Goal(6, 0);
        game.goals[1] = new Goal(4, 0);

        PS.gridSize(game.width, game.height);
        PS.statusText("Divide");

        PS.audioLoad("split", { path: "audio/"});

        PS.timerStart(1, game.tick);

        game.render();
    },

    drawBG: function () {
        PS.gridShadow(true, PS.COLOR_GRAY_DARK);
        PS.bgColor(PS.ALL, PS.ALL, PS.COLOR_GRAY_LIGHT);
        PS.bgAlpha(PS.ALL, PS.ALL, 255);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.border(PS.ALL, PS.ALL, 0);
        PS.scale(PS.ALL, PS.ALL, 100);
        PS.radius(PS.ALL, PS.ALL, 0);
    },

    drawPlayer: function () {
        for (let i = 0; i < game.players.length; i++) {
            let p = game.players[i];

            PS.alpha(p.x, p.y, 255);
            PS.scale(p.x, p.y, 75 * p.size);
            PS.radius(p.x, p.y, 15);

            let other = false;
            for (let j = 0; j < i; j++) {
                let p2 = game.players[j];
                if (p2.x === p.x && p2.y === p.y && p2.mirrored !== p.mirrored) {
                    other = true;
                    break;
                }
            }

            if (other) {
                let f = game.frameNumber % 60;

                PS.border(p.x, p.y, (30 - (game.frameNumber % 30)) / 2);
                if (f < 30) {
                    PS.color(p.x, p.y, PS.COLOR_WHITE);
                    PS.borderColor(p.x, p.y, PS.COLOR_BLACK);
                } else {
                    PS.color(p.x, p.y, PS.COLOR_BLACK);
                    PS.borderColor(p.x, p.y, PS.COLOR_WHITE);
                }
            } else {
                PS.color(p.x, p.y, p.mirrored ? PS.COLOR_BLACK : PS.COLOR_WHITE);
                PS.border(p.x, p.y, 0);
            }

        }
    },

    drawWalls: function () {
        for (let i = 0; i < game.walls.length; i++) {
            let w = game.walls[i];
            PS.color(w.x, w.y, PS.COLOR_BLACK);
            PS.alpha(w.x, w.y, 255);
        }
    },

    drawGoals: function () {
        for (let i = 0; i < game.goals.length; i++) {
            let g = game.goals[i];
            PS.color(g.x, g.y, PS.COLOR_GRAY_LIGHT);
            PS.borderColor(g.x, g.y, PS.COLOR_BLACK);
            PS.border(g.x, g.y, 5);
            PS.radius(g.x, g.y, 25);
            PS.scale(g.x, g.y, 75);
            PS.alpha(g.x, g.y, 255);
            PS.borderAlpha(g.x, g.y, 255);
        }
    },

    drawSplitters: function () {
        let v = Math.max(30 - (game.frameNumber % 50), 5);
        let b = {
            top: 0,
            bottom: 0,
            left: v,
            right: v,
        };

        for (let i = 0; i < game.splitters.length; i++) {
            let s = game.splitters[i];
            PS.border(s.x, s.y, b);
            PS.scale(s.x, s.y, 50);
            PS.borderColor(s.x, s.y, PS.COLOR_BLACK);
        }
    },
    
    render: function () {
        game.drawBG();
        game.drawWalls();
        game.drawGoals();
        game.drawSplitters();
        game.drawPlayer();
    },

    movePlayer: function (dx, dy) {
        let l = game.players.length;
        let moved = [];

        while (true) {
            let prev = moved.length;
            for (let i = 0; i < l; i++) {
                if (moved.includes(i)) {
                    continue;
                }

                let p = game.players[i];

                let dir = p.mirrored ? -1 : 1;

                let nx = p.x + dx * dir;
                let ny = p.y + dy * dir;

                let wall = false;
                game.walls.forEach(function (w) {
                    if (w.x === nx && w.y === ny) {
                        wall = true;
                    }
                });

                game.players.forEach(function (p2) {
                    if (p2.x === nx && p2.y === ny && p2.mirrored === p.mirrored) {
                        wall = true;
                    }
                });

                if (nx >= 0 && nx < game.width && ny >= 0 && ny < game.height && !wall) {
                    moved.push(i);

                    p.x = nx;
                    p.y = ny;

                    for (let i = 0; i < game.splitters.length; i++) {
                        let s = game.splitters[i];

                        if (s.x === p.x && s.y === p.y) {
                            p.size /= 2;
                            game.players.push(new PlayerBead(p.x, p.y, !p.mirrored, p.size));

                            PS.audioPlay("split", { path: "audio/"});
                            game.splitters.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            if (moved.length === prev) {
                break;
            }
        }

    },

    keyDown: function (key, shift, ctrl, options) {
        switch ( key ) {
            case 119:
            case 87:
            case PS.KEY_ARROW_UP: {
                game.movePlayer( 0, -1 );
                break;
            }

            case 115:
            case 83:
            case PS.KEY_ARROW_DOWN: {
                game.movePlayer( 0, 1 );
                break;
            }

            case 97:
            case 65:
            case PS.KEY_ARROW_LEFT: {
                game.movePlayer( -1, 0 );
                break;
            }

            case 100:
            case 68:
            case PS.KEY_ARROW_RIGHT: {
                game.movePlayer( 1, 0 );
                break;
            }
        }
    }
};

PS.init = game.init;
PS.keyDown = game.keyDown;
