function ($)
{
    // const //
    {
        var UnicodeSyllableStart = 44032;
        var UnicodeFirstStep = 588; // = vowelCount * vowelStep
        var UnicodeVowelStep = 28;  // = lastCount
        var UnicodeLastStep  = 1;
        
        /**
         * map keyboard keys to name
        **/
        var layout = [
            { q : 'B',  w : 'J',  e : 'D',  r : 'G',  t : 'S',  y : 'Yo', u : 'Yeo', i : 'Ya', o : 'Ae', p : 'E', backspace : '&larr;' },
            { a : 'M',  s : 'N',  d : 'Ng', f : 'R',  g : 'H',  h : 'O',  j : 'Eo',  k : 'A',  l : 'I',           shift     : '&uarr;' },
            { z : 'Kh', x : 'Th', c : 'Ch', v : 'Ph', b : 'Yu', n : 'U',  m : 'Eu',                               spacebar  : '_'      }
        ];
        var LAYOUT = [
            { Q : 'BB', W : 'JJ', E : 'DD', R : 'GG', T : 'SS', Y : 'Yo', U : 'Yeo', I : 'Ya', O : 'Yae', P : 'Ye', BACKSPACE : '&larr;' },
            { A : 'M',  S : 'N',  D : 'Ng', F : 'R',  G : 'H',  H : 'O',  J : 'Eo',  K : 'A',  L : 'I',             SHIFT     : '&uarr;' },
            { Z : 'Kh', X : 'Th', C : 'Ch', V : 'Ph', B : 'Yu', N : 'U',  M : 'Eu',                                 SPACEBAR  : '_'      }
        ];
        
        // TODO: add enter button
        /*
        var layout = [
            { q : 'B',  w : 'J',  e : 'D',  r : 'G',  t : 'S',  y : 'Yo', u : 'Yeo', i : 'Ya', o : 'Ae', p : 'E', backspace : '&larr;'   },
            { a : 'M',  s : 'N',  d : 'Ng', f : 'R',  g : 'H',  h : 'O',  j : 'Eo',  k : 'A',  l : 'I',           enter     : '&#x21b5;' },
            { z : 'Kh', x : 'Th', c : 'Ch', v : 'Ph', b : 'Yu', n : 'U',  m : 'Eu',             shift : '&uarr;', spacebar  : '_'        }
        ];
        var LAYOUT = [
            { Q : 'BB', W : 'JJ', E : 'DD', R : 'GG', T : 'SS', Y : 'Yo', U : 'Yeo', I : 'Ya', O : 'Yae', P : 'Ye', BACKSPACE : '&larr;'   },
            { A : 'M',  S : 'N',  D : 'Ng', F : 'R',  G : 'H',  H : 'O',  J : 'Eo',  K : 'A',  L : 'I',             ENTER     : '&#X21B5;' },
            { Z : 'Kh', X : 'Th', C : 'Ch', V : 'Ph', B : 'Yu', N : 'U',  M : 'Eu',               SHIFT : '&uarr;', SPACEBAR  : '_'        }
        ];
        */
    }
    
    // private //
    {
        /**
         *  interface Jamo
         *  {
         *      integer? first;
         *      integer? vowel;
         *      integer? last;
         *      string   hangul;
         *      string?  cyril;
         *
         *      boolean Jamo::exists (string name);
         *      Jamo    Jamo::get    (string name);
         *  }
        **/
        var Jamo = (function()
        {
            // const //
            {
                /**
                 *  {
                 *      <name> : {
                 *          [first : <offset>,]
                 *          [vowel : <offset>,]
                 *          [last  : <offset>,]
                 *          hangul : <...>,
                 *          [cyril : <...>,]
                 *      },
                 *      ...
                 *  }
                **/
                var JamoInfo = {
                    G   : { first :  0, last :  1, hangul : '???', cyril : '??'   },
                    GG  : { first :  1, last :  2, hangul : '???', cyril : '????'  },
                    GS  : {             last :  3, hangul : '???' },
                    N   : { first :  2, last :  4, hangul : '???', cyril : '??'   },
                    NJ  : {             last :  5, hangul : '???' },
                    NH  : {             last :  6, hangul : '???' },
                    D   : { first :  3, last :  7, hangul : '???', cyril : '??'   },
                    DD  : { first :  4,            hangul : '???', cyril : '????'  },
                    R   : { first :  5, last :  8, hangul : '???', cyril : '??/??' },
                    RG  : {             last :  9, hangul : '???' },
                    RM  : {             last : 10, hangul : '???' },
                    RB  : {             last : 11, hangul : '???' },
                    RS  : {             last : 12, hangul : '???' },
                    RTh : {             last : 13, hangul : '???' },
                    RPh : {             last : 14, hangul : '???' },
                    RH  : {             last : 15, hangul : '???' },
                    M   : { first :  6, last : 16, hangul : '???', cyril : '??'    },
                    B   : { first :  7, last : 17, hangul : '???', cyril : '??'    },
                    BB  : { first :  8,            hangul : '???', cyril : '????'   },
                    BS  : {             last : 18, hangul : '???' },
                    S   : { first :  9, last : 19, hangul : '???', cyril : '??'    },
                    SS  : { first : 10, last : 20, hangul : '???', cyril : '????'   },
                    Ng  : { first : 11, last : 21, hangul : '???', cyril : '-/????' },
                    J   : { first : 12, last : 22, hangul : '???', cyril : '????'   },
                    JJ  : { first : 13,            hangul : '???', cyril : '????'   },
                    Ch  : { first : 14, last : 23, hangul : '???', cyril : '????'   },
                    Kh  : { first : 15, last : 24, hangul : '???', cyril : '????'   },
                    Th  : { first : 16, last : 25, hangul : '???', cyril : '????'   },
                    Ph  : { first : 17, last : 26, hangul : '???', cyril : '????'   },
                    H   : { first : 18, last : 27, hangul : '???', cyril : '??'    },
                    
                    A   : { vowel :  0,            hangul : '???', cyril : '??'  }, 
                    Ae  : { vowel :  1,            hangul : '???', cyril : '??'  }, 
                    Ya  : { vowel :  2,            hangul : '???', cyril : '??'  }, 
                    Yae : { vowel :  3,            hangul : '???', cyril : '????' },
                    Eo  : { vowel :  4,            hangul : '???', cyril : '??'  }, 
                    E   : { vowel :  5,            hangul : '???', cyril : '??'  },
                    Yeo : { vowel :  6,            hangul : '???', cyril : '????' },
                    Ye  : { vowel :  7,            hangul : '???', cyril : '????' },
                    O   : { vowel :  8,            hangul : '???', cyril : '??'  },
                    OA  : { vowel :  9,            hangul : '???' },
                    OAe : { vowel : 10,            hangul : '???' },
                    OI  : { vowel : 11,            hangul : '???' },
                    Yo  : { vowel : 12,            hangul : '???', cyril : '??' },
                    U   : { vowel : 13,            hangul : '???', cyril : '??' },
                    UEo : { vowel : 14,            hangul : '???' },
                    UE  : { vowel : 15,            hangul : '???' },
                    UI  : { vowel : 16,            hangul : '???' },
                    Yu  : { vowel : 17,            hangul : '???', cyril : '??' },
                    Eu  : { vowel : 18,            hangul : '???', cyril : '??' },
                    EuI : { vowel : 19,            hangul : '???' },
                    I   : { vowel : 20,            hangul : '???', cyril : '??' }
                };
            }
            
            // constructor //
            var Jamo = function Jamo (name)
            {
                if (! name in JamoInfo)
                {
                    throw new Error ('Jamo: name = "' + name + '", not in JamoInfo');
                }
                
                this.name = name;
                for (var property in JamoInfo[name])
                {
                    if (! JamoInfo[name].hasOwnProperty(property))
                    {
                        continue;
                    }
                    this[property] = JamoInfo[name][property];
                }
            };
            
            // static var //
            {
                var registry = {};
            }
            
            // static public //
            {
                Jamo.exists = function exists (name)
                {
                    return typeof JamoInfo[name] !== 'undefined';
                };
                
                Jamo.get = function get (name)
                {
                    if (typeof registry[name] === 'undefined')
                    {
                        registry[name] = new Jamo (name);
                    }
                    return registry[name];
                };
            }
            
            return Jamo;
        })();
    
        var Syllable = function Syllable (previous)
        {
            // init //
            {
                if (! this instanceof Syllable)
                {
                    return new Syllable (previous);
                }
                
                if (previous)
                {
                    if (! previous instanceof Syllable)
                    {
                        throw new TypeError ('Syllable: previous must be instance of Syllable');
                    }
                }
            }
            
            // const //
            {
                var PART_FIRST = 1;
                var PART_VOWEL = 2;
                var PART_LAST  = 3;
            }
            
            // var //
            {
                /**
                 *  {
                 *      <PART_FIRST> : [Jamo, Jamo],
                 *      <PART_VOWEL> : [Jamo, Jamo],
                 *      <PART_LAST>  : [Jamo, Jamo]
                 *  }
                **/
                var queue = {};
                var prevSyllable, // instanceof Syllable
                    thisSyllable = this,
                    nextSyllable; // instanceof Syllable
                
                /**
                 *  {
                 *      <PART_FIRST> : Jamo,
                 *      <PART_VOWEL> : Jamo,
                 *      <PART_LAST>  : Jamo
                 *  }
                **/
                var compiled = {};
                var hangul = ''; // string
            }
            
            // private //
            {
                var makeHangul = function makeHangul()
                {
                    if (compiled[PART_FIRST])
                    {
                        if (compiled[PART_VOWEL])
                        {
                            // assert: a syllable.
                            var code =
                                UnicodeSyllableStart +
                                compiled[PART_FIRST].first * UnicodeFirstStep +
                                compiled[PART_VOWEL].vowel * UnicodeVowelStep
                            ;
                            if (compiled[PART_LAST])
                            {
                                code += compiled[PART_LAST].last;
                            }
                            hangul = String.fromCharCode (code);
                        }
                        else
                        {
                            // assert: a single first.
                            hangul = compiled[PART_FIRST].hangul;
                        }
                    }
                    else if (compiled[PART_VOWEL])
                    {
                        // assert: a single vowel
                        hangul = compiled[PART_VOWEL].hangul;
                    }
                    else
                    {
                        hangul = '';
                    }
                };
            
                var compilePart = function compilePart (part)
                {
                    if (! (part === PART_FIRST || part === PART_VOWEL || part === PART_LAST))
                    {
                        throw new Error ('Syllable/compilePart: part must be one of PART_FIRST, PART_VOWEL, PART_LAST');
                    }
                    
                    if (queue[part].length > 1)
                    {
                        var compiledName = queue[part][0].name + queue[part][1].name;
                        if (! Jamo.exists (compiledName))
                        {
                            throw new Error ('Syllable/compilePart: compiledName does not exist in Jamo');
                        }
                        compiled[part] = Jamo.get (compiledName);
                    }
                    else if (queue[part].length > 0)
                    {
                        compiled[part] = queue[part][0];
                    }
                    else
                    {
                        compiled[part] = null;
                    }
                    makeHangul();
                };
            }
            
            // public //
            {
                /**
                 *  @param  {Jamo}      jamo
                 *  @return {Syllable}  reference to the new tail.
                **/
                this.append = function append (jamo)
                {
                    if (! jamo instanceof Jamo)
                    {
                        throw new TypeError ('Syllable.append: jamo must be instance of Jamo');
                    }
                    if (nextSyllable)
                    {
                        return nextSyllable.append (jamo);
                    }
                    
                    if (typeof jamo.vowel !== 'undefined')
                    {
                        // assert: jamo is a vowel.
                        if (queue[PART_LAST].length > 0)
                        {
                            // Detach last.
                            var nextFirst = queue[PART_LAST].pop();
                            compilePart (PART_LAST);
                            
                            if (typeof nextFirst.first === 'undefined')
                            {
                                throw new Error ('Syllable.append: nextFirst.first is undefined');
                            }
                            
                            // Compose next.
                            nextSyllable = new Syllable (this);
                            nextSyllable.append (nextFirst);
                            return nextSyllable.append (jamo);
                        }
                        else if (queue[PART_VOWEL].length > 1)
                        {
                            // No place for jamo. Compose next.
                            nextSyllable = new Syllable (this);
                            return nextSyllable.append (jamo);
                        }
                        else if (queue[PART_VOWEL].length > 0)
                        {
                            // jamo either can be combined with vowel or not.
                            var combinedName = queue[PART_VOWEL][0].name + jamo.name;
                            if (Jamo.exists (combinedName))
                            {
                                // combinable.
                                queue[PART_VOWEL].push (jamo);
                                compilePart (PART_VOWEL);
                                return this;
                            }
                            else
                            {
                                // Not combinable. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else
                        {
                            // assert: no vowel in the current syllable.
                            if (queue[PART_FIRST].length > 1)
                            {
                                // first either can start a syllable or not.
                                if (typeof compiled[PART_FIRST].first !== 'undefined')
                                {
                                    // first can start a syllable. add vowel.
                                    queue[PART_VOWEL].push (jamo);
                                    compilePart (PART_VOWEL);
                                    return this;
                                }
                                else
                                {
                                    // first cannot start a syllable. detach one.
                                    var nextFirst = queue[PART_FIRST].pop();
                                    compilePart (PART_FIRST);
                                    
                                    if (typeof nextFirst.first === 'undefined')
                                    {
                                        throw new Error ('Syllable.append: nextFirst.first is undefined');
                                    }
                                    
                                    // Compose next.
                                    nextSyllable = new Syllable (this);
                                    nextSyllable.append (nextFirst);
                                    return nextSyllable.append (jamo);
                                }
                            }
                            else
                            {
                                queue[PART_VOWEL].push (jamo);
                                compilePart (PART_VOWEL);
                                return this;
                            }
                        }
                    }
                    else
                    {
                        // jamo is a consonant.
                        if (queue[PART_LAST].length > 1)
                        {
                            // No place for consonant. Compose next.
                            nextSyllable = new Syllable (this);
                            return nextSyllable.append (jamo);
                        }
                        else if (queue[PART_LAST].length > 0)
                        {
                            // jamo either can be combined with last or not.
                            var combinedName = queue[PART_LAST][0].name + jamo.name;
                            if (Jamo.exists (combinedName) && 
                                typeof Jamo.get (combinedName).last !== 'undefined'
                            ) {
                                // combinable.
                                queue[PART_LAST].push (jamo);
                                compilePart (PART_LAST);
                                return this;
                            }
                            else
                            {
                                // Not combinable. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else if (queue[PART_VOWEL].length > 0)
                        {
                            // vowel is either single or in a syllable.
                            if (queue[PART_FIRST].length > 0)
                            {
                                // A syllable. jamo either can be last or not.
                                if (typeof jamo.last !== 'undefined')
                                {
                                    // Append as last.
                                    queue[PART_LAST].push (jamo);
                                    compilePart (PART_LAST);
                                    return this;
                                }
                                else
                                {
                                    // Not appendable. Compose next.
                                    nextSyllable = new Syllable (this);
                                    return nextSyllable.append (jamo);
                                }
                            }
                            else
                            {
                                // A single vowel. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else if (queue[PART_FIRST].length > 0)
                        {
                            // jamo either can be combined with first or not.
                            var combinedName = queue[PART_FIRST][0].name + jamo.name;
                            if (Jamo.exists (combinedName))
                            {
                                // combinable.
                                queue[PART_FIRST].push (jamo);
                                compilePart (PART_FIRST);
                                return this;
                            }
                            else
                            {
                                // Not combinable. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else
                        {
                            // assert: current syllable is empty.
                            if (typeof jamo.first === 'undefined')
                            {
                                throw new Error ('Syllable.append: jamo.first is undefined');
                            }
                            queue[PART_FIRST].push (jamo);
                            compilePart (PART_FIRST);
                            return this;
                        }
                    }
                };
                
                /**
                 *  @return {Syllable}  reference to the new tail.
                **/
                this.deleteJamo = (function()
                {
                    // const //
                    var removeOrder = [PART_LAST, PART_VOWEL, PART_FIRST];
                    
                    // body //
                    return function deleteJamo ()
                    {
                        if (nextSyllable)
                        {
                            var tail = nextSyllable.deleteJamo();
                            if (tail === thisSyllable)
                            {
                                nextSyllable = null;
                            }
                            return tail;
                        }
                        
                        for (var i = 0; i < removeOrder.length; ++i)
                        {
                            if (queue[removeOrder[i]].length > 0)
                            {
                                queue[removeOrder[i]].pop();
                                compilePart(removeOrder[i]);
                                break;
                            }
                        }
                        
                        if (! hangul.length)
                        {
                            // Syllable is empty, delete it.
                            return prevSyllable;
                        }
                        
                        // Syllable is not empty, it is still the tail.
                        return thisSyllable;
                    };
                })();
                
                this.deleteSyllable = function deleteSyllable()
                {
                    if (nextSyllable)
                    {
                        var tail = nextSyllable.deleteSyllable();
                        if (tail === thisSyllable)
                        {
                            nextSyllable = null;
                        }
                        return tail;
                    }
                    else
                    {
                        return prevSyllable;
                    }
                };
                
                this.toString = function toString()
                {
                    return hangul;
                };
            
                this.getNext = function getNext()
                {
                    return nextSyllable;
                };
            }
        
            // constructor //
            {
                prevSyllable = previous;
                
                queue[PART_FIRST] = [];
                queue[PART_VOWEL] = [];
                queue[PART_LAST]  = [];
                
                compiled[PART_FIRST] = null;
                compiled[PART_VOWEL] = null;
                compiled[PART_LAST]  = null;
            }
        };
        
        var SyllableChain = function SyllableChain()
        {
            // var //
            {
                var head, // instanceof Syllable
                    tail; // instanceof Syllable
                var hangul = '';
            }
            
            // private //
            {
                var makeHangul = function makeHangul()
                {
                    var result = '';
                    if (head)
                    {
                        for (var syllable = head; syllable; syllable = syllable.getNext())
                        {
                            result += syllable;
                        }
                    }
                    hangul = result;
                };
            }
            
            // public //
            {
                this.append = function append (jamo)
                {
                    if (! jamo instanceof Jamo)
                    {
                        throw new TypeError ('SyllableChain.append: jamo must be instance of Jamo');
                    }
                    
                    if (! head)
                    {
                        head = tail = new Syllable;
                    }
                    tail = tail.append (jamo);
                    makeHangul();
                };
                
                this.deleteJamo = function deleteJamo ()
                {
                    if (! head)
                    {
                        return;
                    }
                    var newTail = head.deleteJamo();
                    if (! newTail)
                    {
                        head = tail = null;
                    }
                    else
                    {
                        tail = newTail;
                    }
                    makeHangul();
                };
                
                this.deleteSyllable = function deleteSyllable ()
                {
                    if (! head)
                    {
                        return;
                    }
                    var newTail = head.deleteSyllable();
                    if (! newTail)
                    {
                        head = tail = null;
                    }
                    else
                    {
                        tail = newTail;
                    }
                    makeHangul();
                };
                
                this.toString = function toString()
                {
                    return hangul;
                }
            }
        };
    }
            
    // methods //
    return {
        init : function ()
        {
            // init //
            {
                if (typeof $.fn.selection === 'undefined')
                {
                    throw new Error ('jQuery.fn.hangulEntry: required plugin (jQuery.fn.selection) is not defined');
                }
            }
            
            // var //
            {
                // elements //
                var input    = this;
                
                var entry    = $('<div class="hangulEntry"></div>');
                var tumbler  = $('<button class="tumbler"></button>');
                var keyboard = $('<div class="keyboard"></div>');
                
                // lowercase tab and uppercase tab
                var lowerTab = $('<div class="lower case"></div>');
                var upperTab = $('<div class="upper case"></div>');
                var currentTab = lowerTab;
                
                // handlers //
                var selectionPlugin = input.selection();
                
                // input data //
                var syllableChain = new SyllableChain;
                
                // state //
                var keyboardShown;
            }
            
            // private //
            {
                var spawnTab = (function()
                {
                    // var //
                    {
                        var prevSelection; // instanceof Selection
                        var depressShift;  // boolean
                    }
                    
                    // private //
                    {
                        // implementation //
                        {
                            var redrawQueue = function redrawQueue()
                            {
                                return selectionPlugin.replace (syllableChain.toString());
                            };
                            
                            /**
                             * Simulate standard backspace behaviour in the input:
                             *  - if no selection is set, select a character preceeding the cursor's position.
                             *  - wipe current selection clean.
                            **/
                            var simulateBackspace = function simulateBackspace()
                            {
                                var selection = selectionPlugin.get();
                                if (! selection.length)
                                {
                                    // Select preceeding character, if any.
                                    if (selection.start)
                                    {
                                        selection = selectionPlugin.set (selection.start - 1, selection.end);
                                    }
                                }
                                
                                // Wipe out selection contents.
                                return selectionPlugin.replace('');
                            };
                        }
                        
                        // performed actions //
                        {
                            // characters
                            var addJamo = function addJamo (jamo)
                            {
                                var selection = selectionPlugin.get();
                                if (prevSelection && ! selection.isEqual (prevSelection))
                                {
                                    // Discard jamo data from the chain which was unselected.
                                    syllableChain = new SyllableChain;
                                }
                                
                                syllableChain.append (jamo);
                                prevSelection = redrawQueue();
                                
                                if (depressShift)
                                {
                                    showLowerTab();
                                }
                            };
                            
                            // backspace
                            var deleteJamo = function deleteJamo()
                            {
                                var selection = selectionPlugin.get();
                                if (! selection.length ||
                                    (prevSelection && ! selection.isEqual (prevSelection))
                                ) {
                                    // Discard jamo data from the chain which was unselected.
                                    syllableChain = new SyllableChain;
                                    
                                    // Simulate the backspace event to the input.
                                    prevSelection = simulateBackspace();
                                }
                                else
                                {
                                    syllableChain.deleteJamo();
                                    prevSelection = redrawQueue();
                                }
                                if (depressShift)
                                {
                                    showLowerTab();
                                }
                            };
                            
                            // BACKSPACE
                            var deleteSyllable = function deleteSyllable()
                            {
                                var selection = selectionPlugin.get();
                                if (! selection.length ||
                                    (prevSelection && ! selection.isEqual (prevSelection))
                                ) {
                                    // Discard jamo data from the chain which was unselected.
                                    syllableChain = new SyllableChain;
                                    
                                    // Simulate the backspace event to the input.
                                    prevSelection = simulateBackspace();
                                }
                                else
                                {
                                    syllableChain.deleteSyllable();
                                    prevSelection = redrawQueue();
                                }
                                if (depressShift)
                                {
                                    showLowerTab();
                                }
                            };
                            
                            // shift
                            var getShowUpperTab = function getShowUpperTab (keydown)
                            {
                                return function showUpperTab()
                                {
                                    if (currentTab === upperTab)
                                    {
                                        return;
                                    }
                                    currentTab.hide();
                                    currentTab = upperTab;
                                    currentTab.show();
                                    
                                    if (prevSelection)
                                    {
                                        // For some reason selection resets in FF.
                                        // Restore it to avoid removal of input contents.
                                        selectionPlugin.set (prevSelection.start, prevSelection.end);
                                    }
                                    
                                    /**
                                     * If shift is being clicked on the screen, it should be depressed after
                                     * the next input. Otherwise it is preserved.
                                    **/
                                    depressShift = ! keydown;
                                };
                            };
                            
                            // SHIFT
                            var showLowerTab = function showLowerTab()
                            {
                                if (currentTab === lowerTab)
                                {
                                    return;
                                }
                                currentTab.hide();
                                currentTab = lowerTab;
                                currentTab.show();
                                
                                if (prevSelection)
                                {
                                    // For some reason selection resets in FF.
                                    // Restore it to avoid removal of input contents.
                                    selectionPlugin.set (prevSelection.start, prevSelection.end);
                                }
                            };
                            
                            // space/SPACE
                            var insertSpace = function insertSpace()
                            {
                                var selection = selectionPlugin.get();
                                if (! (prevSelection && ! selection.isEqual (prevSelection)))
                                {
                                    selection = selectionPlugin.set (selection.end, selection.end);
                                }
                                
                                // Discard jamo data.
                                syllableChain = new SyllableChain;
                                selection = selectionPlugin.replace(' ');
                                prevSelection = selectionPlugin.set (selection.end, selection.end);
                                
                                if (depressShift)
                                {
                                    showLowerTab();
                                }
                            };
                        }
                        
                        // attached handlers //
                        {
                            var getJamoHandler = function getJamoHandler (jamo)
                            {
                                return function ()
                                {
                                    addJamo (jamo);
                                };
                            }
                            
                            /**
                             *  @param  {string}    key     key from layout/LAYOUT consts.
                             *  @param  {boolean}   keydown whether it is keydown event that is being handled.
                            **/
                            var getSpecialHandler = function getSpecialHandler (key, keydown)
                            {
                                if (key === 'backspace')
                                {
                                    return deleteJamo;
                                }
                                if (key === 'BACKSPACE')
                                {
                                    return deleteSyllable;
                                }
                                if (key === 'shift')
                                {
                                    return getShowUpperTab (keydown);
                                }
                                if (key === 'SHIFT')
                                {
                                    return showLowerTab;
                                }
                                if (key === 'spacebar' || key === 'SPACEBAR')
                                {
                                    return insertSpace;
                                }
                            };
                        
                            var decorateHandler = function decorateHandler (handler)
                            {
                                return function onPress ()
                                {
                                    $(this)
                                        .css        ({ backgroundColor : '#aff' })
                                        .animate    ({ backgroundColor : '#fff' })
                                    ;
                                    handler();
                                }
                            };
                        }
                    }
                    
                    // body //
                    return function spawnTab (layoutVariant, caseTab)
                    {
                        for (var lineNum = 0, lineCount = layoutVariant.length; lineNum < lineCount; ++lineNum)
                        {
                            var lineDiv = $('<div class="line line' + lineNum  + '"></div>');
                            for (var key in layoutVariant[lineNum])
                            {
                                if (! layoutVariant[lineNum].hasOwnProperty (key))
                                {
                                    continue;
                                }
                                
                                var name = layoutVariant[lineNum][key];
                                var inner = '';
                                var handler = false;
                                if (Jamo.exists (name))
                                {
                                    // jamo
                                    var jamo = Jamo.get (name);
                                    handler = getJamoHandler (jamo);
                                    inner =
                                        '<table class="key">' +
                                            '<tr>' +
                                                '<td align="center">' + key + '</td>' +
                                                '<td align="center">' + jamo.hangul + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                                '<td></td>' +
                                                '<td align="center">' + jamo.cyril + '</td>' +
                                            '</tr>' +
                                        '</table>'
                                    ;
                                }
                                else
                                {
                                    // specials
                                    inner = '<table class="key special"><tr><td>' + name + ' ' + key + '</td></tr></table>';
                                    handler = getSpecialHandler (key);
                                }
                                
                                var keyDiv = $(inner);
                                if (handler)
                                {
                                    keyDiv.click (decorateHandler (handler));
                                }
                                lineDiv.append (keyDiv);
                            }
                            caseTab.append (lineDiv);
                        }
                        caseTab.append ($('<br class="clear"/>'));
                        return caseTab;
                    };
                })();
            
                var showKeyboard = function()
                {
                    tumbler
                        .removeClass ('hide')
                        .addClass ('show')
                        .text ('hide keyboard')
                    ;
                    keyboard.show();
                    keyboardShown = true;
                };
                
                var hideKeyboard = function ()
                {
                    tumbler
                        .removeClass ('show')
                        .addClass ('hide')
                        .text ('show keyboard')
                    ;
                    keyboard.hide();
                    keyboardShown = false;
                };
                
                var tumblerClick = function ()
                {
                    if (keyboardShown)
                    {
                        hideKeyboard();
                    }
                    else
                    {
                        showKeyboard();
                    }
                    return false;
                };
            }
            
            // constructor //
            {
                tumbler.click (tumblerClick);
                entry.append (tumbler);
                
                // TODO: preserve keyboard state after posting.
                hideKeyboard();
                
                // TODO: determine whether input is multiline and add enter button if it is.
                keyboard.append (spawnTab (layout, lowerTab));
                keyboard.append (spawnTab (LAYOUT, upperTab));
                entry.append (keyboard);
                
                input.after (entry);
                
                currentTab.show();
                entry.show();
                
                // TODO: listen to keyboard events when keyboard is shown.
            }
        }
    };
    
}