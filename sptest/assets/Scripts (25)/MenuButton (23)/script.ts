class MenuButtonBehavior extends Sup.Behavior {
  camera : Sup.Camera;
  
  awake() {
    this.camera = Sup.getActor("Camera").camera;
  }
  
  update() {
    if (Sup.Input.wasMouseButtonJustPressed(0)) {
      let ray = new Sup.Math.Ray();
      
      ray.setFromCamera(this.camera, Sup.Input.getMousePosition());
      
      let hits = ray.intersectActors([this.actor]);
      
      if (hits.length > 0) {
        this.onClick();
      }
    }
  }
  
  onClick() {
    Sup.log("shit");
  }
}
Sup.registerBehavior(MenuButtonBehavior);
