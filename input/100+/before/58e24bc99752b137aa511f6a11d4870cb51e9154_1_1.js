f    
    var Proteus = require("proteus"),
        Glob    = require("glob"),
        minimatch   = require("minimatch"),
        FS      = require("fs"),
        Path    = require("path"),
        nutil   = require("util"),
        existsSync = FS.existsSync,
        isRegExp = nutil.isRegExp,
        // useful for determining if a string is a glob pattern
        GLOB_PATTERN = /[*?\[\{]/,
        // Short-cut
        AP      = Array.prototype,
        // Methods not to copy over
        EXCLUDE_ARRAY_METHODS = ["length", "constructor", "toString", "valueOf"],
        // List of methods we want to copy over from Array
        ARRAY_METHOD_NAMES = Object.getOwnPropertyNames(AP).filter(
            function (name) {
                var fn;
                if (!~EXCLUDE_ARRAY_METHODS.indexOf(name) &&
                    (fn = typeof AP[name]) === "function"
                ) {
                    return true;
                }
            }
        ),
        // List of methods that mutate an array
        // NOTE: sort and reverse mutate the array, but they do not add members
        ARRAY_MUTATORS = ["pop", "push", "shift", "unshift", "splice"],
        // List of array methods that return a new array
        ARRAY_MAKERS = ["slice", "concat", "filter", "map"],
        // Ignore directories
        DEFAULT_IGNORE_PATTERNS = [
            function (path) {
                try {
                    return FS.statSync(path).isDirectory();
                }
                catch (e) {}
                return false;
            }
        ],
        FileList
    ;

    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    /**
     * Add non-excluded paths to our items
     * 
     * @method addMatching
     * @private
     * @param path {string} glob pattern
     * @returns {function} self
     */
    function addMatching (path) {
        Glob.sync(path).forEach(function (p) {
            if (!this.excludes(p)) {
                resolveAdd.call(this, p);
            }
        }, this);
        return this;
    }
    
    /**
     * @method resolveAdd
     * @private
     * @param path {string} the file path/pattern to add
     * @returns {function} self
     */
    function resolveAdd (path) {
        var items = this.__items__;
        if (GLOB_PATTERN.test(path)) {
            addMatching.call(this, path);
        }
        else if (!~items.indexOf(path)) {
            items.push(path);
        }
        return this;
    }
    
    /**
     * Filter out the excluded items
     * 
     * @method resolveExcludes
     * @private
     * @returns {function} self
     */
    function resolveExcludes () {
        var origItems = this.__items__,
            items = origItems.slice()
        ;
        
        origItems.length = 0;
        
        items.forEach(function (path) {
            if (!this.excludes(path)) {
                origItems.push(path);
            }
        }, this);
        
        return this;
    }
    
    function patternMatchesPath (pattern, path) {
        var isFn = typeof pattern === "function",
            isRe = isRegExp(pattern),
            isGlob = !isFn && !isRe && pattern.match(GLOB_PATTERN)
        ;
        
        if (isFn) {
            return pattern(path);
        }
        else if (isRe) {
            return pattern.test(path);
        }
        else if (isGlob) {
            return minimatch(path, pattern);
        }
        else {
            return (pattern === path);
        }
    }
    
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
    module.exports = FileList = Proteus.Class.derive({
        /**
         * @method init
         * @param rest {string|function|array} paths, glob patterns, array,
         *      or functions that return one of the previous to use as
         *      include values.
         */
        init: function (/* rest */) {
            Object.defineProperties(this, {
                /**
                 * Pending include items
                 * 
                 * @property __pendingAdd__
                 * @type {array}
                 * @private
                 */
                __pendingAdd__: {
                    value: []
                },
                /**
                 * Does the FileList have pending items to resolve?
                 * 
                 * @property __pending__
                 * @type {boolean}
                 * @private
                 */
                __pending__: {
                    value: true,
                    writable: true
                },
                /**
                 * The FileList's internal items list
                 * 
                 * @property __items__
                 * @type {array}
                 * @private
                 */
                __items__: {
                    value: []
                },
                /**
                 * Internal list of exclude patterns.
                 * 
                 * @property __exPats__
                 * @type {array[string|RegExp|function]}
                 * @private
                 */
                __exPats__: {
                    // value: []
                    value: DEFAULT_IGNORE_PATTERNS.slice()
                }
            });
            
            this.include(Proteus.slice(arguments));
        },
        
        /**
         * @method include
         * @param rest (string|function|array) a path to include, a function
         *      that will return a path to include, or an array of paths
         * @returns {function} FileList instance
         */
        include: function () {
            Proteus.slice(arguments).forEach(function (arg) {
                if (Array.isArray(arg)) {
                    return this.include.apply(this, arg);
                }
                else if (typeof arg === "function") {
                    return this.include.apply(this, arg());
                }
                else {
                    this.__pendingAdd__.push(arg);
                }
            }, this);
            
            this.__pending__ = true;
            return this;
        },
        
        /**
         * @method add
         * @alias include
         */
        add: Proteus.aliasMethod("include"),
        
        clearIncludes: function () {
            this.__pendingAdd__.length = 0;
            this.__items__.length = 0;
            return this;
        },
        
        /**
         * Exclude a series of file paths.
         * 
         * @method exclude
         * @param rest {string|function|RegExp} the string, glob pattern,
         *      regular expression, or a function that returns true or false
         *      when passed a path to exclude (true exludes it)
         * @returns {function} FileList instance
         */
        exclude: function () {
            var exPats = this.__exPats__;
            
            Proteus.slice(arguments).forEach(function (arg) {
                exPats.push(arg);
            });
            
            if (!this.__pending__) {
                resolveExcludes.call(this);
            }

            return this;
        },
        
        /**
         * Clear out the exclude patterns and functions.  This will clear
         * out any default patterns or functions too.
         * 
         * @method clearExcludes
         * @returns {function} FileList instance
         */
        clearExcludes: function () {
            this.__exPats__.length = 0;
            return this;
        },
        
        /**
         * If we haven't been resolved, resolve our pending items
         * 
         * @method resolve
         * @returns {function} FileList instance
         */
        resolve: function () {
            var pendAdd = this.__pendingAdd__;
            
            if (this.__pending__) {
                this.__pending__ = false;
                pendAdd.forEach(function (path) {
                    resolveAdd.call(this, path);
                }, this);
                pendAdd.length = 0;
                resolveExcludes.call(this);
            }
            return this;
        },

        
        /**
         * Will the passed path be excluded?
         * 
         * @method excludes
         * @param path {string} file path to see if it will be excluded
         * @returns {boolean}
         */
        excludes: function (path) {
            return this.__exPats__.some(function (pattern) {
                return patternMatchesPath(pattern, path);
            });
        },
        
        toString: function (delim) {
            return this.items.join(delim || " ");
        },
        
        toArray: function () {
            return this.items;
        },
        
        toJSON: function (pretty) {
            return JSON.stringify(this.items, null, pretty && 4);
        },
        
        grep: function (pattern) {
            return this.filter(patternMatchesPath.bind(this, pattern));
        },
        
        get existing () {
            return this.filter(function (path) {
                return existsSync(path);
            });
        },
        
        get notExisting () {
            return this.filter(function (path) {
                return !existsSync(path);
            });
        },
        
        extension: function (ext) {
            return this.grep(function (path) {
                return Path.extname(path) === ext;
            });
        },
        
        clone: function () {
            var dup = new FileList();
            
            this.__pendingAdd__.forEach(function (add) {
                dup.__pendingAdd__.push(add);
            });
            
            this.__items__.forEach(function (item) {
                dup.__items__.push(item);
            });
            
            dup.clearExcludes();

            this.__exPats__.forEach(function (pat) {
                dup.__exPats__.push(pat);
            });
            
            return dup;
        },
        
        dup: Proteus.aliasMethod("clone"),
        
        /**
         * Retrieve a file path from the FileList's items
         * 
         * @method get
         * @param idx {integer} index of the item you want
         * @returns {string}
         */
        get: function (idx) {
            this.resolve();
            return this.__items__[idx];
        },
        
        /**
         * Set a file path at the specified index.
         * 
         * @method set
         * @param idx {integer} index of the item you want to set
         * @param val {string} file path
         */
        set: function (idx, val) {
            this.resolve();
            this.__items__[idx] = val;
            this.__pending__ = true;
        },
        
        /**
         * The length of our resloved list of file paths.
         * 
         * @property length
         * @type {integer}
         */
        get length () {
            this.resolve();
            return this.__items__.length;
        },
        
        set length (amt) {
            this.resolve();
            this.__items__.length = amt;
        },
        
        /**
         * The array of resolved file paths.
         * 
         * @property items
         * @type {array}
         */
        get items () {
            this.resolve();
            return this.__items__.slice();
        }
        
    });
    
    (function () {
        function applyMethod (name, args) {
            return AP[name].apply(this.__items__, args);
        }
        
        function wrapAccessor (name) {
            return function () {
                this.resolve();
                return applyMethod.call(this, name, arguments);
            };
        }
        
        function wrapMutator (name) {
            return function () {
                var ret;
                this.resolve();
                ret = applyMethod.call(this, name, arguments);
                this.__pending__ = true;
                return ret;
            };
        }
        
        function wrapMaker (name) {
            return function () {
                var dup = this.clone(),
                    items
                ;
                
                dup.resolve();
                items = dup.__items__;
                
                items.splice.apply(
                    items,
                    [0, items.length].concat(
                        applyMethod.call(dup, name, arguments)
                    )
                );
                
                return dup;
            };
        }
        
        ARRAY_METHOD_NAMES.forEach(function (name) {
            var fn;
            
            if (~ARRAY_MUTATORS.indexOf(name)) {
                fn = wrapMutator(name);
            }
            else if (~ARRAY_MAKERS.indexOf(name)) {
                fn = wrapMaker(name);
            }
            else {
                fn = wrapAccessor(name);
            }
            
            FileList.prototype[name] = fn;
        });
        
    }());
    
}());