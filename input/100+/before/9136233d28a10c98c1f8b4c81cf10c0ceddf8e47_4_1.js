function() {
  var _ref;

  if ((_ref = window.Game) == null) {
    window.Game = {};
  }

  Game.Pair = (function() {

    function Pair(x, y) {
      var _ref1;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (arguments.length === 2) {
        _ref1 = [x, y], this.x = _ref1[0], this.y = _ref1[1];
        return;
      }
      this._parsePairString(x);
    }

    Pair.prototype._parsePairString = function(string) {
      var matches, regex, _ref1;
      regex = /\((\d+), ?(\d+)\)/g;
      matches = regex.exec(string);
      return _ref1 = [parseInt(matches[1]), parseInt(matches[2])], this.x = _ref1[0], this.y = _ref1[1], _ref1;
    };

    Pair.prototype.clone = function() {
      return new Game.Pair(this.x, this.y);
    };

    Pair.prototype.copy = function(pair) {
      if (!pair) {
        return;
      }
      this.x = pair.x;
      return this.y = pair.y;
    };

    Pair.prototype.equals = function(pair) {
      if (!pair) {
        return false;
      }
      return this.x === pair.x && this.y === pair.y;
    };

    Pair.prototype.toString = function() {
      return "(" + this.x + ", " + this.y + ")";
    };

    return Pair;

  })();

}