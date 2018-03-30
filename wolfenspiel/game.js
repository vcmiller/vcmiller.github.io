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

class Vector {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    dot(other) {
        return this.x * other.x +
            this.y * other.y +
            this.z * other.z +
            this.w * other.w
    }

    plus(other) {
        return new Vector(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
    }

    minus(other) {
        return new Vector(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w);
    }

    times(num) {
        return new Vector(this.x * num, this.y * num, this.z * num, this.w * num);
    }

    sqrMagnitude() {
        return this.dot(this);
    }

    magnitude() {
        return Math.sqrt(this.sqrMagnitude());
    }

    distance(other) {
        return this.minus(other).magnitude();
    }

    normalized() {
        return this.times(1 / this.magnitude());
    }
}

function intersectPlaneLine(plane, p1, p2) {
    let lv = p2.minus(p1);
    let f = (p1.times(-1).dot(plane)) / (lv.dot(plane));

    return p1.plus(lv.times(f));
}

class Polygon {
    constructor(pts, color) {
        this.pts = pts;
        this.color = color;
    }

    getClippedPoints() {
        let pts = [];

        let planes = [
            new Vector(-1,  0,  1, 0), // Right
            new Vector( 1,  0,  1, 0), // Left
            new Vector( 0, -1,  1, 0), // Top
            new Vector( 0,  1,  1, 0) // Bottom
        ];

        for (let i = 0; i < this.pts.length; i++) {
            pts[i] = game.transform(this.pts[i]);
        }

        for (let i = 0; i < planes.length; i++) {
            let out = [];

            let plane = planes[i];
            for (let cur = 0; cur < pts.length; cur++) {
                let next = (cur + 1) % pts.length;

                let p1 = new Vector(pts[cur].x, pts[cur].y, pts[cur].w, pts[cur].z);
                let p2 = new Vector(pts[next].x, pts[next].y, pts[next].w, pts[next].z);

                let d1 = plane.dot(p1);
                let d2 = plane.dot(p2);


                if (d1 > 0 && d2 > 0) {
                    out.push(new Vector(p2.x, p2.y, p2.w, p2.z));
                } else if (d1 > 0) {
                    let int = intersectPlaneLine(plane, p1, p2);

                    out.push(new Vector(int.x, int.y, int.w, int.z));
                } else if (d2 > 0) {
                    let int = intersectPlaneLine(plane, p1, p2);

                    out.push(new Vector(int.x, int.y, int.w, int.z));
                    out.push(new Vector(p2.x, p2.y, p2.w, p2.z));
                }
            }

            pts = out;
        }

        return pts;
    }

    getClippedTriangles() {
        let pts = this.getClippedPoints();

        let tris = [];
        for (let i = 2; i < pts.length; i++) {
            tris.push(pts[0]);
            tris.push(pts[i - 1]);
            tris.push(pts[i]);
        }

        return tris;
    }

    render() {
        let tris = this.getClippedTriangles();

        for (let tri = 0; tri < tris.length - 2; tri += 3) {
            let pts = [tris[tri], tris[tri + 1], tris[tri + 2]];

            let xmin = game.width - 1, xmax = 0, ymin = game.height - 1, ymax = 0;

            for (let i = 0; i < pts.length; i++) {
                let pt = new Vector(pts[i].x, pts[i].y, pts[i].z, pts[i].w);
                pt.x /= pt.w;
                pt.y /= pt.w;
                pt.z /= pt.w;

                pt = new Vector((pt.x + 1) * game.width / 2, (-pt.y + 1) * game.height / 2, (pt.z + 1) / 2, pt.w);
                pts[i] = pt;

                xmin = Math.min(xmin, pt.x);
                xmax = Math.max(xmax, pt.x);
                ymin = Math.min(ymin, pt.y);
                ymax = Math.max(ymax, pt.y);
            }

            xmin = Math.round(Math.max(xmin, 0));
            xmax = Math.round(Math.min(xmax, game.width - 1));
            ymin = Math.round(Math.max(ymin, 0));
            ymax = Math.round(Math.min(ymax, game.height - 1));

            let x1 = pts[0].x, x2 = pts[1].x, x3 = pts[2].x;
            let y1 = pts[0].y, y2 = pts[1].y, y3 = pts[2].y;

            for (let x = xmin; x <= xmax; x++) {
                for (let y = ymin; y <= ymax; y++) {
                    let f1 =
                        ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) /
                        ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));

                    let f2 =
                        ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) /
                        ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));

                    let f3 = 1 - f1 - f2;

                    if (f1 >= 0 && f1 <= 1 && f2 >= 0 && f2 <= 1 && f3 >= 0 && f3 <= 1) {
                        let z =
                            pts[0].z * f1 +
                            pts[1].z * f2 +
                            pts[2].z * f3;

                        let w =
                            pts[0].w * f1 +
                            pts[1].w * f2 +
                            pts[2].w * f3;

                        if (z >= 0 && z <= 1 && game.depthTest(x, y, z)) {
                            PS.color(x, y, this.color.r, this.color.g, this.color.b);
                        }

                    }
                }
            }
        }
    }
}

class Billboard {
    constructor(position, mesh) {
        this.position = position;
        this.mesh = mesh;
        this.killed = false;
    }

    render() {
        let angle = Math.atan2(game.camPos.x - this.position.x, game.camPos.z - this.position.z);

        game.modelMatrix = mult(translate(this.position.x, this.position.y, this.position.z), rotate(angle * 180 / Math.PI, vec3(0, 1, 0)));
        this.mesh.render();
    }
}

class Enemy extends Billboard {
    constructor(position) {
        super(position, game.enemyMesh);
        this.active = false;
        this.size = 1;
        this.dying = false;
    }

    update() {
        let toPlayer = game.camPos.minus(this.position);

        if (this.dying) {
            this.size -= 0.05;

            if (this.size <= 0 && !this.killed) {
                this.killed = true;
                game.numEnemies--;

                if (game.numEnemies === 0) {
                    PS.audioPlay("fx_tada");
                }
            }
        } else {
            if (!this.active && toPlayer.magnitude() < 7) {
                this.active = true;
            }

            if (toPlayer.magnitude() < 0.25) {
                game.killPlayer();
            }

            if (this.active) {
                toPlayer = toPlayer.normalized();
                let newPos = this.position.plus(toPlayer.times(0.03));

                if (game.checkPos(newPos.x, newPos.z, 0.2)) {
                    this.position.x = newPos.x;
                    this.position.z = newPos.z;
                } else if (game.checkPos(this.position.x, newPos.z, 0.2)) {
                    this.position.z = newPos.z;
                } else if (game.checkPos(newPos.x, this.position.z, 0.2)) {
                    this.position.x = newPos.x;
                }
            }
        }
    }

    render() {
        let angle = Math.atan2(game.camPos.x - this.position.x, game.camPos.z - this.position.z);

        game.modelMatrix = mult(mult(translate(this.position.x, this.position.y, this.position.z), rotate(angle * 180 / Math.PI, vec3(0, 1, 0))), scalem(this.size, this.size, this.size));
        this.mesh.render();
    }
}

class Bullet extends Billboard {
    constructor(position, velocity) {
        super(position, game.bulletMesh);
        this.velocity = velocity;
    }

    update() {
        this.position = this.position.plus(this.velocity);

        if (!game.checkPos(this.position.x, this.position.z, 0)) {
            this.killed = true;
            PS.audioPlay("fx_shoot7");
        }

        for (let i = 0; i < game.objects.length; i++) {
            let obj = game.objects[i];

            if (obj instanceof Enemy && this.position.distance(obj.position) < 0.3) {
                obj.dying = true;
                this.killed = true;
                PS.audioPlay("fx_squawk");
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
    camPos: new Vector(0, 0, 0, 1),
    camYaw: 0,
    keysDown: {},

    mapWidth: 16,
    mapDepth: 16,
    framePlayerDied: -1,
    numEnemies: 0,

    map: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 3, 0, 3, 0, 1,
        1, 0, 3, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 3, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        1, 0, 0, 0, 0, 3, 1, 0, 0, 1, 0, 3, 1, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 3, 0, 1, 1, 1, 1, 0, 1, 1,
        1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
        1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
        1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1,
        1, 0, 1, 0, 1, 3, 1, 0, 0, 1, 0, 0, 1, 0, 3, 1,
        1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 1, 2, 0, 1, 3, 0, 1, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ],

    depthBuffer: [],
    objects: [],
    enemyMesh: null,
    bulletMesh: null,

    killPlayer: function () {
        game.framePlayerDied = game.frameNumber;
        PS.audioPlay("fx_wilhelm");
    },

    mapNum: function (x, z) {
        return game.map[x + z * game.mapWidth];
    },

    clearDepth: function () {
        for (let p = 0; p < game.width * game.height; p++) {
            game.depthBuffer[p] = Number.MAX_VALUE;
        }
    },

    depthTest: function (x, y, depth) {
        let p = x + y * game.width;

        if (game.depthBuffer[p] < depth) {
            return false;
        } else {
            game.depthBuffer[p] = depth;
            return true;
        }
    },

    buildObjectMeshes: function () {
        game.enemyMesh = new Polygon([
            new Vector(-0.2, 0, 0, 1),
            new Vector(0, 0.3, 0, 1),
            new Vector(0.2, 0, 0, 1),
            new Vector(0, -0.3, 0, 1)
        ], new Color(255, 0, 255));

        game.bulletMesh = new Polygon([
            new Vector(-0.05, -0.05, 0, 1),
            new Vector(0.05, -0.05, 0, 1),
            new Vector(0.05, 0.05, 0, 1),
            new Vector(-0.05, 0.05, 0, 1),
        ], new Color(255, 255, 0))
    },

    buildMap: function () {
        let quads = [];

        quads.push(new Polygon([
            new Vector(-game.mapWidth / 2, -0.5, -game.mapDepth / 2, 1),
            new Vector(-game.mapWidth / 2, -.5, game.mapDepth / 2, 1),
            new Vector(game.mapWidth / 2, -0.5, game.mapDepth / 2, 1),
            new Vector(game.mapWidth / 2, -0.5, -game.mapDepth / 2, 1)
        ], new Color(137, 85, 56)));

        game.numEnemies = 0;

        for (let x = 0; x < game.mapWidth; x++) {
            for (let z = 0; z < game.mapDepth; z++) {
                let n = game.mapNum(x, z);

                let xw = x - game.mapWidth / 2;
                let zw = z - game.mapDepth / 2;

                if (n === 1) {
                    if (x > 0 && game.mapNum(x - 1, z) !== 1) {
                        quads.push(new Polygon([
                            new Vector(xw - 0.5, -0.5, zw - 0.5, 1),
                            new Vector(xw - 0.5, 0.5, zw - 0.5, 1),
                            new Vector(xw - 0.5, 0.5, zw + 0.5, 1),
                            new Vector(xw - 0.5, -0.5, zw + 0.5, 1),
                        ], new Color(255, 0, 0)));
                    }

                    if (z > 0 && game.mapNum(x, z - 1) !== 1) {
                        quads.push(new Polygon([
                            new Vector(xw - 0.5, -0.5, zw - 0.5, 1),
                            new Vector(xw - 0.5, 0.5, zw - 0.5, 1),
                            new Vector(xw + 0.5, 0.5, zw - 0.5, 1),
                            new Vector(xw + 0.5, -0.5, zw - 0.5, 1),
                        ], new Color(0, 255, 0)));
                    }

                    if (x < game.mapWidth - 1 && game.mapNum(x + 1, z) !== 1) {
                        quads.push(new Polygon([
                            new Vector(xw + 0.5, -0.5, zw - 0.5, 1),
                            new Vector(xw + 0.5, 0.5, zw - 0.5, 1),
                            new Vector(xw + 0.5, 0.5, zw + 0.5, 1),
                            new Vector(xw + 0.5, -0.5, zw + 0.5, 1),
                        ], new Color(0, 0, 255)));
                    }

                    if (z < game.mapDepth - 1 && game.mapNum(x, z + 1) !== 1) {
                        quads.push(new Polygon([
                            new Vector(xw - 0.5, -0.5, zw + 0.5, 1),
                            new Vector(xw - 0.5, 0.5, zw + 0.5, 1),
                            new Vector(xw + 0.5, 0.5, zw + 0.5, 1),
                            new Vector(xw + 0.5, -0.5, zw + 0.5, 1),
                        ], new Color(255, 128, 0)));
                    }
                } else if (n === 2) {
                    game.camPos = new Vector(xw, 0, zw, 1);
                } else if (n === 3) {
                    game.objects.push(new Enemy(new Vector(xw, 0, zw, 1)));
                    game.numEnemies++;
                }
            }
        }

        game.mapMesh = new Mesh(quads);
    },

    init: function () {
        PS.gridSize(32, 32);
        PS.border(PS.ALL, PS.ALL, 0);

        PS.audioLoad("fx_wilhelm");
        PS.audioLoad("fx_blast2");
        PS.audioLoad("fx_squawk");
        PS.audioLoad("fx_shoot7");
        PS.audioLoad("fx_tada");

        game.buildObjectMeshes();
        game.buildMap();

        game.modelMatrix = mat4();
        game.viewMatrix = mat4();
        game.projMatrix = perspective(60, 1, 0.02, 50);
        game.depthBuffer = [];

        PS.timerStart(2, game.tick);
    },

    tick: function () {
        game.frameNumber++;

        if (game.framePlayerDied < 0) {
            game.move();
            game.viewMatrix = mult(rotate(-game.camYaw, vec3(0, 1, 0)), translate(-game.camPos.x, -game.camPos.y, -game.camPos.z));

            for (let i = 0; i < game.objects.length; i++) {
                game.objects[i].update();
            }

            for (let i = game.objects.length - 1; i >= 0; i--) {
                if (game.objects[i].killed) {
                    game.objects.splice(i, 1);
                }
            }

            if (game.numEnemies > 0) {
                PS.statusText("Remaining Enemies: " + game.numEnemies);
            } else {
                PS.statusText("Victory Achieved");
            }
        } else if (game.frameNumber - game.framePlayerDied > 60) {
            game.objects = [];
            game.buildMap();
            game.camYaw = 0;
            game.framePlayerDied = -1;

            PS.statusText("You Died");

            return;
        }

        game.render();
    },

    checkPos: function (x, z, radius) {
        for (let i = -1; i <= 1; i+= 2) {
            for (let j = -1; j <= 1; j+= 2) {
                let gx = Math.round(x + i * radius + game.mapWidth / 2);
                let gz = Math.round(z + i * radius + game.mapDepth / 2);

                if (gx < 0 || gx >= game.mapWidth || gz < 0 || gz >= game.mapDepth) {
                    return false;
                } else {
                    if (game.mapNum(gx, gz) === 1) {
                        return false;
                    }
                }
            }
        }

        return true;
    },

    move: function () {
        let yr = radians(game.camYaw);
        let ys = Math.sin(yr);
        let yc = Math.cos(yr);

        let nx = game.camPos.x, nz = game.camPos.z;

        if (game.keysDown[PS.KEY_ARROW_UP]) {
            nz -= 0.05 * yc;
            nx -= 0.05 * ys;
        }

        if (game.keysDown[PS.KEY_ARROW_DOWN]) {
            nz += 0.05 * yc;
            nx += 0.05 * ys;
        }

        if (game.checkPos(nx, nz, 0.2)) {
            game.camPos.x = nx;
            game.camPos.z = nz;
        } else if (game.checkPos(nx, game.camPos.z, 0.2)) {
            game.camPos.x = nx;
        } else if (game.checkPos(game.camPos.x, nz, 0.2)) {
            game.camPos.z = nz;
        }

        if (game.keysDown[PS.KEY_ARROW_LEFT])
            game.camYaw += 3;

        if (game.keysDown[PS.KEY_ARROW_RIGHT])
            game.camYaw -= 3;
    },

    render: function () {
        game.clearDepth();
        PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);

        game.modelMatrix = mat4();
        game.mapMesh.render();

        for (let i = 0; i < game.objects.length; i++) {
            game.objects[i].render();
        }
    },

    transform: function (point) {
        point = game.matTimesVec(game.modelMatrix, point);
        point = game.matTimesVec(game.viewMatrix, point);
        return game.matTimesVec(game.projMatrix, point);
    },

    matTimesVec: function (mat, vec) {
        vec = vec4(vec.x, vec.y, vec.z, vec.w);
        let result = [];

        for (var i = 0; i < vec.length; i++) {
            result[i] = 0;

            for (var j = 0; j < vec.length; j++) {
                result[i] += mat[i][j] * vec[j];
            }
        }

        return new Vector(result[0], result[1], result[2], result[3]);
    },

    keyDown: function (key, shift, ctrl, options) {
        if (key === 32 && !game.keysDown[key]) {
            let bpos = game.camPos.plus(new Vector(0, -0.2, 0, 0));
            let a = radians(game.camYaw);
            let vel = new Vector(-Math.sin(a), 0, -Math.cos(a), 0).times(0.1);

            game.objects.push(new Bullet(bpos, vel));
            PS.audioPlay("fx_blast2");
        }

        game.keysDown[key] = true;
    },

    keyUp: function (key, shift, ctrl, options) {
        game.keysDown[key] = false;
    }
};

PS.init = game.init;
PS.keyDown = game.keyDown;
PS.keyUp = game.keyUp;
