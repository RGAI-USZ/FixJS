function (unique, filter, every, contains) {


    /**
     * Return a new Array with elements common to all Arrays.
     * - based on underscore.js implementation
     * @version 0.1.0 (2011/01/12)
     */
    function intersection(arr) {
        var arrs = Array.prototype.slice.call(arguments, 1),
            result = filter(unique(arr), function(needle){
                return every(arrs, function(haystack){
                    return contains(haystack, needle);
                });
            });
        return result;
    }

    return intersection;

}