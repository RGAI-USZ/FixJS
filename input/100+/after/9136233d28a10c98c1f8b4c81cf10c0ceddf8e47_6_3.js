function() {
  var __slice = [].slice;

  Game.Snake = (function() {

    function Snake(length, direction, head) {
      var piece, x, y, _ref;
      this.length = length != null ? length : 5;
      this.direction = direction != null ? direction : 'down';
      this.head = head;
      this.grid = null;
      this.lastTailPos = null;
      this.moves = new Game.Queue;
      this.growthPerFood = 3;
      this.toGrow = 0;
      this.grown = 0;
      this.eating = false;
      this.seekingFood = false;
      if ((_ref = this.head) == null) {
        this.head = new Game.Pair(0, 4);
      }
      x = this.head.x;
      y = this.head.y;
      this.chain = (function() {
        var _i, _ref1, _results;
        _results = [];
        for (piece = _i = 0, _ref1 = this.length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; piece = 0 <= _ref1 ? ++_i : --_i) {
          _results.push(new Game.Pair(x, y - piece));
        }
        return _results;
      }).call(this);
      this._setupControls();
    }

    Snake.prototype._nextPosition = function(position) {
      if (position == null) {
        position = this.head;
      }
      position = position.clone();
      switch (this.direction) {
        case 'up':
          position.y -= 1;
          break;
        case 'right':
          position.x += 1;
          break;
        case 'down':
          position.y += 1;
          break;
        case 'left':
          position.x -= 1;
      }
      return this.grid.moduloBoundaries(position);
    };

    Snake.prototype._nextDirection = function(position) {
      var nextDirection;
      if (!position) {
        return;
      }
      nextDirection = this.direction;
      this.grid.eachAdjacentPosition(this.head, function(adjPosition, direction) {
        if (position.equals(adjPosition)) {
          nextDirection = direction;
          return false;
        }
      });
      return nextDirection;
    };

    Snake.prototype._setupControls = function() {
      var _this = this;
      return $(window).keydown(function(event) {
        var newDirection;
        newDirection = _this.direction;
        switch (event.keyCode) {
          case 37:
            newDirection = 'left';
            break;
          case 38:
            newDirection = 'up';
            break;
          case 39:
            newDirection = 'right';
            break;
          case 40:
            newDirection = 'down';
        }
        if (!_this._isOpposite(newDirection)) {
          _this.direction = newDirection;
          return _this.moves.enqueue(_this._nextPosition(_this.moves.back()));
        }
      });
    };

    Snake.prototype._isOpposite = function(newDirection) {
      if (newDirection === 'left' && this.direction === 'right') {
        return true;
      }
      if (newDirection === 'right' && this.direction === 'left') {
        return true;
      }
      if (newDirection === 'up' && this.direction === 'down') {
        return true;
      }
      if (newDirection === 'down' && this.direction === 'up') {
        return true;
      }
      return false;
    };

    Snake.prototype._eat = function() {
      if (!this.lastTailPos) {
        return;
      }
      this.chain.push(this.lastTailPos);
      this.grid.registerSquareAt(this.lastTailPos, 'snake');
      this.grid.unregisterFoodAt(this.chain[0]);
      this.grown += 1;
      if (this.grown === this.toGrow) {
        this.eating = false;
        this.toGrow = 0;
        return this.grown = 0;
      }
    };

    Snake.prototype._findFoodPath = function() {
      var foodStrings, graph, pairs;
      graph = new Game.Graph(this.grid.toGraph());
      Game.log(graph);
      foodStrings = this.grid.foodItems._queue.map(function(item) {
        return item.toString();
      });
      pairs = graph.dijkstras.apply(graph, [this.head.toString()].concat(__slice.call(foodStrings)));
      pairs = pairs.map(function(pair) {
        return new Game.Pair(pair);
      });
      Game.log(pairs);
      return pairs;
    };

    Snake.prototype.setup = function(grid) {
      var pair, _i, _len, _ref, _results;
      this.grid = grid;
      _ref = this.chain;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pair = _ref[_i];
        _results.push(this.grid.registerSquareAt(pair, 'snake'));
      }
      return _results;
    };

    Snake.prototype.move = function() {
      var index, moveTo, pair, piece, temp, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!this.direction) {
        return;
      }
      if (this.grid.squareHasType('food', this.head)) {
        this.toGrow += this.growthPerFood;
        this.eating = true;
      }
      if (this.eating) {
        this._eat();
      }
      if (this.moves.isEmpty()) {
        this.seekingFood = false;
      }
      if (!this.seekingFood) {
        _ref = this._findFoodPath();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pair = _ref[_i];
          this.moves.enqueue(pair);
        }
        this.seekingFood = true;
      }
      temp = this.head.clone();
      this.head = this.moves.isEmpty() ? this._nextPosition() : this.moves.dequeue();
      moveTo = this.head.clone();
      this.lastTailPos = this.chain[this.chain.length - 1].clone();
      if (this.grid.squareHasType('snake', moveTo)) {
        this.grid.restart();
      }
      _ref1 = this.chain;
      _results = [];
      for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
        piece = _ref1[index];
        this.grid.moveSquare(piece, moveTo, 'snake');
        piece.copy(moveTo);
        moveTo.copy(temp);
        _results.push(temp.copy(this.chain[index + 1]));
      }
      return _results;
    };

    return Snake;

  })();

}