function() {
  var installedApps = {};

  var callbacks = [], ready = false;

  var installer = navigator.mozApps.mgmt;
  installer.getAll().onsuccess = function onSuccess(e) {
    var apps = e.target.result;
    apps.forEach(function parseApp(app) {
      var manifest = app.manifest;
      if (!manifest || !manifest.icons) {
        return;
      }


      // If the manifest contains entry points, iterate over them
      // and add a fake app object for each one.
      var entryPoints = manifest.entry_points;
      if (!entryPoints) {
        installedApps[app.origin] = app;
        return;
      }

      for (var launchPath in entryPoints) {
        if (!entryPoints[launchPath].hasOwnProperty('icons'))
          continue;

        var alternativeOrigin = app.origin + '/' + launchPath;
        var newApp = new ApplicationMock(app, launchPath, alternativeOrigin);
        installedApps[alternativeOrigin] = newApp;
      }
    });

    ready = true;

    callbacks.forEach(function(callback) {
      if (callback.type == 'ready') {
        callback.callback(installedApps);
      }
    });
  };

  installer.onuninstall = function uninstall(event) {
    var app = event.application;
    delete installedApps[app.origin];

    callbacks.forEach(function(callback) {
      if (callback.type == 'uninstall') {
        callback.callback(app);
      }
    });
  };

  installer.oninstall = function install(event) {
    var app = event.application;
    if (!installedApps[app.origin]) {
      installedApps[app.origin] = app;

      var icon = getIcon(app.origin);
      // No need to put data: URIs in the cache
      if (icon && icon.indexOf('data:') == -1) {
        try {
          window.applicationCache.mozAdd(icon);
        } catch (e) {}
      }

      callbacks.forEach(function(callback) {
        if (callback.type == 'install') {
          callback.callback(app);
        }
      });
    }
  };

  /*
   * Returns all installed applications
   */
  function getAll() {
    return installedApps;
  };

  function addEventListener(type, callback) {
    callbacks.push({ type: type, callback: callback });
  };

  // Look up the app object for a specified app origin
  function getByOrigin(origin) {
    var app = installedApps[origin];
    if (app) {
      return app;
    }

    // XXX We are affected by the port!

    // Trailing '/'
    var trimmedOrigin = origin.slice(0, origin.length - 1);
    return installedApps[trimmedOrigin];
  };

  /*
   *  Returns installed apps
   */
  function getInstalledApplications() {
    var ret = {};

    for (var i in installedApps) {
      ret[i] = installedApps[i];
    }

    return ret;
  };

  /*
   *  Returns the origin for an apllication
   *
   *  {Object} Moz application
   *
   */
  function getOrigin(app) {
    return app.origin;
  };

  /*
   *  Returns the manifest that describes the app
   *
   *  {String} App origin
   *
   */
  function getManifest(origin) {
    var app = getByOrigin(origin);
    return app ? app.manifest : null;
  };

  // Core applications should be flagged at some point. Not sure how?
  var protocol = window.location.protocol;
  var host = window.location.host;
  var domain = host.replace(/(^[\w\d]+\.)?([\w\d]+\.[a-z]+)/, '$2');

  var coreApplications = [
    'dialer', 'sms', 'settings', 'camera', 'gallery', 'browser',
    'contacts', 'music', 'clock', 'email', 'fm', 'calculator',
    'calendar', 'video', 'fm'
  ];

  coreApplications = coreApplications.map(function mapCoreApp(name) {
    return protocol + '//' + name + '.' + domain;
  });

  // XXX which marketplace app we are going to flag as a core app?
  coreApplications.push('https://marketplace-dev.allizom.org');

  /*
   *  Returns true if it's a core application
   *
   *  {String} App origin
   *
   */
  function isCore(origin) {
    return coreApplications.indexOf(origin) !== -1;
  };

  var deviceWidth = document.documentElement.clientWidth;

  /*
   *  Returns the size of the icon
   *
   *  {Array} Sizes orderer largest to smallest
   *
   */
  function getIconSize(sizes) {
    return sizes[(deviceWidth < 480) ? sizes.length - 1 : 0];
  }

  /*
   *  Returns an icon given an origin
   *
   *  {String} App origin
   *
   */
  function getIcon(origin) {
    var manifest = getManifest(origin);
    if (!manifest) {
      return null;
    }

    if ('_icon' in manifest) {
      return manifest._icon;
    }

    // Get all sizes orderer largest to smallest
    var icons = manifest.icons;
    var sizes = Object.keys(icons).map(function parse(str) {
      return parseInt(str, 10);
    });
    sizes.sort(function(x, y) { return y - x; });

    // If the icons is not fully-qualifed URL, add the origin of the
    // application to it (technically, manifests are supposed to
    // have those). Otherwise return the url directly as it could be
    // a data: url.
    var icon = icons[getIconSize(sizes)];
    if (icon.indexOf('data:') !== 0) {
      icon = origin + icon;
    }

    return manifest._icon = icon;
  }

  /*
   *  Localize the app name
   *
   *  {String} App origin
   *
   */
  function getName(origin) {
    var manifest = getManifest(origin);
    if (!manifest) {
      return null;
    }

    if ('locales' in manifest) {
      var locale = manifest.locales[navigator.language];
      if (locale && locale.name) {
        return locale.name;
      }
    }

    return manifest.name;
  }

  function launch(origin, params) {
    var app = getByOrigin(origin);
    if (!app) {
      return;
    }

    app.launch(params);
  }

  function isReady() {
    return ready;
  }

  return {
    launch: launch,
    isCore: isCore,
    addEventListener: addEventListener,
    getAll: getAll,
    getByOrigin: getByOrigin,
    getOrigin: getOrigin,
    getName: getName,
    getIcon: getIcon,
    getManifest: getManifest,
    getInstalledApplications: getInstalledApplications,
    isReady: isReady
  };
}