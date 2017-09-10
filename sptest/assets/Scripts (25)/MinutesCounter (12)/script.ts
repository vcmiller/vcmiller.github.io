function getTime(): number {
  var time = new Date();
  return time.getSeconds() + time.getMinutes() * 60 + time.getHours() * 3600;
}

class MinutesCounterBehavior extends Sup.Behavior {
  private startTime : number;
  
  awake() {
    this.startTime = getTime();
  }
  
  update() {
    var time : number = getTime() - this.startTime;
    var seconds : string = time % 60 + "";
    
    if (seconds.length == 1) {
      seconds = "0" + seconds;
    }
    
    var minutes : number = Math.floor(time / 60);
    
    this.actor.textRenderer.setText(minutes + ":" + seconds);
  }
}
Sup.registerBehavior(MinutesCounterBehavior);
