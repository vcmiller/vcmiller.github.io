// Vincent Miller
// Android Galaxy Buccaneers
// Mod 1: Changed click color from black to blue
// Mod 2: Changed outline on click to light blue, and larger
// Mod 3: Changed square beads to rounded rectangles (radius 20), and scale to 75
// Mod 4: Clicking draws a line from the previous click point
// Mod 5: The left and right arrow keys change the size of the grid (and reset)
// Mod 6: Added a fade effect when clicking beads
// Mod 7: Changed click sound to an electronic beep

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

var lastX = -1, lastY = -1;
var grid = 8;

function updateGrid() {
    PS.gridSize( grid, grid );
    PS.gridColor( 0x303030 ); // Perlenspiel gray
    PS.statusColor( PS.COLOR_WHITE );
    PS.statusText( "Touch any bead" );

    PS.fade(PS.ALL, PS.ALL, PS.DEFAULT);
    PS.borderFade(PS.ALL, PS.ALL, PS.DEFAULT);

    //PS.color(PS.ALL, PS.ALL, 100, 100, 100);
    PS.borderColor(PS.ALL, PS.ALL, 25, 25, 25);
    PS.alpha(PS.ALL, PS.ALL, 0);
    PS.scale(PS.ALL, PS.ALL, 75);
    PS.radius(PS.ALL, PS.ALL, 20);
}

function setColored(x, y) {
    PS.fade(x, y, 10);
    PS.borderFade(x, y, 10);

    PS.alpha(x, y, 255);
    PS.color(x, y, 0, 75, 255);
    PS.borderColor(x, y, 0, 128, 255);
    PS.border(x, y, 4);
}

PS.init = function( system, options ) {
	"use strict";

	updateGrid();

	PS.audioLoad( "fx_blip", { lock: true } ); // load & lock click sound
};

PS.touch = function( x, y, data, options ) {
	"use strict";
	var next;

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );
	
	// Change color of touched bed
	// The default [data] is 0, which equals PS.COLOR_BLACK


    var path = null;
    if (lastX !== -1 && lastY !== -1) {
        path = PS.line(lastX, lastY, x, y);

        for (var i = 0; i < path.length; i++) {
            setColored(path[i][0], path[i][1]);
        }
    } else {
        setColored(x, y);
    }

    lastX = x;
    lastY = y;

	// Play click sound

	PS.audioPlay( "fx_blip" );

	// Add code here for mouse clicks/touches over a bead
};

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";

	if (key === PS.KEY_ARROW_RIGHT) {
        grid += 2;

        if (grid > 32) {
            grid = 32;
        }

        lastX = -1;
        lastY = -1;

        updateGrid();
    } else if (key === PS.KEY_ARROW_LEFT) {
        grid -= 2;

        if (grid < 2) {
            grid = 2;
        }

        lastX = -1;
        lastY = -1;

        updateGrid();
    }
};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};
