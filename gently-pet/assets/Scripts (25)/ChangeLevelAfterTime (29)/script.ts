class ChangeLevelAfterTimeBehavior extends Sup.Behavior {
  private startTime : number;
  
  timeout : number;
  nextScene : string;
  
  awake() {
    this.startTime = getTime();
  }

  update() {
    if (getTime() - this.startTime > this.timeout) {
      Sup.loadScene(this.nextScene);
    }
  }
}
Sup.registerBehavior(ChangeLevelAfterTimeBehavior);
