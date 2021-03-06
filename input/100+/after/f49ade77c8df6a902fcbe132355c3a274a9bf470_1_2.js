function() {
    var DESCRIBE_TYPE, IT_BLOCK_START, IT_TYPE, PASSED_IT_BLOCK;

    IT_BLOCK_START = '[3';

    PASSED_IT_BLOCK = '2';

    IT_TYPE = 'it';

    DESCRIBE_TYPE = 'describe';

    function ParsedMessage(message, projectName) {
      this.projectName = projectName;
      this.isSyntaxError = false;
      this.isAllGreen = false;
      this.isFailure = false;
      this.parse(message);
    }

    ParsedMessage.prototype.parse = function(message) {
      if (this.containsSyntaxError(message)) {
        return this.isSyntaxError = true;
      } else {
        return this.parseTestResults(message);
      }
    };

    ParsedMessage.prototype.containsSyntaxError = function(message) {
      return message.indexOf('SyntaxError:') !== -1;
    };

    ParsedMessage.prototype.parseTestResults = function(message) {
      var failureStacktraces, jasmineFailures, verboseSpecs;
      jasmineFailures = this.parseFailures(message);
      if (jasmineFailures != null) {
        this.isFailure = true;
        verboseSpecs = jasmineFailures[1];
        failureStacktraces = jasmineFailures[2];
        return this.extractFailureInformation(verboseSpecs, failureStacktraces);
      } else {
        return this.isAllGreen = true;
      }
    };

    ParsedMessage.prototype.extractFailureInformation = function(verboseSpecs, failureStacktraces) {
      var line, lines, match, spec, specName, _i, _len;
      console.log(verboseSpecs);
      console.log(failureStacktraces);
      this.extractErrorInformation(failureStacktraces);
      this.specs = [];
      lines = verboseSpecs.split("\n");
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (match = line.match(/^(\w+)/)) {
          specName = match[1];
          console.log(specName);
          spec = {
            specName: specName,
            children: [],
            passed: true
          };
          this.specs.push(spec);
        } else {
          if (this.isItBlock(line)) {
            this.addItBlock(line, spec);
          } else {
            this.addDescribeBlock(line, spec);
          }
        }
      }
      return console.log(this.specs);
    };

    ParsedMessage.prototype.isItBlock = function(line) {
      return line.indexOf(IT_BLOCK_START) !== -1;
    };

    ParsedMessage.prototype.addItBlock = function(line, spec) {
      var error, itBlock, message, passed;
      message = line.match(/\[3[12]m\s*([\s\S]+).\[0m/)[1];
      console.log('Message:' + message);
      if (this.isPassedSpec(line)) {
        passed = true;
        error = null;
      } else {
        passed = false;
        spec.passed = false;
      }
      itBlock = {
        message: message,
        passed: passed,
        type: IT_TYPE,
        error: error
      };
      return spec.children.push(itBlock);
    };

    ParsedMessage.prototype.addDescribeBlock = function(line, spec) {
      var describeBlock, message;
      if (line === "") {
        return;
      }
      message = line.match(/\s*([\s\S]+)/)[1];
      describeBlock = {
        message: message,
        type: DESCRIBE_TYPE
      };
      return spec.children.push(describeBlock);
    };

    ParsedMessage.prototype.isPassedSpec = function(line) {
      return line.indexOf(IT_BLOCK_START + PASSED_IT_BLOCK) !== -1;
    };

    ParsedMessage.prototype.extractBlockInformation = function(verboseSpecs) {
      console.log(verboseSpecs);
      return null;
    };

    ParsedMessage.prototype.extractSpecName = function(verboseSpecs) {
      var specName;
      return specName = verboseSpecs.match(/(\S+)\s/)[1];
    };

    ParsedMessage.prototype.parseFailures = function(message) {
      return message.match(/(.+\n.\[3[12]m[\s\S]*)Failures:\s([\s\S]*)\n+Finished/m);
    };

    ParsedMessage.prototype.extractErrorInformation = function(failureStacktraces) {
      var failures,
        _this = this;
      this.errors = [];
      this.failedTests = [];
      failures = failureStacktraces.split("\n\n");
      return failures.each(function(failure) {
        var error;
        error = _this.parseFailure(failure);
        _this.errors.push(error);
        return _this.failedTests.push(error.fileName);
      });
    };

    ParsedMessage.prototype.parseFailure = function(failure) {
      var error, matches, message, stacktrace;
      matches = failure.match(/Message:\s([\s\S]+?)Stacktrace:[\s\S]*?(at[\s\S]*)/m);
      message = matches[1];
      stacktrace = matches[2];
      error = this.parseStackTrace(stacktrace);
      error.message = this.sanitizeErrorMessage(message);
      return error;
    };

    ParsedMessage.prototype.parseStackTrace = function(stacktrace) {
      var error, traces,
        _this = this;
      traces = stacktrace.split("\n");
      error = null;
      traces.each(function(trace) {
        var errorLine;
        if ((trace.indexOf('node_modules') === -1) && (trace.indexOf(_this.projectName) >= 0) && !error) {
          errorLine = _this.parseTrace(trace);
          return error = _this.parseError(errorLine);
        }
      });
      return error;
    };

    ParsedMessage.prototype.parseTrace = function(trace) {
      var errorLine;
      errorLine = trace.match(new RegExp(this.projectName + '(.+)'))[1];
      return errorLine.slice(0, -1);
    };

    ParsedMessage.prototype.parseError = function(errorLine) {
      var error, errorParts;
      errorParts = errorLine.split(':');
      error = {
        filePath: errorParts[0],
        fileName: this.fileNameFromPath(errorParts[0]),
        line: errorParts[1],
        column: errorParts[2]
      };
      return error;
    };

    ParsedMessage.prototype.fileNameFromPath = function(filePath) {
      return filePath.slice(filePath.lastIndexOf('/') + 1, filePath.indexOf('.'));
    };

    ParsedMessage.prototype.sanitizeErrorMessage = function(message) {
      var matches;
      matches = message.match(/\[31m(.+)\[\d+m/);
      return matches[1];
    };

    return ParsedMessage;

  }