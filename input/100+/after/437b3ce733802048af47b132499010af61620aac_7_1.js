function(
    $shim_setup,
    $mailapi,
    $mailbridge,
    $mailuniverse,
    $imapslice,
    exports
  ) {
'use strict';

function createBridgePair(universe) {
  var TMB = new $mailbridge.MailBridge(universe);
  var TMA = new $mailapi.MailAPI();
  // shim-sham provide window.setZeroTimeout
  TMA.__bridgeSend = function(msg) {
    this._LOG.send(msg.type);
    window.setZeroTimeout(function() {
      TMB.__receiveMessage(msg);
    });
  };
  TMB.__sendMessage = function(msg) {
    window.setZeroTimeout(function() {
      TMA.__bridgeReceive(msg);
    });
  };
  return {
    api: TMA,
    bridge: TMB
  };
}

var _universeCallbacks = [], localMailAPI = null;
function onUniverse() {
  localMailAPI = createBridgePair(universe).api;
  // This obviously needs to be sent over the wire in a worker/multi-page setup.
  localMailAPI.config = universe.exposeConfigForClient();
  console.log("Mail universe/bridge created, notifying.");
  for (var i = 0; i < _universeCallbacks.length; i++) {
    _universeCallbacks[i](universe);
  }
  _universeCallbacks = null;
  var evtObject = document.createEvent('Event');
  evtObject.initEvent('mailapi', false, false);
  evtObject.mailAPI = localMailAPI;
  window.dispatchEvent(evtObject);
}

var universe = new $mailuniverse.MailUniverse(onUniverse);

function runOnUniverse(callback) {
  if (_universeCallbacks !== null) {
    _universeCallbacks.push(callback);
    return;
  }
  callback(universe);
}
window.gimmeMailAPI = function(callback) {
  runOnUniverse(function() {
    callback(localMailAPI);
  });
};

/**
 * Debugging: enable spawning a loggest log browser using our log contents;
 * call document.spawnLogWindow() to do so.
 */
document.enableLogSpawner = function enableLogSpawner(spawnNow) {
  var URL = "http://localhost/live/arbpl/client/index-post-devmode.html",
      ORIGIN = "http://localhost";

  var openedWin = null,
      channelId = null,
      spamIntervalId = null;
  document.spawnLogWindow = function() {
    // not security, just naming.
    channelId = 'arbpl' + Math.floor(Math.random() * 1000000) + Date.now();
    // name the window so we can reuse it
    openedWin = window.open(URL + '#' + channelId, "ArbPL");
    spamIntervalId = setInterval(spammer, 100);
  };
  // Keep pinging the window until it tells us it has fully loaded.
  function spammer() {
    openedWin.postMessage({ type: 'hello', id: channelId }, ORIGIN);
  }
  window.addEventListener("message", function(event) {
    if (event.origin !== ORIGIN)
      return;
    if (event.data.id !== channelId)
      return;
    clearInterval(spamIntervalId);

    event.source.postMessage(
      universe.createLogBacklogRep(channelId),
      event.origin);
  }, false);

  if (spawnNow)
    document.spawnLogWindow();
};

////////////////////////////////////////////////////////////////////////////////

}