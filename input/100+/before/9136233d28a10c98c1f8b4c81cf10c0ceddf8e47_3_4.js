function() {
  var _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = window.Game) == null) {
    window.Game = {};
  }

  Game.Grid = (function() {

    function Grid(snake, squaresX, squaresY) {
      this.snake = snake;
      this.squaresX = squaresX != null ? squaresX : 25;
      this.squaresY = squaresY != null ? squaresY : 15;
      this.dropFood = __bind(this.dropFood, this);

      this._squareToEdges = __bind(this._squareToEdges, this);

      this.graphics = null;
      this.gameIntervalID = null;
      this.timeStepRate = 100;
      this.squareWidth = 15;
      this.squareHeight = 15;
      this.squareTypes = ['food', 'snake'];
      this.maxFood = 4;
      this.foodCount = 0;
      this.foodItems = null;
      this.foodDropRate = this.timeStepRate * 20;
      this.foodIntervalID = null;
    }

    Grid.prototype._squareToEdges = function(pos) {
      var edges,
        _this = this;
      if (this.squareHasType('snake', pos) && !pos.equals(this.snake.head)) {
        return;
      }
      edges = [];
      this.eachAdjacentPosition(pos, function(adjacentPos, direction) {
        if (_this.squareHasType('snake', adjacentPos)) {
          return;
        }
        return edges.push([pos.toString(), adjacentPos.toString()]);
      });
      return edges;
    };

    Grid.prototype.moduloBoundaries = function(pair) {
      pair.x %= this.squaresX;
      pair.y %= this.squaresY;
      if (pair.x < 0) {
        pair.x = this.squaresX - 1;
      }
      if (pair.y < 0) {
        pair.y = this.squaresY - 1;
      }
      return pair;
    };

    Grid.prototype.eachSquare = function(callback) {
      var column, pos, square, x, y, _i, _len, _ref1, _results;
      if (!this.world) {
        return;
      }
      _ref1 = this.world;
      _results = [];
      for (x = _i = 0, _len = _ref1.length; _i < _len; x = ++_i) {
        column = _ref1[x];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (y = _j = 0, _len1 = column.length; _j < _len1; y = ++_j) {
            square = column[y];
            pos = new Game.Pair(x, y);
            _results1.push(callback(pos, square));
          }
          return _results1;
        })());
      }
      return _results;
    };

    Grid.prototype.eachAdjacentPosition = function(pos, callback) {
      var adjacentPos, direction, normalizedPos, positions, _i, _len;
      positions = {
        up: new Game.Pair(pos.x, pos.y + 1),
        right: new Game.Pair(pos.x + 1, pos.y),
        down: new Game.Pair(pos.x, pos.y - 1),
        left: new Game.Pair(pos.x - 1, pos.y)
      };
      for (adjacentPos = _i = 0, _len = positions.length; _i < _len; adjacentPos = ++_i) {
        direction = positions[adjacentPos];
        normalizedPos = this.moduloBoundaries(adjacentPos);
        if (false === callback(normalizedPos, direction)) {
          return;
        }
      }
    };

    Grid.prototype.makeWorld = function() {
      var _this = this;
      this.eachSquare(function(pos) {
        return _this.unregisterAllSquaresAt(pos);
      });
      return this.world = (function() {
        var _i, _ref1, _results;
        _results = [];
        for (_i = 0, _ref1 = this.squaresX; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; 0 <= _ref1 ? _i++ : _i--) {
          _results.push((function() {
            var _j, _ref2, _results1;
            _results1 = [];
            for (_j = 0, _ref2 = this.squaresY; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; 0 <= _ref2 ? _j++ : _j--) {
              _results1.push({});
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }).call(this);
    };

    Grid.prototype.setup = function(graphics) {
      return this.graphics = graphics;
    };

    Grid.prototype.startGame = function() {
      var gameLoop,
        _this = this;
      this.foodCount = 0;
      this.foodItems = new Game.FoodQueue(this);
      this.snake.setup(this);
      this.dropFood();
      clearInterval(this.gameIntervalID);
      gameLoop = function() {
        _this.snake.move();
        return _this.graphics.update();
      };
      this.gameIntervalID = setInterval(gameLoop, this.timeStepRate);
      return gameLoop();
    };

    Grid.prototype.moveSquare = function(start, end, type) {
      this.world[end.x][end.y][type] = this.world[start.x][start.y][type];
      return this.world[start.x][start.y][type] = null;
    };

    Grid.prototype.isEmptySquare = function(square) {
      var type, _i, _len, _ref1;
      _ref1 = this.squareTypes;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        type = _ref1[_i];
        if (square[type]) {
          return false;
        }
      }
      return true;
    };

    Grid.prototype.registerSquareAt = function(pos, type) {
      if (this.world[pos.x][pos.y][type]) {
        return false;
      }
      this.world[pos.x][pos.y][type] = true;
      return true;
    };

    Grid.prototype.registerFoodAt = function(pos) {
      if (!this.registerSquareAt(pos, 'food')) {
        return false;
      }
      this.foodCount += 1;
      return true;
    };

    Grid.prototype.unregisterSquareAt = function(pos, type) {
      var _ref1;
      if (!this.world[pos.x][pos.y][type]) {
        return false;
      }
      if ((_ref1 = this.world[pos.x][pos.y][type]) != null) {
        _ref1.hide();
      }
      this.world[pos.x][pos.y][type] = null;
      return true;
    };

    Grid.prototype.unregisterFoodAt = function(pos) {
      if (!this.unregisterSquareAt(pos, 'food')) {
        return false;
      }
      this.foodCount -= 1;
      return true;
    };

    Grid.prototype.unregisterAllSquaresAt = function(pos) {
      var type, _i, _len, _ref1, _results;
      _ref1 = this.squareTypes;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        type = _ref1[_i];
        _results.push(this.unregisterSquareAt(pos, type));
      }
      return _results;
    };

    Grid.prototype.squareHasType = function(type, pos) {
      return this.world[pos.x][pos.y][type] != null;
    };

    Grid.prototype.squareHasFood = function(pos) {
      return this.squareHasType('food', pos);
    };

    Grid.prototype.resetFoodInterval = function() {
      clearInterval(this.foodIntervalID);
      return this.foodIntervalID = setInterval(this.dropFood, this.foodDropRate);
    };

    Grid.prototype.dropFood = function() {
      this.resetFoodInterval();
      this.foodItems.enqueue(Game.Utils.randPair(this.squaresX - 1, this.squaresY - 1));
      if (this.foodCount > this.maxFood) {
        return this.foodItems.dequeue();
      }
    };

    Grid.prototype.restart = function() {
      console.log('restarting');
      this.snake = new Game.Snake;
      this.makeWorld();
      return this.startGame();
    };

    Grid.prototype.toGraph = function() {
      var graphEdges,
        _this = this;
      graphEdges = [];
      this.eachSquare(function(pos) {
        return Game.Utils.concat(graphEdges, _this._squareToEdges(pos));
      });
      return graphEdges;
    };

    return Grid;

  })();

}