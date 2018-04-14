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

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const colors = {
    yellowOrange: 0xf6921d,
    redOrange: 0xb14623,
    lightPurple: 0x602749,
    darkPurple: 0x3e1c33,
    black: 0x130912,
};

const P = 1;
const G = 2;
const W = 3;
const S = 4;
const J = 5;

const game = {
    frameNumber: 0,
    players: [],
    splitters: [],
    joiners: [],
    curLevel: -1,
    winFrame: -1,
    maxBorder: 0,

    levels: [
        {
            width: 5,
            height: 3,
            layout: [
                [0, 0, 0, 0, 0],
                [0, P, 0, G, 0],
                [0, 0, 0, 0, 0]
            ],
        },
        {
            width: 5,
            height: 5,
            layout: [
                [G, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, S, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, G]
            ],
        },
        {
            width: 5,
            height: 5,
            layout: [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, J, 0, G],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
        },
    ],

    loadLevel: function (index) {
        if (game.curLevel >= 0) {
            let l = game.levels[game.curLevel];

            for (let i = 0; i < game.players.length; i++) {
                let p = game.players[i];

                if (l.layout[p.y][p.x] !== G) {
                    game.players.splice(i, 1);
                    i--;
                }
            }
        }

        game.curLevel = index;
        game.splitters = [];
        game.joiners = [];
        game.winFrame = -1;
        game.frameNumber = 0;

        let l = game.levels[game.curLevel];

        PS.gridSize(l.width, l.height);
        PS.gridColor(colors.black);
        PS.statusColor(colors.yellowOrange);
        PS.fade(PS.ALL, PS.ALL, 0);

        game.maxBorder = PS.border(0, 0, 1000).width;
        PS.border(0, 0, 0);

        for (let x = 0; x < l.width; x++) {
            for (let y = 0; y < l.height; y++) {
                let s = l.layout[y][x];
                if (s === P) {
                    game.players = [ new PlayerBead(x, y, false, 8) ];
                } else if (s === S) {
                    game.splitters.push(new Position(x, y));
                } else if (s === J) {
                    game.joiners.push(new Position(x, y));
                }
            }
        }
    },

    tick: function () {
        game.frameNumber++;

        if (game.winFrame > 0 && game.frameNumber > game.winFrame + 60) {
            game.loadLevel((game.curLevel + 1) % game.levels.length);
        }

        if (game.winFrame < 0) {
            game.render();
        }
    },

    init: function () {
        game.loadLevel(0);


        PS.statusText("Divided");

        PS.audioLoad("split", { path: "audio/"});
        PS.audioLoad("rejoin", { path: "audio/"});

        PS.timerStart(1, game.tick);

        game.render();
    },

    drawLevel: function () {
        PS.gridShadow(true, colors.lightPurple);
        PS.bgColor(PS.ALL, PS.ALL, colors.black);
        PS.bgAlpha(PS.ALL, PS.ALL, 255);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.border(PS.ALL, PS.ALL, 0);
        PS.scale(PS.ALL, PS.ALL, 100);
        PS.radius(PS.ALL, PS.ALL, 0);

        let l = game.levels[game.curLevel];

        for (let x = 0; x < l.width; x++) {
            for (let y = 0; y < l.height; y++) {
                let s = l.layout[y][x];

                if (s === G) {
                    PS.color(x, y, colors.black);
                    PS.borderColor(x, y, colors.yellowOrange);
                    PS.border(x, y, 5);
                    PS.radius(x, y, 25);
                    PS.scale(x, y, 75);
                    PS.alpha(x, y, 255);
                    PS.borderAlpha(x, y, 255);
                } else if (s === W) {
                    PS.color(x, y, colors.darkPurple);
                    PS.alpha(x, y, 255);
                }
            }
        }
    },

    drawPlayer: function () {
        let l = game.levels[game.curLevel];
        for (let i = 0; i < game.players.length; i++) {
            let p = game.players[i];

            PS.alpha(p.x, p.y, 255);
            PS.scale(p.x, p.y, 100);
            PS.borderColor(p.x, p.y, colors.black);

            let other = null;
            for (let j = 0; j < i; j++) {
                let p2 = game.players[j];
                if (p2.x === p.x && p2.y === p.y && p2.mirrored !== p.mirrored) {
                    other = p2;
                    break;
                }
            }

            let dark = colors.lightPurple;
            let light = colors.yellowOrange;

            if (other) {
                if (game.frameNumber % 30 < 15) {
                    PS.color(p.x, p.y, light);
                } else {
                    PS.color(p.x, p.y, dark);
                }

                let size = (p.size + other.size) / 16;
                PS.border(p.x, p.y, game.maxBorder * (1 - size));
                PS.radius(p.x, p.y, 25 * size);
            } else {
                PS.color(p.x, p.y, p.mirrored ? dark : light);
                PS.border(p.x, p.y, game.maxBorder * (1 - p.size / 8));
                PS.radius(p.x, p.y, 25 * p.size / 8);
            }

            if (game.winFrame > 0 && l.layout[p.y][p.x] !== G) {
                PS.fade(p.x, p.y, 30);
                PS.color(p.x, p.y, colors.black);
            }
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
            PS.borderColor(s.x, s.y, colors.yellowOrange);
        }
    },

    drawJoiners: function () {
        let v = Math.max((game.frameNumber % 50), 5);
        let b = {
            top: 0,
            bottom: 0,
            left: v,
            right: v,
        };

        for (let i = 0; i < game.joiners.length; i++) {
            let s = game.joiners[i];
            PS.border(s.x, s.y, b);
            PS.scale(s.x, s.y, 50);
            PS.borderColor(s.x, s.y, colors.lightPurple);
        }
    },
    
    render: function () {
        game.drawLevel();
        game.drawSplitters();
        game.drawJoiners();
        game.drawPlayer();
    },

    movePlayer: function (dx, dy) {
        if (game.winFrame > 0) {
            return;
        }

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

                let level = game.levels[game.curLevel];

                let wall = false;

                game.players.forEach(function (p2) {
                    if (p2.x === nx && p2.y === ny && p2.mirrored === p.mirrored) {
                        wall = true;
                    }
                });

                if (nx >= 0 && nx < level.width && ny >= 0 && ny < level.height && !wall && level.layout[ny][nx] !== W) {
                    moved.push(i);

                    p.x = nx;
                    p.y = ny;
                }
            }

            if (moved.length === prev) {
                break;
            }
        }

        for (let i = 0; i < game.splitters.length; i++) {
            let s = game.splitters[i];

            let p = null;

            game.players.forEach(function (pl) {
                if (pl.x === s.x && pl.y === s.y && pl.size > 1) {
                    p = pl;
                }
            });

            if (p !== null) {
                p.size = Math.round(p.size / 2);
                game.players.push(new PlayerBead(p.x, p.y, !p.mirrored, p.size));

                PS.audioPlay("split", { path: "audio/"});
                game.splitters.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < game.joiners.length; i++) {
            let j = game.joiners[i];

            let p1 = -1;
            let p2 = -1;

            for (let pi = 0; pi < game.players.length; pi++) {
                let p = game.players[pi];
                if (p.x === j.x && p.y === j.y) {
                    if (!p.mirrored) {
                        p1 = pi;
                    } else {
                        p2 = pi;
                    }
                }
            }

            if (p1 >= 0 && p2 >= 0) {
                let p1obj = game.players[p1];
                let p2obj = game.players[p2];
                PS.audioPlay("rejoin", { path: "audio/"});

                p1obj.size += p2obj.size;
                game.players.splice(p2, 1);
                game.joiners.splice(j, 1);
                i--;
            }
        }

        if (game.winFrame === -1 && game.hasWon()) {
            game.winFrame = game.frameNumber;

            game.render();
        }
    },

    hasWon: function () {
        let level = game.levels[game.curLevel];
        let numGoals = 0;
        for (let x = 0; x < level.width; x++) {
            for (let y = 0; y < level.height; y++) {
                if (level.layout[y][x] === G) {
                    numGoals++;

                    let found = false;
                    game.players.forEach(function (p) {
                        if (p.x === x && p.y === y) {
                            found = true;
                        }
                    });

                    if (!found) {
                        return false;
                    }
                }
            }
        }

        return true;
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
