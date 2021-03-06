function(point, p0, p1, p2) {
        if (!point || !p0 || !p1 || !p2) {
            throw new DeveloperError('point, p0, p1, and p2 are required.');
        }

        // Implementation based on http://www.blackpawn.com/texts/pointinpoly/default.html.
        var v0 = p1.subtract(p0);
        var v1 = p2.subtract(p0);
        var v2 = point.subtract(p0);

        var dot00 = v0.dot(v0);
        var dot01 = v0.dot(v1);
        var dot02 = v0.dot(v2);
        var dot11 = v1.dot(v1);
        var dot12 = v1.dot(v2);

        var q = 1.0 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * q;
        var v = (dot00 * dot12 - dot01 * dot02) * q;

        return (u > 0) && (v > 0) && (u + v < 1);
    }