function Game(canvas, interval, start, update, render) {
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.width = canvas.width;
  this.height = canvas.height;

  this.interval = interval;
  this.startFunc = start;
  this.updateFunc = update;
  this.renderFunc = render;
}

Game.prototype._clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Game.prototype._update = function() {
  this.updateFunc();
  this._clear();
  this.renderFunc();
};

Game.prototype.run = function() {
  this.startFunc();
  var t = this;
  this.handle = setInterval(function() { t._update(); }, this.interval);
};

Game.prototype.stop = function() {
  if (this.handle) {
    clearInterval(this.handle);
  }
}
