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

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

class Triangle {
    constructor(pts, color) {
        this.pts = pts;
        this.color = color;
    }

    render() {
        let xmin = game.width - 1, xmax = 0, ymin = game.height - 1, ymax = 0;

        let pts = [];

        for (let i = 0; i < this.pts.length; i++) {
            let pt = game.transformPoint(this.pts[i]);
            pt[0] /= pt[3];
            pt[1] /= pt[3];
            pt[2] /= pt[3];

            pt = vec3((pt[0] + 1) * game.width / 2, (pt[1] + 1) * game.height / 2, pt[2]);
            pts[i] = pt;

            xmin = Math.min(xmin, pt[0]);
            xmax = Math.max(xmax, pt[0]);
            ymin = Math.min(ymin, pt[1]);
            ymax = Math.max(ymax, pt[1]);
        }

        xmin = Math.max(xmin, 0);
        xmax = Math.min(xmax, game.width - 1);
        ymin = Math.max(ymin, 0);
        ymax = Math.min(ymax, game.height - 1);

        let x1 = pts[0][0], x2 = pts[1][0], x3 = pts[2][0];
        let y1 = pts[0][1], y2 = pts[1][1], y3 = pts[2][1];

        for (let x = xmin; x <= xmax; x++) {
            for (let y = ymin; y <= ymax; y++) {
                let f1 =
                    ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) /
                    ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));

                let f2 =
                    ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) /
                    ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));

                let f3 = 1 - f1 - f2;

                if (f1 >= -.1 && f1 <= 1.1 && f2 >= -.1 && f2 <= 1.1 && f3 >= -.1 && f3 <= 1.1) {
                    let z =
                        pts[0][2] * f1 +
                        pts[1][2] * f2 +
                        pts[2][2] * f3;

                    if (z >= -1 && z <= 1) {
                        PS.color(x, y, this.color.r, this.color.g, this.color.b);
                    }

                }
            }
        }
    }
}

class Mesh {
    constructor(triangles) {
        this.triangles = triangles;
    }

    render() {
        for (var i = 0; i < this.triangles.length; i++) {
            this.triangles[i].render();
        }
    }
}

const game = {
    tickFrames: 1,
    width: 32,
    height: 32,

    frameNumber: 0,
    camPos: vec3(0, 0, 0),
    camYaw: 0,
    keysDown: {},

    init: function () {
        PS.gridSize(32, 32);
        PS.border(PS.ALL, PS.ALL, 0);

        const p1 = vec3(-1, -1, -3);
        const p2 = vec3(-1, -1, 3);
        const p3 = vec3(-1, 1, 3);
        const p4 = vec3(-1, 1, -3);

        const p5 = vec3(1, -1, -3);
        const p6 = vec3(1, -1, 3);
        const p7 = vec3(1, 1, 3);
        const p8 = vec3(1, 1, -3);

        let tri1 = new Triangle([p1, p2, p3], new Color(0, 0, 255));
        let tri2 = new Triangle([p1, p3, p4], new Color(0, 0, 255));
        let tri3 = new Triangle([p5, p6, p7], new Color(0, 0, 255));
        let tri4 = new Triangle([p5, p7, p8], new Color(0, 0, 255));

        game.mesh = new Mesh([tri1, tri2, tri3, tri4]);
        game.mvMatrix = mat4();
        game.pjMatrix = perspective(60, 1, 1, 50);

        PS.timerStart(2, game.tick);
    },

    tick: function () {
        game.frameNumber++;
        game.move();
        game.mvMatrix = mult(rotate(-game.camYaw, vec3(0, 1, 0)), translate(-game.camPos[0], -game.camPos[1], -game.camPos[2]));

        game.render();
    },

    move: function () {
        let yr = radians(game.camYaw);
        let ys = Math.sin(yr);
        let yc = Math.cos(yr);

        if (game.keysDown[PS.KEY_ARROW_UP]) {
            game.camPos[2] -= 0.1 * yc;
            game.camPos[0] -= 0.1 * ys;
        }

        if (game.keysDown[PS.KEY_ARROW_DOWN]) {
            game.camPos[2] += 0.1 * yc;
            game.camPos[0] += 0.1 * ys;
        }

        if (game.keysDown[PS.KEY_ARROW_LEFT])
            game.camYaw += 3;

        if (game.keysDown[PS.KEY_ARROW_RIGHT])
            game.camYaw -= 3;
    },

    render: function () {
        PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);
        game.mesh.render();
    },

    transformPoint: function (point) {
        point = vec4(point[0], point[1], point[2], 1);
        point = game.matTimesVec(game.mvMatrix, point);
        point = game.matTimesVec(game.pjMatrix, point);
        return point;
    },

    matTimesVec: function (mat, vec) {
        var result = [];

        for (var i = 0; i < vec.length; i++) {
            result[i] = 0;

            for (var j = 0; j < vec.length; j++) {
                result[i] += mat[i][j] * vec[j];
            }
        }

        return result;
    },

    keyDown: function (key, shift, ctrl, options) {
        game.keysDown[key] = true;
    },

    keyUp: function (key, shift, ctrl, options) {
        game.keysDown[key] = false;
    }
};

PS.init = game.init;
PS.keyDown = game.keyDown;
PS.keyUp = game.keyUp;
