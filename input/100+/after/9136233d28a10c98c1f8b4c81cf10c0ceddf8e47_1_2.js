function() {
  var __slice = [].slice;

  Game.Graph = (function() {

    function Graph(edgeWeights) {
      var tuple, vertex1, vertex2, weight, weightless, _base, _base1, _base2, _base3, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4;
      this.edgeWeights = edgeWeights != null ? edgeWeights : [];
      weightless = this._weightlessGraph();
      this._distanceBetween = {};
      this._neighbours = {};
      _ref = this.edgeWeights;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tuple = _ref[_i];
        vertex1 = tuple[0], vertex2 = tuple[1], weight = tuple[2];
        if (weightless) {
          weight = 1;
        }
        if ((_ref1 = (_base = this._distanceBetween)[vertex1]) == null) {
          _base[vertex1] = {};
        }
        if ((_ref2 = (_base1 = this._distanceBetween)[vertex2]) == null) {
          _base1[vertex2] = {};
        }
        this._distanceBetween[vertex1][vertex2] = weight;
        this._distanceBetween[vertex2][vertex1] = weight;
        if ((_ref3 = (_base2 = this._neighbours)[vertex1]) == null) {
          _base2[vertex1] = [];
        }
        if ((_ref4 = (_base3 = this._neighbours)[vertex2]) == null) {
          _base3[vertex2] = [];
        }
        if (vertex1 !== vertex2) {
          this._neighbours[vertex1].push(vertex2);
          this._neighbours[vertex2].push(vertex1);
        }
      }
    }

    Graph.prototype._weightlessGraph = function() {
      var pair, _i, _len, _ref;
      _ref = this.edgeWeights;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pair = _ref[_i];
        if (pair.length !== 2) {
          return false;
        }
      }
      return true;
    };

    Graph.prototype._shortestPath = function(previous, source, target) {
      var path;
      path = [];
      while (previous[target]) {
        path.unshift(target);
        target = previous[target];
      }
      return path;
    };

    Graph.prototype.distanceBetween = function(vertex1, vertex2) {
      return this._distanceBetween[vertex1][vertex2] || Infinity;
    };

    Graph.prototype.vertices = function() {
      var vertex, _results;
      _results = [];
      for (vertex in this._neighbours) {
        _results.push(vertex);
      }
      return _results;
    };

    Graph.prototype.dijkstras = function() {
      var alt, closest, distance, minDistance, neighbour, pathDistances, previous, source, targetIndex, targets, vertex, vertices, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      source = arguments[0], targets = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!source) {
        return;
      }
      vertices = this.vertices();
      distance = {};
      previous = {};
      for (_i = 0, _len = vertices.length; _i < _len; _i++) {
        vertex = vertices[_i];
        distance[vertex] = Infinity;
        previous[vertex] = null;
      }
      distance[source] = 0;
      while (vertices.length) {
        closest = vertices[0];
        _ref = vertices.slice(1);
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          neighbour = _ref[_j];
          if (distance[neighbour] < distance[closest]) {
            closest = neighbour;
          }
        }
        if (distance[closest] === Infinity) {
          break;
        }
        vertices.splice(vertices.indexOf(closest), 1);
        _ref1 = this._neighbours[closest];
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          neighbour = _ref1[_k];
          if (vertices.indexOf(neighbour) === -1) {
            continue;
          }
          alt = distance[closest] + this.distanceBetween(closest, neighbour);
          if (alt < distance[neighbour]) {
            distance[neighbour] = alt;
            previous[neighbour] = closest;
          }
        }
      }
      if (!targets.length) {
        return distance;
      }
      pathDistances = targets.map(function(target) {
        return distance[target];
      });
      minDistance = Math.min.apply(null, pathDistances);
      targetIndex = pathDistances.indexOf(minDistance);
      return this._shortestPath(previous, source, targets[targetIndex]);
    };

    return Graph;

  })();

}