function Board(rows, cols, tile_w) {
  this.rows = rows;
  this.cols = cols;
  this.tile_w = tile_w;
  this.colors = ["red", "blue", "green", "yellow"];
  this.letters = "AAAAAAAAABBCCDDDDEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
  this.score = 0;
  this.lost = false;

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
    if (!this.filled(row, i) || this.getItem(row, i).active) {
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
  var letter = this.letters.substr(randInt(this.letters.length), 1);
  var color = this.colors[randInt(this.colors.length)];
  var col = randInt(this.cols);

  if (!this.filled(0, col)) {
    this.addTile(0, col, letter, color);
  } else {
    this.lost = true;
  }
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

Board.prototype.renderTile = function(row, col, game) {
  if (this.filled(row, col)) {
    var item = this.getItem(row, col);
    var x = col * this.tile_w;
    var y = row * this.tile_w

    if (item.active) {
      var r = this.getLowestSpace(row, col);
      game.context.fillStyle = item.color;
      game.context.globalAlpha = 0.4;
      game.context.fillRect(x, r * this.tile_w, this.tile_w, this.tile_w);
    }

    game.context.globalAlpha = 1.0;
    game.context.fillStyle = item.color;
    game.context.fillRect(x, y, this.tile_w, this.tile_w);
    game.context.fillStyle = "black";
    game.context.font = "30px Ariel"
    game.context.fillText(item.letter, x + 6, y + 24);

  }
}

Board.prototype.update = function() {
  var drop = false;
  for (var row = this.rows - 1; row >= 0; row--) {
    for (var col = 0; col < this.cols; col++) {
      drop = drop || this.updateTile(row, col);
    }
  }

  this.checkWords();

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
}

Board.prototype.moveActive = function(amount) {
  for (var row = this.rows - 1; row >= 0; row--) {
    for (var col = 0; col < this.cols; col++) {
      if (this.filled(row, col) && this.getItem(row, col).active) {
        var nc = col + amount;
        if (nc >= 0 && nc < this.cols && !this.filled(row, nc)) {
          this.moveItem(row, col, row, nc);
          return;
        }
      }
    }
  }
}

Board.prototype.dropActive = function() {
  for (var row = this.rows - 1; row >= 0; row--) {
    for (var col = 0; col < this.cols; col++) {
      if (this.filled(row, col) && this.getItem(row, col).active) {
        this.getItem(row, col).active = false;
        this.moveItem(row, col, this.getLowestSpace(row, col), col);
        this.dropRandom();
        return;
      }
    }
  }
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}
