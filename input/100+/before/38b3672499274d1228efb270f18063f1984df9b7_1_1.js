function bt_init() {
    var settings = window.navigator.mozSettings;
    if (!settings) {
      return;
    }

    var req = settings.getLock().get('bluetooth.enabled');
    req.onsuccess = function bt_EnabledSuccess() {
      var bluetooth = window.navigator.mozBluetooth;
      if (!bluetooth)
        return;

      var enabled = req.result['bluetooth.enabled'];
      bluetooth.setEnabled(enabled);
    };

    req.onerror = function bt_EnabledError() {
      console.log('Settings error when reading bluetooth setting!');
    };
  }