function() {
	var boardElement = $("board");

	if (!boardElement) {
		console.error("app: HTML element with id 'board' could not be found.");
		return;
	}

	var board = app.views.board.createInstance(boardElement, app.config.core.board.columnWidth, app.config.core.board.columnLeftMargin);
	board.initialize();
	board.rebuild();

	var boardControls = app.views.boardControls.createInstance();
	var boardControlsElement = boardControls.create();
	$(document.body).grab(boardControlsElement);
}