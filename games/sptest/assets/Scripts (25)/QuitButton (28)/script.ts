class QuitButtonBehavior extends MenuButtonBehavior {
  onClick() {
    Sup.exit();
  }
}
Sup.registerBehavior(QuitButtonBehavior);
