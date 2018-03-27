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

var game = {
    tickFrames: 6,
    gridWidth: 16,
    gridHeight: 8,
    bounceBeads: [],
    noteGrid: [],
    notes: [],
    noteOptions: ["A", "B", "C", "D", "E", "F", "G"],
    noteSounds: ["piano_a4", "piano_b4", "piano_c4", "piano_d4", "piano_e4", "piano_f4", "piano_g4"],
    
    clearBead: function (x, y) {
        PS.gridPlane(2);
        PS.alpha(x, y, 0);
    },

    drawBead: function (x, y) {
        PS.gridPlane(2);
        PS.alpha(x, y, 255);
        PS.color(x, y, PS.COLOR_BLUE);
    },

    clearNote: function (x, y) {
        PS.gridPlane(1);
        PS.alpha(x, y, 0);
    },

    drawNote: function (x, y) {
        PS.gridPlane(1);
        PS.alpha(x, y, 255);
        PS.color(x, y, PS.COLOR_MAGENTA);
    },

    drawNoteSelect: function (x, y, hovered) {
        if (hovered) {
            PS.gridPlane(1);
            PS.alpha(x, y, 128);
            PS.color(x, y, PS.COLOR_MAGENTA);
        } else {
            if (game.noteGrid[x][y]) {
                game.drawNote(x, y);
            } else {
                game.clearNote(x, y);
            }
        }
    },

    drawColNote: function (x, hovered) {
        PS.gridPlane(0);
        if (hovered) {
            PS.color(x, game.gridHeight, PS.COLOR_BLACK);
            PS.glyphColor(x, game.gridHeight, PS.COLOR_WHITE);
        } else {
            PS.color(x, game.gridHeight, PS.COLOR_WHITE);
            PS.glyphColor(x, game.gridHeight, PS.COLOR_BLACK);
        }
        PS.glyph(x, game.gridHeight, game.noteOptions[game.notes[x]]);
    },

    init: function () {
        PS.gridSize(game.gridWidth, game.gridHeight + 1);

        for (var i = 0; i < game.noteSounds.length; i++) {
            PS.audioLoad(game.noteSounds[i]);
        }

        for (var i = 0; i < game.gridWidth; i++) {
            var isUp = Math.floor((i - 1) / (game.gridHeight - 1)) % 2;
            var vel = isUp ? -1 : 1;

            var rep = game.gridHeight * 2 - 2;
            var pos = i % rep;
            if (pos >= game.gridHeight) {
                pos = rep - pos;
            }

            game.bounceBeads[i] = {
                pos: pos,
                vel: vel
            };

            game.noteGrid[i] = [];
            for (var j = 0; j < game.gridHeight; j++) {
                game.noteGrid[i][j] = false;
            }

            game.notes[i] = i % game.noteOptions.length;
            game.drawColNote(i, false);
            game.drawBead(i, pos);
        }

        PS.timerStart(game.tickFrames, game.tick);
    },
    
    updateBead: function (i) {
        var bead = game.bounceBeads[i];

        game.clearBead(i, bead.pos);

        var nextPos = bead.pos + bead.vel;
        if (nextPos < 0 || nextPos >= game.gridHeight) {
            bead.vel *= -1;
            nextPos = bead.pos + bead.vel;
        }

        bead.pos = nextPos;

        game.drawBead(i, bead.pos);
        if (game.noteGrid[i][bead.pos]) {
            PS.audioPlay(game.noteSounds[game.notes[i]]);
        }
    },

    tick: function () {
        for (var i = 0; i < game.gridWidth; i++) {
            game.updateBead(i);
        }
    },

    touch: function( x, y, data, options ) {
        if (y < game.gridHeight) {
            game.noteGrid[x][y] = !game.noteGrid[x][y];

            if (game.noteGrid[x][y]) {
                game.drawNote(x, y);
            } else {
                game.clearNote(x, y);
            }
        } else {
            game.notes[x] = (game.notes[x] + 1) % game.noteOptions.length;
            game.drawColNote(x, true);
        }
    },

    enter: function (x, y, button, data, options) {
        if (y == game.gridHeight) {
            game.drawColNote(x, true);
        } else {
            game.drawNoteSelect(x, y, true);
        }
    },
    
    exit: function (x, y, button, data, options) {
        if (y == game.gridHeight) {
            game.drawColNote(x, false);
        } else {
            game.drawNoteSelect(x, y, false);
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

/*

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

*/

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
