function() {

  Game.Graphics = (function() {

    function Graphics(grid, graphicsType) {
      this.grid = grid;
      this.graphicsType = graphicsType != null ? graphicsType : 'dom';
      this.grid.setup(this);
      this.grid.makeWorld();
      if (this.graphicsType === 'dom') {
        this.buildDOM();
      }
      this.nodeRemoveQueue = [];
    }

    Graphics.prototype.setNodePosition = function(node, pos) {
      var offset;
      if (!node) {
        return;
      }
      offset = this.dom.grid.offset();
      node.css({
        top: offset.top + pos.y * this.grid.squareHeight,
        left: offset.left + pos.x * this.grid.squareWidth
      });
      return node.show();
    };

    Graphics.prototype.update = function() {
      var _this = this;
      return this.grid.eachSquare(function(pos, square) {
        var type, _i, _len, _ref, _results;
        _ref = _this.grid.squareTypes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          if (square[type] === true) {
            square[type] = _this.appendDOMNode(pos, type);
          }
          if (square[type]) {
            _results.push(_this.setNodePosition(square[type], pos));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    };

    Graphics.prototype.buildDOMNode = function(pos, type) {
      var node;
      node = $("<div class='" + type + "'></div>");
      node.css({
        width: this.grid.squareWidth,
        height: this.grid.squareHeight
      });
      this.setNodePosition(node, pos);
      return node;
    };

    Graphics.prototype.appendDOMNode = function(pos, type) {
      var node;
      node = this.buildDOMNode(pos, type);
      return node.appendTo(this.dom.grid);
    };

    Graphics.prototype.buildDOM = function() {
      var _this = this;
      this.dom = {};
      this.dom.grid = $('<div id="grid"></div>');
      this.dom.grid.css({
        width: this.grid.squareWidth * this.grid.squaresX,
        height: this.grid.squareHeight * this.grid.squaresY
      });
      $('body').append(this.dom.grid);
      return this.grid.eachSquare(function(pos, square) {
        var type;
        if (_this.grid.isEmptySquare(square)) {
          return;
        }
        if (square.snake) {
          type = 'snake';
        }
        if (square.food) {
          type = 'food';
        }
        return square[type] = _this.appendDOMNode(pos, type);
      });
    };

    return Graphics;

  })();

}