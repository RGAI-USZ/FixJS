function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = window.Game) == null) {
    window.Game = {};
  }

  Game.Queue = (function() {

    function Queue(items) {
      if (items == null) {
        items = [];
      }
      this._queue = items;
    }

    Queue.prototype.enqueue = function(item) {
      return this._queue.push(item);
    };

    Queue.prototype.dequeue = function() {
      if (!this.size()) {
        return null;
      }
      return this._queue.shift();
    };

    Queue.prototype.size = function() {
      return this._queue.length;
    };

    Queue.prototype.peek = function() {
      return this._queue[0];
    };

    Queue.prototype.back = function() {
      return this._queue[this.size() - 1];
    };

    Queue.prototype.isEmpty = function() {
      return this._queue.length === 0;
    };

    Queue.prototype.toString = function() {
      var string;
      string = this._queue.reverse().toString();
      this._queue.reverse();
      return string;
    };

    return Queue;

  })();

  Game.FoodQueue = (function(_super) {

    __extends(FoodQueue, _super);

    function FoodQueue(grid, items) {
      this.grid = grid;
      FoodQueue.__super__.constructor.call(this, items);
    }

    FoodQueue.prototype.enqueue = function(item) {
      FoodQueue.__super__.enqueue.call(this, item);
      return this.grid.registerFoodAt(item);
    };

    FoodQueue.prototype.dequeue = function() {
      var foodPos;
      while (!this.grid.squareHasFood(this.peek())) {
        FoodQueue.__super__.dequeue.call(this);
      }
      foodPos = FoodQueue.__super__.dequeue.call(this);
      return this.grid.unregisterFoodAt(foodPos);
    };

    return FoodQueue;

  })(Game.Queue);

}