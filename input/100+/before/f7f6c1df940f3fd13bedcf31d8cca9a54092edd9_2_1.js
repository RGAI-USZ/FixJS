function(e) {

  var position = an.u.getMousePositionInCanvas(e);

  var handles = an.g.editor.getResizeArea();
  var p = this.position;

  // 0 - 7 - 3
  // 4       6
  // 1 - 5 - 2
  var diffX = 0;
  if( (p == 0) || (p == 1) || (p == 4) ) {
    diffX = position.x - handles.x[p];
  }
  if(handles.x[3] == handles.x[0]) {
    diffX = 0;
  }

  var diffY = 0;
  if( (p == 0) || (p == 3) || (p == 7) ) {
    diffY = position.y - handles.y[p];
  }
  if(handles.y[1] == handles.y[0]) {
    diffY = 0;
  }

  var w;
  if( (p == 0) || (p == 1) || (p == 4) ) {
    w = handles.x[3] - position.x;
  } else if( (p == 3) || (p == 6) || (p == 2) ) {
    w = position.x - handles.x[0];
  } else {
    w = handles.x[3] - handles.x[0];
  }
  if(w < 0) {
    w = 0;
  }

  var scaleX = w / (handles.x[3] - handles.x[0]);
  if(handles.x[3] == handles.x[0]) {
    scaleX = 0;
  }

  var h;
  if( (p == 0) || (p == 7) || (p == 3) ) {
    h = handles.y[1] - position.y;
  } else if( (p == 1) || (p == 5) || (p == 2) ) {
    h = position.y - handles.y[0];
  } else {
    h = handles.y[1] - handles.y[0];
  }
  if(h < 0) {
    h = 0;
  }

  var scaleY = h / (handles.y[1] - handles.y[0]);;
  if(handles.y[1] == handles.y[0]) {
    scaleY = 0;
  }

  var fromX = handles.x[0];
  var fromY = handles.y[0];

  an.g.editor.resizeSelectedPaths(fromX, fromY, scaleX, scaleY);
  an.g.editor.translateSelectedPaths(diffX, diffY);

  an.g.editor.draw();

  // console.log(diffX, diffY);
}