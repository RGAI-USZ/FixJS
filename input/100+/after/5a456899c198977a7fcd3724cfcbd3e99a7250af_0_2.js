function() {
  var _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = window.SNAKE) == null) {
    window.SNAKE = {};
  }

  SNAKE.Game = (function() {

    function Game(settings) {
      var defaults, option, value;
      if (settings == null) {
        settings = {};
      }
      this._gameLoop = __bind(this._gameLoop, this);

      this.stepCount = 0;
      this.stepsPerFood = 20;
      this.timeStepRate = 100;
      this.gameIntervalID = null;
      defaults = {
        debugPrint: false,
        debugStep: false
      };
      for (option in defaults) {
        value = defaults[option];
        this[option] = value;
        if (settings[option]) {
          this[option] = settings[option];
        }
      }
      this.snake = new SNAKE.Snake(this);
      this.grid = new SNAKE.Grid(this, this.snake);
      this.graphics = new SNAKE.Graphics(this, this.grid);
      this._startGame();
    }

    Game.prototype._startGame = function() {
      this.grid.foodCount = 0;
      this.grid.foodItems = new SNAKE.FoodQueue(this.grid);
      this.snake.setup(this.grid);
      if (this.debugStep) {
        return this.setupGameStep();
      }
      clearInterval(this.gameIntervalID);
      this.gameIntervalID = setInterval(this._gameLoop, this.timeStepRate);
      return this._gameLoop();
    };

    Game.prototype._gameLoop = function() {
      if ((this.stepCount % this.stepsPerFood) === 0) {
        this.grid.dropFood();
      }
      this.snake.move();
      this.graphics.update();
      return this.stepCount += 1;
    };

    Game.prototype.restart = function() {
      this.snake = this.grid.snake = new SNAKE.Snake;
      this.grid.makeWorld();
      return this._startGame();
    };

    Game.prototype.setupGameStep = function() {
      var _this = this;
      $(window).keydown(function(event) {
        if (event.keyCode === 83) {
          return _this._gameLoop();
        }
      });
      return console.warn('Debug stepping is active. Press s to move a time step.');
    };

    Game.prototype.log = function(message) {
      if (!this.debugPrint) {
        return;
      }
      return console.log(message);
    };

    return Game;

  })();

}