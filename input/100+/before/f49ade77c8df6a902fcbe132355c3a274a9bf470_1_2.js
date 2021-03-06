function() {

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

    ParsedMessage.prototype.parseFailures = function(message) {
      return message.match(/(.+\n.\[3[12]m[\s\S]*)Failures:\s([\s\S]*)\n+Finished/m);
    };

    ParsedMessage.prototype.extractFailureInformation = function(verboseSpecs, failureStacktraces) {
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