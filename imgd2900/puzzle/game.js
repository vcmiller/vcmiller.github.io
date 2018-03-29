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
class PosColor {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
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

    brush: null,
    paintGrid: [],

    levels: [
        {
            width: 4,
            height: 4,
            sources: [
                new PosColor(2, 2, PS.COLOR_BLUE)
            ],
            pattern: [
                [-1, -1, -1, -1],
                [-1,  0,  0, -1],
                [-1,  0,  0, -1],
                [-1, -1, -1, -1]
            ],
            brush: new PosColor(0, 0, null)
        },
        {
            width: 6,
            height: 4,
            sources: [
                new PosColor(1, 1, PS.COLOR_RED),
                new PosColor(4, 2, PS.COLOR_BLUE)
            ],
            pattern: [
                [-1, -1, -1, -1, -1, -1],
                [-1,  0,  0,  0,  0, -1],
                [-1,  1,  1,  1,  1, -1],
                [-1, -1, -1, -1, -1, -1]
            ],
            brush: new PosColor(0, 0, null)
        },
        {
            width: 4,
            height: 4,
            sources: [
                new PosColor(0, 2, PS.COLOR_RED),
                new PosColor(0, 1, PS.COLOR_BLUE)
            ],
            pattern: [
                [-1,  1,  0, -1],
                [ 1,  1,  0, -1],
                [ 0,  1,  0, -1],
                [-1,  1,  0, -1]
            ],
            brush: new PosColor(0, 0, null)
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
        
        game.brush = new PosColor(level.brush.x, level.brush.y, level.brush.color);
        game.frameNumber = 0;

        for (let i = 0; i < level.sources.length; i++) {
            game.paintGrid[level.sources[i].x][level.sources[i].y] = level.sources[i].color;
        }

        game.moves = 0;
        game.winFrame = -1;

        PS.statusText("Moves: 0");
    },

    paint: function(x, y, color) {
        game.paintGrid[x][y] = color;
    },

    drawBrush: function () {
        let b = game.brush;

        PS.alpha(b.x, b.y, 255);
        PS.color(b.x, b.y, 255, 255, 255);
        PS.radius(b.x, b.y, 0);
        PS.scale(b.x, b.y, 100);
        if (b.color !== null && game.paintAmount > 0) {
            PS.border(b.x, b.y, game.paintAmount * 3);
            PS.borderColor(b.x, b.y, b.color);
        } else {
            PS.border(b.x, b.y, 0);
        }
    },

    drawBG: function () {
        PS.bgColor(PS.ALL, PS.ALL, 75, 75, 75);
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
            PS.borderColor(src.x, src.y, PS.COLOR_WHITE);
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
            }
        }
    },

    drawPattern: function() {
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
        if (dx === 0 && dy === 0) {
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
                PS.statusText("Moves: " + game.moves);
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
            case PS.KEY_TAB: {
                game.frameNumber = 60;
                break;
            }
        }
    }
};

PS.init = game.init;
/*
PS.touch ( x, y, data, options )
Called when the mouse button is clicked on a bead, or when a bead is touched.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.touch() event handler:

PS.touch = game.touch;

/*
PS.release ( x, y, data, options )
Called when the mouse button is released over a bead, or when a touch is lifted off a bead
It doesn't have to do anything
[x] = zero-based x-position of the bead on the grid
[y] = zero-based y-position of the bead on the grid
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.release() event handler:

/*

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

*/

/*
PS.enter ( x, y, button, data, options )
Called when the mouse/touch enters a bead.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.enter() event handler:



PS.enter = game.enter;



/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits a bead.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value associated with this bead, 0 if none has been set.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.exit() event handler:

PS.exit = game.exit;

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
It doesn't have to do anything.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
It doesn't have to do anything.
[key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
http://users.wpi.edu/~bmoriarty/ps/constants.html
[shift] = true if shift key is held down, else false.
[ctrl] = true if control key is held down, else false.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.keyDown() event handler:



PS.keyDown = game.keyDown;



/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
It doesn't have to do anything.
[key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
http://users.wpi.edu/~bmoriarty/ps/constants.html
[shift] = true if shift key is held down, else false.
[ctrl] = true if control key is held down, else false.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when an input device event (other than mouse/touch/keyboard) is detected.
It doesn't have to do anything.
[sensors] = an object with sensor information; see API documentation for details.
[options] = an object with optional parameters; see API documentation for details.
NOTE: Mouse wheel events occur ONLY when the cursor is positioned over the grid.
*/

// Uncomment the following BLOCK to expose PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
It doesn't have to do anything.
[options] = an object with optional parameters; see API documentation for details.
NOTE: This event is only used for applications utilizing server communication.
*/

// Uncomment the following BLOCK to expose PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "Daisy, Daisy ...\n" );

	// Add code here for when Perlenspiel is about to close.
};

*/

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
*/
