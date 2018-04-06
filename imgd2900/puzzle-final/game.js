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


class PosColor {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

var colors = {
    purple: [209, 183, 251],
    white: [255, 251, 203],
    yellow: [255, 232, 105],
    pink: [237, 84, 133],
    blue: [87, 209, 201],
    brown: [179, 155, 121],
    green: [137, 225, 137]
}

const game = {
    width: 0,
    height: 0,
    paintAmount: 0,
    paintMax: 4,
    pattern: null,

    frameNumber: 0,
    drawPatternFrames: 120,
    winFrame: -1,
    curLevel: -1,
    moves: 0,
    maxMoves: Number.POSITIVE_INFINITY,

    brush: null,
    paintGrid: [],

    levels: [
        {
            width: 3,
            height: 3,
            sources: [
                new PosColor(2, 2, colors.blue)
            ],
            pattern: [
                [0,  0,  0],
                [0,  0,  0],
                [0,  0,  0]
            ],
            brush: new PosColor(1, 1, null),
            moves: 20
        },
        {
            width: 4,
            height: 4,
            sources: [
                new PosColor(0, 3, colors.yellow),
                new PosColor(3, 0, colors.yellow)
            ],
            pattern: [
                [0,  0,  0,  0],
                [0,  0,  0,  0],
                [0,  0,  0,  0],
                [0,  0,  0,  0],
            ],
            brush: new PosColor(1, 1, null),
            moves: 26
        },
        {
            width: 3,
            height: 3,
            sources: [
                new PosColor(0, 1, colors.green),
                new PosColor(2, 1, colors.pink)
            ],
            pattern: [
                [0,  0,  1],
                [0,  1,  1],
                [0,  1,  1]
            ],
            brush: new PosColor(1, 1, null),
            moves: 14
        },
        {
            width: 4,
            height: 2,
            sources: [
                new PosColor(0, 0, colors.pink),
                new PosColor(3, 1, colors.blue)
            ],
            pattern: [
                [0,  0,  0,  0],
                [1,  1,  1,  1],
            ],
            brush: new PosColor(3, 0, null),
            moves: 9
        },
        {
            width: 3,
            height: 2,
            sources: [
                new PosColor(0, 0, colors.yellow),
                new PosColor(1, 0, colors.blue)
            ],
            pattern: [
                [0,  1,  0],
                [0,  1,  0],
            ],
            brush: new PosColor(1, 1, null),
            moves: 9
        },
        {
            width: 3,
            height: 3,
            sources: [
                new PosColor(1, 2, colors.blue),
                new PosColor(2, 1, colors.green),
                new PosColor(1, 0, colors.blue),
            ],
            pattern: [
                [ 1,  0,  0],
                [ 1,  1,  1],
                [ 1,  0,  0]
            ],
            brush: new PosColor(1, 1, null),
            moves: 12
        },
        {
            width: 3,
            height: 4,
            sources: [
                new PosColor(0, 2, colors.pink),
                new PosColor(0, 1, colors.blue)
            ],
            pattern: [
                [ 0,  1,  0],
                [ 1,  1,  0],
                [ 0,  1,  0],
                [ 1,  1,  0]
            ],
            brush: new PosColor(0, 0, null),
            moves: 32
        },
        {
            width: 3,
            height: 3,
            sources: [
                new PosColor(0, 0, colors.pink),
                new PosColor(1, 1, colors.green),
                new PosColor(1, 2, colors.blue)
            ],
            pattern: [
                [0,  1,  1],
                [2,  1,  1],
                [2,  2,  0]
            ],
            brush: new PosColor(1, 0, null),
            moves: 14
        },
        {
            width: 4,
            height: 4,
            sources: [
                new PosColor(1, 3, colors.green),
                new PosColor(2, 2, colors.blue),
                new PosColor(2, 0, colors.yellow)
            ],
            pattern: [
                [ 2, 2, 2, 1],
                [ 1, 1, 1, 1],
                [ 1, 0, 1, 0],
                [ 0, 0, 0, 0],
            ],
            brush: new PosColor(0, 0, null),
            moves: 25
        },
        {
            width: 5,
            height: 4,
            sources: [
                new PosColor(1, 1, colors.pink),
                new PosColor(0, 3, colors.blue),
                new PosColor(4, 0, colors.blue),
                new PosColor(2, 2, colors.blue)
            ],
            pattern: [
                [ 1, 1, 1, 0, 1],
                [ 1, 0, 1, 0, 1],
                [ 1, 0, 1, 0, 1],
                [ 1, 0, 1, 1, 1]
            ],
            brush: new PosColor(0, 0, null),
            moves: 31
        },
        {
            width: 5,
            height: 5,
            sources: [
                new PosColor(2, 2, colors.green),
                new PosColor(2, 0, colors.pink),
                new PosColor(2, 4, colors.pink)
            ],
            pattern: [
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0]
            ],
            brush: new PosColor(0, 0, null),
            moves: 90
        },
        {
            width: 5,
            height: 6,
            sources: [
                new PosColor(3, 2, colors.yellow),
                new PosColor(2, 5, colors.pink),
                new PosColor(2, 2, colors.blue),
                new PosColor(1, 2, colors.yellow),
            ],
            pattern: [
                [2, 0, 0, 0, 2],
                [2, 2, 2, 2, 2],
                [2, 0, 2, 0, 2],
                [2, 2, 2, 2, 2],
                [0, 2, 1, 2, 0],
                [0, 0, 1, 0, 0]
            ],
            brush: new PosColor(0, 0, null),
            moves: 78
        },
        {
            width: 4,
            height: 4,
            sources: [
                new PosColor(2, 2, colors.pink),
                new PosColor(1, 3, colors.green),
                new PosColor(2, 1, colors.blue),
                new PosColor(3, 0, colors.yellow)
            ],
            pattern: [
                [3,  1,  1,  3],
                [0,  2,  2,  0],
                [0,  0,  0,  0],
                [0,  1,  1,  2]
            ],
            brush: new PosColor(0, 0, null),
            moves: 36
        }
    ],

    sources: null,

    loadLevel: function(level) {
        game.curLevel = level;
        level = game.levels[level];

        game.width = level.width;
        game.height = level.height;
        game.clearPaintGrid();
        game.sources = level.sources;
        game.pattern = level.pattern;
        game.paintAmount = 0;
        
        game.brush = new PosColor(level.brush.x, level.brush.y, level.brush.color);
        game.frameNumber = 0;

        for (let i = 0; i < level.sources.length; i++) {
            game.paintGrid[level.sources[i].x][level.sources[i].y] = level.sources[i].color;
        }

        game.moves = 0;
        game.winFrame = -1;
        game.maxMoves = level.moves;

        PS.statusColor(colors.white);
        PS.statusText("(Level " + (game.curLevel + 1) + " / " + game.levels.length + ") Moves Left: " + game.maxMoves);
    },

    paint: function(x, y, color) {
        game.paintGrid[x][y] = color;
    },

    drawBrush: function () {
        let b = game.brush;

        PS.alpha(b.x, b.y, 255);
        PS.color(b.x, b.y, colors.brown);
        PS.radius(b.x, b.y, 0);
        PS.scale(b.x, b.y, 100);

        if (game.paintAmount > 0) {
            PS.glyph(b.x, b.y, game.paintAmount  + "");
        } else {
            PS.glyph(b.x, b.y, "");
        }

        let c = game.paintGrid[b.x][b.y];
        if (c !== null) {
            PS.glyphColor(b.x, b.y, c);
        } else {
            PS.glyphColor(b.x, b.y, PS.COLOR_WHITE);
        }

        if (b.color !== null && game.paintAmount > 0) {
            PS.border(b.x, b.y, game.paintAmount * 6);
            PS.borderColor(b.x, b.y, b.color);
        } else {
            PS.border(b.x, b.y, 0);
        }
    },

    drawBG: function () {
        PS.bgColor(PS.ALL, PS.ALL, colors.white);
        PS.bgAlpha(PS.ALL, PS.ALL, 255);
        PS.alpha(PS.ALL, PS.ALL, 0);
        PS.border(PS.ALL, PS.ALL, 0);
    },

    drawSources: function () {
        for (var i = 0; i < game.sources.length; i++) {
            let src = game.sources[i];

            PS.alpha(src.x, src.y, 255);
            PS.color(src.x, src.y, src.color);
            PS.bgColor(src.x, src.y, src.color);
            PS.border(src.x, src.y, 10);
            PS.radius(src.x, src.y, 25);
            PS.scale(src.x, src.y, 75 + 15 * Math.sin(game.frameNumber / 5));
            PS.borderColor(src.x, src.y, colors.brown);
            PS.gridColor(colors.purple);
        }
    },

    drawPaint: function () {
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                let c = game.paintGrid[x][y];
                if (c !== null) {
                    PS.color(x, y, c);
                    PS.alpha(x, y, 255);
                }

                if (game.pattern[y][x] >= 0) {
                    PS.glyph(x, y, "~");
                    PS.glyphColor(x, y, game.sources[game.pattern[y][x]].color);
                }
            }
        }
    },

    drawPattern: function() {
        PS.gridColor(colors.purple);
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                let c = game.pattern[y][x];
                if (c >= 0) {
                    c = game.sources[c].color;
                    PS.scale(x, y, 75);
                    PS.radius(x, y, 50);
                    PS.color(x, y, c);
                    if (game.frameNumber < game.drawPatternFrames - 50) {
                        PS.alpha(x, y, 255);
                    } else {
                        PS.alpha(x, y, (game.drawPatternFrames - game.frameNumber) * 5);
                    }
                }
            }
        }
    },

    checkPattern: function() {
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                let c = game.pattern[y][x];
                if (c >= 0) {
                    c = game.sources[c].color;
                } else {
                    c = null;
                }

                if (game.paintGrid[x][y] !== c) {
                    return false;
                }
            }
        }

        return true;
    },

    moveBrush: function (dx, dy) {
        if ((dx === 0 && dy === 0) || game.winFrame > 0) {
            return;
        }

        if (game.moves >= game.maxMoves) {
            PS.audioPlay("fx_hoot");
            return;
        }

        let b = game.brush;

        let nx = b.x + dx;
        let ny = b.y + dy;

        if (nx >= 0 && nx < game.width && ny >= 0 && ny < game.height) {
            b.x = nx;
            b.y = ny;

            var onSrc = false;

            for (var i = 0; i < game.sources.length; i++) {
                let src = game.sources[i];

                if (src.x === b.x && src.y === b.y) {
                    b.color = src.color;
                    game.paintAmount = game.paintMax;
                    onSrc = true;
                    PS.audioPlay("fx_drip2");
                    break;
                }
            }

            var painted = false;
            if (game.paintAmount > 0 && b.color !== null && !onSrc) {
                game.paint(b.x, b.y, b.color);
                PS.audioPlay("fx_drip1");
                painted = true;
            }

            if (painted) {
                game.paintAmount--;
            }

            game.moves++;

            if(game.checkPattern()) {
                if (game.winFrame < 0) {
                    PS.statusText("You win! (moves: " + game.moves + ")");
                    game.winFrame = game.frameNumber;
                    PS.audioPlay("fx_tada");
                }
            } else {
                if (game.moves < game.maxMoves) {
                    PS.statusText("(Level " + (game.curLevel + 1) + " / " + game.levels.length + ") Moves Left: " + (game.maxMoves - game.moves));
                } else {
                    PS.statusText("Out of moves! Press ESC to restart.");
                }
            }
        }
    },

    tick: function () {
        game.frameNumber++;

        if (game.winFrame >= 0 && game.frameNumber > game.winFrame + 60) {
            game.loadLevel((game.curLevel + 1) % game.levels.length);
        }

        game.render();
    },

    clearPaintGrid: function() {
        game.paintGrid = [];
        for (var i = 0; i < game.width; i++) {
            game.paintGrid[i] = [];

            for (var j = 0; j < game.height; j++) {
                game.paintGrid[i][j] = null;
            }
        }
    },

    init: function () {
        game.loadLevel(0);
        PS.audioLoad("fx_drip1");
        PS.audioLoad("fx_drip2");
        PS.audioLoad("fx_tada");
        PS.audioLoad("fx_hoot");

        PS.timerStart(1, game.tick);

        game.render();
    },
    
    render: function () {
        PS.gridSize(game.width, game.height);
        game.drawBG();
        if (game.frameNumber < game.drawPatternFrames) {
            game.drawPattern();
        } else {
            game.drawSources();
            game.drawPaint();
            game.drawBrush();
        }
    },

    keyDown: function (key, shift, ctrl, options) {
        switch ( key ) {
            case PS.KEY_ARROW_UP: {
                game.moveBrush( 0, -1 );
                break;
            }
            case PS.KEY_ARROW_DOWN: {
                game.moveBrush( 0, 1 );
                break;
            }
            case PS.KEY_ARROW_LEFT: {
                game.moveBrush( -1, 0 );
                break;
            }
            case PS.KEY_ARROW_RIGHT: {
                game.moveBrush( 1, 0 );
                break;
            }
            case PS.KEY_ESCAPE: {
                game.loadLevel(game.curLevel);
                break;
            }
            case PS.KEY_DELETE: {
                game.loadLevel((game.curLevel + 1) % game.levels.length);
                break;
            }
        }
    }
};

PS.init = game.init;
PS.keyDown = game.keyDown;
