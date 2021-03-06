function() {
  var _ref;

  if ((_ref = window.Game) == null) {
    window.Game = {};
  }

  Game.Utils = (function() {

    function Utils() {}

    Utils.randInt = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    Utils.randPair = function(min1, max1, min2, max2) {
      var randX, randY;
      if (arguments.length === 2) {
        randX = this.randInt(0, min1);
        randY = this.randInt(0, max1);
      } else {
        randX = this.randInt(min1, max1);
        randY = this.randInt(min2, max2);
      }
      return new Game.Pair(randX, randY);
    };

    Utils.concat = function(array1, array2) {
      return array1.push.apply(array1, array2);
    };

    Utils.argsToArray = function(args) {
      return Array.prototype.slice.call(args);
    };

    Utils.minArray = function() {
      var args, lengths, minLength;
      if (!arguments.length) {
        return Infinity;
      }
      args = Utils.argsToArray(arguments);
      lengths = args.map(function(array) {
        return array.length;
      });
      minLength = Math.min.apply(null, lengths);
      return args[lengths.indexOf(minLength)];
    };

    return Utils;

  }).call(this);

}