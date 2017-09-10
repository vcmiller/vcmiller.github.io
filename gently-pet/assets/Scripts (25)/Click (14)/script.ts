class ClickBehavior extends Sup.Behavior {
  camera : Sup.Camera;
  
  petTimeout : number = 5;
  
  winSeconds : number = 5;
  winMinutes : number = 0;
  
  private lastPet : number;
  private startTime : number;
  
  awake() {
    this.camera = Sup.getActor("Camera").camera;
    this.lastPet = getTime();
    this.startTime = getTime();
  }

  update() {
    if (getTime() - this.lastPet > this.petTimeout) {
      Sup.loadScene("Scenes/Lose");
    }
    
    if (getTime() - this.startTime > this.winSeconds + (60 * this.winMinutes)) {
      Sup.loadScene("Scenes/Win");
    }
    
    if (Sup.Input.wasMouseButtonJustPressed(0)) {
      let ray = new Sup.Math.Ray();
      
      ray.setFromCamera(this.camera, Sup.Input.getMousePosition());
      
      let hits = ray.intersectActors([this.actor]);
      
      if (hits.length > 0) {
        this.lastPet = getTime();
      }
    }
  }
}
Sup.registerBehavior(ClickBehavior);
