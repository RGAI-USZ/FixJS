function(key, value) {
    var data = get(this, 'data'), ids, id, association,
        store = get(this, 'store');

    if (typeof type === 'string') {
      type = getPath(this, type, false) || getPath(window, type);
    }

    if (arguments.length === 2) {
      key = options.key || get(this, 'namingConvention').foreignKey(key);
      this.send('setAssociation', { key: key, value: Ember.none(value) ? null : get(value, 'clientId') });
      //data.setAssociation(key, get(value, 'clientId'));
      // put the client id in `key` in the data hash
      return value;
    } else {
      // Embedded belongsTo associations should not look for
      // a foreign key.
      if (embedded) {
        key = options.key || get(this, 'namingConvention').keyToJSONKey(key);

      // Non-embedded associations should look for a foreign key.
      // For example, instead of person, we might look for person_id
      } else {
        key = options.key || get(this, 'namingConvention').foreignKey(key);
      }
      id = findRecord(store, type, data, key, true);
      association = id ? store.find(type, id) : null;
    }

    return association;
  }