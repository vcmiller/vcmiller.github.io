//Leo Bunyea
//Team Android Galaxy Buccaneers
//Mod 1: Changed grid size to 4 x 4
//Mod 2: Changed the status message to a new joke every time a bead is touched
//Mod 3: Changed to sound effect to fx_blip in the audio library
//Mod 4: Changed the grid background color to light orange
//Mod 5: Changed color of grid based on location
//Mod 6: Added glyphs to specific beads
//Mod 7: Added hover effect to beads with light gray color
//Mod 8: Removed borders
//Mod 9: Added glyphs to specific beads
//Functionality Change: Beads no longer toggle between colors, an image is being uncovered by clicking

// game.js for Perlenspiel 3.2

var G; //Establish global namespace
(function() {
	//Private variables and functions
	var jokeQueue = [	//Populating the list of jokes to appear after beads hve been touched, there are 16 lines total
		"What's orange and sounds like a parrot?",
		"A carrot.",
		"This is my step ladder.",
		"I never knew my real ladder.",
		"I went bobsleighing the other day.",
		"I killed 250 bobs.",
		"I have the heart of a lion...",
		"And a lifetime ban from the Toronto Zoo.",
		"How did the hipster burn his mouth?",
		"He ate the pizza before it was cool.",
		"What's ET short for? He's only got little legs.",
		"Why aren't koalas actual bears?",
		"They don't meet the koalafications.",
		"A blind man walks into a bar.",
		"And a table. And a chair.",
        "You survived! Here's a smile."];	//DISCLAIMER: None of these jokes are original, I got them from tickld.com
    G = {
        //returnJoke()
        //Returns the next joke in the queue and also dequeues it
        //If the queue is empty, returns another message
        returnJoke : function() {
        	//Check to see if the queue is empty
        	if (jokeQueue.length == 0) {
        		return "Thanks for putting up with that."
			} else {	//If not, print the next joke in the queue
                return jokeQueue.shift();
            }
        }
    };
} () );

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

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// This is a template for creating new Perlenspiel games

// All of the functions below MUST exist, or the engine will complain!

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.init = function( system, options ) {
	"use strict";

	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( 4, 4 );

	PS.border(PS.ALL, PS.ALL, 0);
	
	PS.gridColor( 255, 204, 153 ); // RGB value of light orange
    PS.glyphColor(PS.ALL, PS.ALL, PS.COLOR_WHITE); //Set glyph color to white

	//Status message
	PS.statusColor( PS.COLOR_BLACK );
	PS.statusText( "Hey, let me tell you a horrible joke!" );

	PS.audioLoad( "fx_blip", { lock: true } ); // load & lock blip sound

	// Add any other initialization code you need here
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.touch = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	//PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	//Change the color of a bead to either black or yellow, depending on th location
	//This produces the image of a smiley face
	//After the color is set, data is updated to a color that is NOT black
	//This is for the check when the bead is entered and exited.
	if (x == 0 && y == 0) {	//Left eye
        PS.color(x, y, PS.COLOR_BLACK);
        PS.glyph(x, y, "o");
        PS.data(x, y, PS.COLOR_WHITE);
    } else if (x == 3 && y == 0) {	//Right eye
        PS.color(x, y, PS.COLOR_BLACK);
        PS.glyph(x, y, "o");
        PS.data(x, y, PS.COLOR_WHITE);
    } else if (x == 0 && y == 2) {	//Smile
        PS.color(x, y, PS.COLOR_BLACK);
        PS.data(x, y, PS.COLOR_WHITE);
    } else if (x == 3 && y == 2) {	//Smile
        PS.color(x, y, PS.COLOR_BLACK);
        PS.data(x, y, PS.COLOR_WHITE);
    } else if (x == 1 && y == 3) {	//Smile
        PS.color(x, y, PS.COLOR_BLACK);
        PS.data(x, y, PS.COLOR_WHITE);
    } else if (x == 2 && y == 3) {	//Smile
        PS.color(x, y, PS.COLOR_BLACK);
        PS.data(x, y, PS.COLOR_WHITE);
	} else {	//yellow face
        PS.color(x , y, 255, 255, 153);
        PS.data(x, y, PS.COLOR_WHITE);
	}

	//Print the next joke in the queue to the status line
	//ONLY if the bead has not yet been touched
	if (data === PS.COLOR_BLACK) {
        PS.statusText(G.returnJoke());
    }

	// Play blip sound
    //ONLY if the bead has not yet been touched
	if (data === PS.COLOR_BLACK) {
        PS.audioPlay("fx_blip");
    }

	// Add code here for mouse clicks/touches over a bead
};

// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.enter = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead

	//Check to see if the bead has not yet been touched
    if ( data === PS.COLOR_BLACK ) {
    	PS.color(x, y, 242, 242, 242);	//Change bead color to highlight / hover
    }
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.exit = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead

	//Check to see if the bead has not yet been touched
    if ( data === PS.COLOR_BLACK ) {
        PS.color(x, y, PS.COLOR_WHITE);	//reset bead color to white (default)
    }
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function( options ) {
	"use strict";

	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the following constants:
// Arrow keys = PS.ARROW_UP, PS.ARROW_DOWN, PS.ARROW_LEFT, PS.ARROW_RIGHT
// Function keys = PS.F1 through PS.F1
// [shift] = true if shift key is held down, else false
// [ctrl] = true if control key is held down, else false
// [options] = an object with optional parameters; see documentation for details

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the following constants:
// Arrow keys = PS.ARROW_UP, PS.ARROW_DOWN, PS.ARROW_LEFT, PS.ARROW_RIGHT
// Function keys = PS.F1 through PS.F12
// [shift] = true if shift key is held down, false otherwise
// [ctrl] = true if control key is held down, false otherwise
// [options] = an object with optional parameters; see documentation for details

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};

// PS.swipe ( data, options )
// Called when a mouse/finger swipe across the grid is detected
// It doesn't have to do anything
// [data] = an object with swipe information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.swipe = function( data, options ) {
	"use strict";

	// Uncomment the following block to inspect parameters

	/*
	 var len, i, ev;
	 PS.debugClear();
	 PS.debug( "PS.swipe(): start = " + data.start + ", end = " + data.end + ", dur = " + data.duration + "\n" );
	 len = data.events.length;
	 for ( i = 0; i < len; i += 1 ) {
	 ev = data.events[ i ];
	 PS.debug( i + ": [x = " + ev.x + ", y = " + ev.y + ", start = " + ev.start + ", end = " + ev.end +
	 ", dur = " + ev.duration + "]\n");
	 }
	 */

	// Add code here for when an input event is detected
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
// It doesn't have to do anything
// [sensors] = an object with sensor information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.input = function( sensors, options ) {
	"use strict";

	// Uncomment the following block to inspect parameters
	/*
	PS.debug( "PS.input() called\n" );
	var device = sensors.wheel; // check for scroll wheel
	if ( device )
	{
		PS.debug( "sensors.wheel = " + device + "\n" );
	}
	*/
	
	// Add code here for when an input event is detected
};

