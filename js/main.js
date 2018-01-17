function main() {
  var currentModel = uiModel();
  var currentView = uiView();
  currentView.setModel(currentModel);
  var currentController = uiController(currentModel, currentView);

  currentController.start();
}

main();
