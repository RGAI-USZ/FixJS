function() {
  var ACCESSOR, CoffeeScript, Module, REPL_PROMPT, REPL_PROMPT_CONTINUATION, REPL_PROMPT_MULTILINE, SIMPLEVAR, Script, autocomplete, backlog, completeAttribute, completeVariable, enableColours, error, getCompletions, inspect, multilineMode, readline, repl, stdin, stdout;

  stdin = process.openStdin();

  stdout = process.stdout;

  CoffeeScript = require('./coffee-script');

  readline = require('readline');

  inspect = require('util').inspect;

  Script = require('vm').Script;

  Module = require('module');

  REPL_PROMPT = 'coffee> ';

  REPL_PROMPT_MULTILINE = '------> ';

  REPL_PROMPT_CONTINUATION = '......> ';

  enableColours = false;

  if (process.platform !== 'win32') {
    enableColours = !process.env.NODE_DISABLE_COLORS;
  }

  error = function(err) {
    return stdout.write((err.stack || err.toString()) + '\n');
  };

  if (readline.createInterface.length < 3) {
    repl = readline.createInterface(stdin, autocomplete);
    stdin.on('data', function(buffer) {
      return repl.write(buffer);
    });
  } else {
    repl = readline.createInterface(stdin, stdout, autocomplete);
  }

  process.on('uncaughtException', error);

  backlog = '';

  multilineMode = false;

  repl.input.on('keypress', function(char, key) {
    var cursorPos, newPrompt;
    if (!(key && key.ctrl && !key.meta && !key.shift && key.name === 'v')) return;
    cursorPos = repl.cursor;
    repl.output.cursorTo(0);
    repl.output.clearLine(1);
    multilineMode = !multilineMode;
    backlog = '';
    repl.setPrompt((newPrompt = multilineMode ? REPL_PROMPT_MULTILINE : REPL_PROMPT));
    repl.prompt();
    return repl.output.cursorTo(newPrompt.length + (repl.cursor = cursorPos));
  });

  repl.input.on('keypress', function(char, key) {
    if (!(multilineMode && repl.line)) return;
    if (!(key && key.ctrl && !key.meta && !key.shift && key.name === 'd')) return;
    multilineMode = false;
    return repl._line();
  });

  repl.on('attemptClose', function() {
    if (multilineMode) {
      multilineMode = false;
      repl.output.cursorTo(0);
      repl.output.clearLine(1);
      repl._onLine(repl.line);
      return;
    }
    if (backlog) {
      backlog = '';
      repl.output.write('\n');
      repl.setPrompt(REPL_PROMPT);
      return repl.prompt();
    } else {
      return repl.close();
    }
  });

  repl.on('close', function() {
    repl.output.write('\n');
    return repl.input.destroy();
  });

  repl.on('line', function(buffer) {
    var code, returnValue, _;
    if (multilineMode) {
      backlog += "" + buffer + "\n";
      repl.setPrompt(REPL_PROMPT_CONTINUATION);
      repl.prompt();
      return;
    }
    if (!buffer.toString().trim() && !backlog) {
      repl.prompt();
      return;
    }
    code = backlog += buffer;
    if (code[code.length - 1] === '\\') {
      backlog = "" + backlog.slice(0, -1) + "\n";
      repl.setPrompt(REPL_PROMPT_CONTINUATION);
      repl.prompt();
      return;
    }
    repl.setPrompt(REPL_PROMPT);
    backlog = '';
    try {
      _ = global._;
      returnValue = CoffeeScript.eval("_=(" + code + "\n)", {
        filename: 'repl',
        modulename: 'repl'
      });
      if (returnValue === void 0) global._ = _;
      repl.output.write("" + (inspect(returnValue, false, 2, enableColours)) + "\n");
    } catch (err) {
      error(err);
    }
    return repl.prompt();
  });

  repl.setPrompt(REPL_PROMPT);

  repl.prompt();

  ACCESSOR = /\s*([\w\.]+)(?:\.(\w*))$/;

  SIMPLEVAR = /(\w+)$/i;

  autocomplete = function(text) {
    return completeAttribute(text) || completeVariable(text) || [[], text];
  };

  completeAttribute = function(text) {
    var all, completions, match, obj, prefix, val;
    if (match = text.match(ACCESSOR)) {
      all = match[0], obj = match[1], prefix = match[2];
      try {
        val = Script.runInThisContext(obj);
      } catch (error) {
        return;
      }
      completions = getCompletions(prefix, Object.getOwnPropertyNames(Object(val)));
      return [completions, prefix];
    }
  };

  completeVariable = function(text) {
    var completions, free, keywords, possibilities, r, vars, _ref;
    free = (_ref = text.match(SIMPLEVAR)) != null ? _ref[1] : void 0;
    if (text === "") free = "";
    if (free != null) {
      vars = Script.runInThisContext('Object.getOwnPropertyNames(Object(this))');
      keywords = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = CoffeeScript.RESERVED;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          r = _ref2[_i];
          if (r.slice(0, 2) !== '__') _results.push(r);
        }
        return _results;
      })();
      possibilities = vars.concat(keywords);
      completions = getCompletions(free, possibilities);
      return [completions, free];
    }
  };

  getCompletions = function(prefix, candidates) {
    var el, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = candidates.length; _i < _len; _i++) {
      el = candidates[_i];
      if (el.indexOf(prefix) === 0) _results.push(el);
    }
    return _results;
  };

}