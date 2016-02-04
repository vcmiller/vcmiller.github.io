function Board(rows, cols, tile_w, board_x, board_y, tiles) {
  this.rows = rows;
  this.cols = cols;
  this.tile_w = tile_w;
  this.board_x = board_x;
  this.board_y = board_y;
  this.colors = ["red", "blue", "green", "yellow"];
  this.letters = "AAAAAAAAABBCCDDDDEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
  this.score = 0;
  this.lost = false;
  this.canSwap = true;
  this.queue = [];
  this.tiles = tiles;
  this.store = null;

  for (var i = 0; i < 5; i++) {
    this.queue.push({ letter : randLetter(this.letters), color : randColor(this.colors) });
  }

  this.contents = [];
  for (var i = 0; i < rows * cols; i++) {
    this.contents.push(null);
  }
}

Board.prototype.setItem = function(row, col, item) {
  this.contents[row * this.cols + col] = item;
}

Board.prototype.moveItem = function(srow, scol, drow, dcol) {
  this.setItem(drow, dcol, this.getItem(srow, scol));
  this.setItem(srow, scol, null);
}

Board.prototype.getItem = function(row, col) {
  return this.contents[row * this.cols + col];
}

Board.prototype.addTile = function(row, col, letter, color) {
  var item = {
    letter: letter,
    color: color,
    active: true
  };

  this.setItem(row, col, item);
}

Board.prototype.filled = function(row, col) {
  return this.getItem(row, col) != null;
}

Board.prototype.getLetter = function(row, col) {
  return this.getItem(row, col).letter;
}

Board.prototype.getLowestSpace = function(row, col) {
  for (var r = row + 1; r < this.rows; r++) {
    if (this.filled(r, col)) {
      return r - 1;
    }
  }

  return this.rows - 1;
}

Board.prototype.word = function(row, col, toRemove) {
  var word = "";
  var score = 0;
  for (var i = col; i < this.cols; i++) {
    if (!this.filled(row, i) || this.getItem(row, i).active || (row < this.rows - 1 && !this.filled(row + 1, i))) {
      break;
    }

    word += this.getLetter(row, i).toLowerCase();
    if (dict[word]) {
      for (var j = col; j <= i; j++) {
        score += letters[this.getLetter(row, j).toLowerCase()];
        toRemove.push({ row : row, col : j });
      }
    }
  }

  word = "";
  for (var i = row; i < this.rows; i++) {
    if (!this.filled(i, col) || this.getItem(i, col).active) {
      break;
    }

    word += this.getLetter(i, col).toLowerCase();
    if (dict[word]) {
      for (var j = row; j <= i; j++) {
        score += letters[this.getLetter(j, col).toLowerCase()];
        toRemove.push({ row : j, col : col });
      }
    }
  }

  return score;
}

Board.prototype.checkWords = function() {
  var toRemove = [];

  for (var row = this.rows - 1; row >= 0; row--) {
    for (var col = 0; col < this.cols; col++) {
      this.score += this.word(row, col, toRemove);
    }
  }

  for (var i = 0; i < toRemove.length; i++) {
    var tile = toRemove[i];
    this.setItem(tile.row, tile.col, null);
  }
}

Board.prototype.dropRandom = function() {
  var next = this.queue.shift();
  var col = randInt(this.cols);

  if (!this.filled(0, col)) {
    this.addTile(0, col, next.letter, next.color);
  } else {
    this.lost = true;
  }

  this.canSwap = true;
  this.queue.push({ letter : randLetter(this.letters), color : randColor(this.colors) });
}

Board.prototype.updateTile = function(row, col) {
  var drop = false;
  if (this.filled(row, col)) {
    if (row < this.rows - 1 && !this.filled(row + 1, col)) {
      this.moveItem(row, col, row + 1, col);
    } else {
      var item = this.getItem(row, col);
      if (item.active) {
        item.active = false;
        drop = true;
      }
    }
  }

  return drop;
}

Board.prototype.renderLetter = function(letter, color, x, y, game) {
  game.context.globalAlpha = 1.0;
  game.context.drawImage(this.tiles[color], x, y);
  game.context.fillStyle = "black";
  game.context.font = "30px Arial"
  game.context.fillText(letter, x + 6, y + 24);
}

Board.prototype.renderTile = function(row, col, game) {
  if (this.filled(row, col)) {
    var item = this.getItem(row, col);
    var x = this.board_x + col * this.tile_w;
    var y = this.board_y + row * this.tile_w

    if (item.active) {
      var r = this.getLowestSpace(row, col);
      game.context.globalAlpha = 0.4;
      var ny = this.board_y + r * this.tile_w;
      game.context.drawImage(this.tiles[item.color], x, ny);
    }

    this.renderLetter(item.letter, item.color, x, y, game);
  }
}

Board.prototype.update = function() {
  this.checkWords();

  var drop = false;
  for (var row = this.rows - 1; row >= 0; row--) {
    for (var col = 0; col < this.cols; col++) {
      drop = drop || this.updateTile(row, col);
    }
  }

  if (drop) {
    this.dropRandom();
  }
}

Board.prototype.render = function(game) {
  for (var row = 0; row < this.rows; row++) {
    for (var col = 0; col < this.cols; col++) {
      this.renderTile(row, col, game);
    }
  }

  for (var i = 0; i < this.queue.length; i++) {
    var x = this.board_x + this.tile_w * (this.cols + 1);
    var y = this.board_y + this.tile_w * (i > 0 ? i + 1 : i);

    this.renderLetter(this.queue[i].letter, this.queue[i].color, x, y, game);
  }

  var x = this.board_x - this.tile_w * 2;
  var y = this.board_y;

  if (this.store) {
    this.renderLetter(this.store.letter, this.store.color, x, y, game);
  }

  game.context.fillStyle = "#383737";
  game.context.font = "30px Arial"

  game.context.fillText("SCORE: " + this.score, this.board_x + 5, this.board_y - this.tile_w - 4);
}

Board.prototype.getActive = function() {
  for (var row = this.rows - 1; row >= 0; row--) {
    for (var col = 0; col < this.cols; col++) {
      var item = this.getItem(row, col);
      if (item != null && item.active) {
        return { row : row, col : col, letter : item.letter, color : item.color };
      }
    }
  }
}

Board.prototype.swap = function() {
  if (this.canSwap) {
    var active = this.getActive();
    this.setItem(active.row, active.col, null);
    if (this.store == null) {
      this.dropRandom();
    } else {
      var col = randInt(this.cols);
      this.addTile(0, col, this.store.letter, this.store.color);
    }

    this.store = { letter : active.letter, color : active.color };
    this.canSwap = false;
  }
}

Board.prototype.moveActive = function(amount) {
  var active = this.getActive();
  var nc = active.col + amount;
  if (nc >= 0 && nc < this.cols && !this.filled(active.row, nc)) {
    this.moveItem(active.row, active.col, active.row, nc);
  }
}

Board.prototype.dropActive = function() {
  var active = this.getActive();
  this.getItem(active.row, active.col).active = false;
  if (active.row < this.rows - 1 && !this.filled(active.row + 1, active.col)) {
    this.moveItem(active.row, active.col, this.getLowestSpace(active.row, active.col), active.col);
  }
  this.dropRandom();
}

function randLetter(s) {
  return s.substr(randInt(s.length), 1)
}

function randColor(l) {
  return l[randInt(l.length)];
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}
