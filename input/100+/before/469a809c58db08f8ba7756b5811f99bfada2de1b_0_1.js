function(needle, haystack) {
  var bestReduce, bestRow, confirmTheory, firstRow, hpix, index, n, npix, nthCandidates, nthRow, pixc, reduce, row, rowCandidates, y, _i, _j, _k, _l, _len, _len1, _ref;
  if (needle.width > haystack.width) {
    return null;
  }
  if (needle.height > haystack.height) {
    return null;
  }
  hpix = function(x, y) {
    var pix;
    pix = (y * haystack.width + x) * 4;
    return [haystack.data[pix], haystack.data[pix + 1], haystack.data[pix + 2]];
  };
  npix = function(x, y) {
    var pix;
    pix = (y * needle.width + x) * 4;
    return [needle.data[pix], needle.data[pix + 1], needle.data[pix + 2]];
  };
  pixc = function(_arg, _arg1) {
    var B, G, R, b, g, r;
    r = _arg[0], g = _arg[1], b = _arg[2];
    R = _arg1[0], G = _arg1[1], B = _arg1[2];
    return r === R && g === G && b === B;
  };
  confirmTheory = function(hx, hy) {
    var x, y, _i, _j, _ref, _ref1;
    for (y = _i = 0, _ref = needle.height; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i) {
      for (x = _j = 0, _ref1 = needle.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        if (!pixc(hpix(hx + x, hy + y), npix(x, y))) {
          return;
        }
      }
    }
    return true;
  };
  firstRow = rowString(needle, 0);
  rowCandidates = [];
  for (y = _i = 0, _ref = haystack.height - needle.height; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i) {
    row = rowString(haystack, y);
    if (row.indexOf(firstRow !== -1)) {
      rowCandidates.push(y);
    }
  }
  if (rowCandidates.length === 0) {
    return null;
  }
  bestReduce = 0;
  bestRow = 0;
  for (n = _j = 1; _j < 15; n = ++_j) {
    nthRow = rowString(needle, n);
    nthCandidates = [];
    for (_k = 0, _len = rowCandidates.length; _k < _len; _k++) {
      y = rowCandidates[_k];
      row = rowString(haystack, y + n);
      if (row.indexOf(nthRow) !== -1) {
        nthCandidates.push(y);
      }
    }
    if (nthCandidates.length === 0) {
      return null;
    }
    reduce = rowCandidates.length - nthCandidates.length;
    if (reduce > bestReduce) {
      bestReduce = reduce;
      bestRow = n;
    }
    rowCandidates = nthCandidates;
    if (nthCandidates.length === 1) {
      break;
    }
  }
  for (_l = 0, _len1 = rowCandidates.length; _l < _len1; _l++) {
    y = rowCandidates[_l];
    index = -1;
    nthRow = rowString(needle, bestRow);
    row = rowString(haystack, y + bestRow);
    while ((index = row.indexOf(nthRow, index + 1)) !== -1) {
      if (confirmTheory(index, y)) {
        console.log("an actual match", index, y, needle.width, needle.height);
        return [index, y];
      }
    }
  }
}