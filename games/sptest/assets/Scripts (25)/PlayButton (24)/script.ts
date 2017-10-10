class PlayButtonBehavior extends MenuButtonBehavior {
  onClick() {
    Sup.loadScene("Scenes/Scene");
  }
}
Sup.registerBehavior(PlayButtonBehavior);
