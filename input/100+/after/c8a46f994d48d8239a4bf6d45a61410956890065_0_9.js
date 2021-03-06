function(
    $log,
    $mailcomposer,
    $quotechew,
    $imaputil,
    $module,
    exports
  ) {
const bsearchForInsert = $imaputil.bsearchForInsert,
      bsearchMaybeExists = $imaputil.bsearchMaybeExists;

function toBridgeWireOn(x) {
  return x.toBridgeWire();
}

const FOLDER_TYPE_TO_SORT_PRIORITY = {
  account: 'a',
  inbox: 'c',
  starred: 'e',
  drafts: 'g',
  sent: 'i',
  junk: 'k',
  trash: 'm',
  archive: 'o',
  normal: 'z',
  // nomail folders are annoying since they are basically just hierarchy,
  //  but they are also rare and should only happen amongst normal folders.
  nomail: 'z',
};

/**
 * Make a folder sorting function that groups folders by account, puts the
 * account header first in that group, maps priorities using
 * FOLDER_TYPE_TO_SORT_PRIORITY, then sorts by path within that.
 *
 * This is largely necessitated by localeCompare being at the mercy of glibc's
 * locale database and failure to fallback to unicode code points for
 * comparison purposes.
 */
function makeFolderSortString(acctId, folder) {
  // '!' is before alphanum, so is a good separator for variable length id's
  return acctId + '!' + FOLDER_TYPE_TO_SORT_PRIORITY[folder.type] + '!' +
    folder.path.toLocaleLowerCase();
}

function strcmp(a, b) {
  if (a < b)
    return -1;
  else if (a > b)
    return 1;
  return 0;
}

function checkIfAddressListContainsAddress(list, addrPair) {
  var checkAddress = addrPair.address;
  for (var i = 0; i < list.length; i++) {
    if (list[i].address === checkAddress)
      return true;
  }
  return false;
};

/**
 * There is exactly one `MailBridge` instance for each `MailAPI` instance.
 * `same-frame-setup.js` is the only place that hooks them up together right
 * now.
 */
function MailBridge(universe) {
  this.universe = universe;
  this.universe.registerBridge(this);

  this._LOG = LOGFAB.MailBridge(this, universe._LOG, null);
  /** @dictof[@key[handle] @value[BridgedViewSlice]]{ live slices } */
  this._slices = {};
  /** @dictof[@key[namespace] @value[@listof[BridgedViewSlice]]] */
  this._slicesByType = {
    accounts: [],
    identities: [],
    folders: [],
    headers: [],
  };
  // outstanding persistent objects that aren't slices. covers: composition
  this._pendingRequests = {};
  //
  this._lastUndoableOpPair = null;
}
exports.MailBridge = MailBridge;
MailBridge.prototype = {
  __sendMessage: function(msg) {
    throw new Error('This is supposed to get hidden by an instance var.');
  },

  __receiveMessage: function mb___receiveMessage(msg) {
    var implCmdName = '_cmd_' + msg.type;
    if (!(implCmdName in this)) {
      this._LOG.badMessageType(msg.type);
      return;
    }
    var rval = this._LOG.cmd(msg.type, this, this[implCmdName], msg);
  },

  _cmd_ping: function mb__cmd_ping(msg) {
    this.__sendMessage({
      type: 'pong',
      handle: msg.handle,
    });
  },

  _cmd_tryToCreateAccount: function mb__cmd_tryToCreateAccount(msg) {
    var self = this;
    this.universe.tryToCreateAccount(msg.details, function(good, account) {
        self.__sendMessage({
            type: 'tryToCreateAccountResults',
            handle: msg.handle,
            error: good ? null : 'generic-badness',
          });
      });
  },

  _cmd_clearAccountProblems: function mb__cmd_clearAccountProblems(msg) {
    var account = this.universe.getAccountForAccountId(msg.accountId),
        self = this;

    account.checkAccount(function(err) {
      // If we succeeded or the problem was not an authentication, assume
      // everything went fine and clear the problems.
      if (!err || err !== 'bad-user-or-pass') {
        self.universe.clearAccountProblems(account);
      }
      // The login information is still bad; re-send the bad login notification.
      else {
        // This is only being sent over this, the same bridge the clear request
        // came from rather than sent via the mailuniverse.  No point having the
        // notifications stack up on inactive UIs.
        self.notifyBadLogin(account);
      }
    });
  },

  _cmd_modifyAccount: function mb__cmd_modifyAccount(msg) {
    var account = this.universe.getAccountForAccountId(msg.accountId),
        accountDef = account.accountDef;

    for (var key in msg.mods) {
      var val = msg.mods[key];

      switch (key) {
        case 'name':
          accountDef.name = val;
          break;

        case 'username':
          accountDef.credentials.username = val;
          break;
        case 'password':
          accountDef.credentials.password = val;
          break;

        case 'identities':
          // TODO: support identity mutation
          // we expect a list of identity mutation objects, namely an id and the
          // rest are attributes to change
          break;

        case 'servers':
          // TODO: support server mutation
          // we expect a list of server mutation objects; namely, the type names
          // the server and the rest are attributes to change
          break;
      }
    }
    this.universe.saveAccountDef(accountDef, null);
  },

  _cmd_deleteAccount: function mb__cmd_deleteAccount(msg) {
    this.universe.deleteAccount(msg.accountId);
  },

  notifyBadLogin: function mb_notifyBadLogin(account) {
    this.__sendMessage({
      type: 'badLogin',
      account: account.toBridgeWire(),
    });
  },

  _cmd_viewAccounts: function mb__cmd_viewAccounts(msg) {
    var proxy = this._slices[msg.handle] =
          new SliceBridgeProxy(this, 'accounts', msg.handle);
    proxy.markers = this.universe.accounts.map(function(x) { return x.id; });

    this._slicesByType['accounts'].push(proxy);
    var wireReps = this.universe.accounts.map(toBridgeWireOn);
    // send all the accounts in one go.
    proxy.sendSplice(0, 0, wireReps, true, false);
  },

  notifyAccountAdded: function mb_notifyAccountAdded(account) {
    var accountWireRep = account.toBridgeWire();
    var i, proxy, slices, wireSplice = null;
    // -- notify account slices
    slices = this._slicesByType['accounts'];
    for (i = 0; i < slices.length; i++) {
      proxy = slices[i];
      proxy.sendSplice(proxy.markers.length, 0, [accountWireRep], false, false);
      proxy.markers.push(account.id);
    }

    // -- notify folder slices
    accountWireRep = account.toBridgeFolder();
    slices = this._slicesByType['folders'];
    var startMarker = makeFolderSortString(account.id, accountWireRep),
        idxStart;
    for (i = 0; i < slices.length; i++) {
      proxy = slices[i];
      // If it's filtered to an account, it can't care about us.  (You can't
      // know about an account before it's created.)
      if (proxy.mode === 'account')
        continue;

      idxStart = bsearchForInsert(proxy.markers, startMarker, strcmp);
      wireSplice = [accountWireRep];
      var markerSpliceArgs = [idxStart, 0, startMarker];
      for (var iFolder = 0; iFolder < account.folders.length; iFolder++) {
        var folder = account.folders[iFolder];
        wireSplice.push(folder);
        markerSpliceArgs.push(makeFolderSortString(account.id, folder));
      }
      proxy.sendSplice(idxStart, 0, wireSplice);
      proxy.markers.splice.apply(proxy.markers, markerSpliceArgs);
    }
  },

  notifyAccountRemoved: function(accountId) {
    var i, proxy, slices;
    // -- notify account slices
    slices = this._slicesByType['accounts'];
    for (i = 0; i < slices.length; i++) {
      proxy = slices[i];
      var idx = proxy.markers.indexOf(accountId);
      if (idx !== -1) {
        proxy.sendSplice(idx, 1, [], false, false);
        proxy.markers.splice(idx, 1);
      }
    }

    // -- notify folder slices
    slices = this._slicesByType['folders'];
    var startMarker = accountId + '!!',
        endMarker = accountId + '!|';
    for (i = 0; i < slices.length; i++) {
      proxy = slices[i];
      var idxStart = bsearchForInsert(proxy.markers, startMarker,
                                      strcmp),
          idxEnd = bsearchForInsert(proxy.markers, endMarker,
                                    strcmp);
      if (idxEnd !== idxStart) {
        proxy.sendSplice(idxStart, idxEnd - idxStart, [], false, false);
        proxy.markers.splice(idxStart, idxEnd - idxStart);
      }
    }
  },

  _cmd_viewSenderIdentities: function mb__cmd_viewSenderIdentities(msg) {
    var proxy = this._slices[msg.handle] =
          new SliceBridgeProxy(this, identities, msg.handle);
    this._slicesByType['identities'].push(proxy);
    var wireReps = this.universe.identities;
    // send all the identities in one go.
    proxy.sendSplice(0, 0, wireReps, true, false);
  },

  notifyFolderAdded: function(accountId, folderMeta) {
    var newMarker = makeFolderSortString(accountId, folderMeta);
    var slices = this._slicesByType['folders'];
    for (var i = 0; i < slices.length; i++) {
      var proxy = slices[i];
      var idx = bsearchForInsert(proxy.markers, newMarker, strcmp);
      proxy.sendSplice(idx, 0, [folderMeta], false, false);
      proxy.markers.splice(idx, 0, newMarker);
    }
  },

  notifyFolderRemoved: function(accountId, folderMeta) {
    var marker = makeFolderSortString(accountId, folderMeta);

    var slices = this._slicesByType['folders'];
    for (var i = 0; i < slices.length; i++) {
      var proxy = slices[i];

      var idx = bsearchMaybeExists(proxy.markers, marker, strcmp);
      if (idx === null)
        continue;
      proxy.sendSplice(idx, 1, [], false, false);
      proxy.markers.splice(idx, 1);
    }
  },

  _cmd_viewFolders: function mb__cmd_viewFolders(msg) {
    var proxy = this._slices[msg.handle] =
          new SliceBridgeProxy(this, 'folders', msg.handle);
    this._slicesByType['folders'].push(proxy);
    proxy.mode = msg.mode;
    proxy.argument = msg.argument;
    var markers = proxy.markers = [];

    var wireReps = [];

    // folders currently come sorted by path
    function pushAccountFolders(acct) {
      for (var iFolder = 0; iFolder < acct.folders.length; iFolder++) {
        var folder = acct.folders[iFolder];
        wireReps.push(folder);
        markers.push(makeFolderSortString(acct.id, folder));
      }
    }

    if (msg.mode === 'account') {
      pushAccountFolders(
        this.universe.getAccountForAccountId(msg.argument));
    }
    else {
      var accounts = this.universe.accounts.concat();

      // sort accounts by their id's
      accounts.sort(function (a, b) {
        return a.id.localeCompare(b.id);
      });

      for (var iAcct = 0; iAcct < accounts.length; iAcct++) {
        var acct = accounts[iAcct], acctBridgeRep = acct.toBridgeFolder();
        wireReps.push(acctBridgeRep);
        markers.push(makeFolderSortString(acct.id, acctBridgeRep));
        pushAccountFolders(acct);
      }
    }
    proxy.sendSplice(0, 0, wireReps, true, false);
  },

  _cmd_viewFolderMessages: function mb__cmd_viewFolderMessages(msg) {
    var proxy = this._slices[msg.handle] =
          new SliceBridgeProxy(this, 'headers', msg.handle);
    this._slicesByType['headers'].push(proxy);

    var account = this.universe.getAccountForFolderId(msg.folderId);
    account.sliceFolderMessages(msg.folderId, proxy);
  },

  _cmd_refreshHeaders: function mb__cmd_refreshHeaders(msg) {
    var proxy = this._slices[msg.handle];
    if (!proxy) {
      this._LOG.badSliceHandle(msg.handle);
      return;
    }
    proxy.__listener.refresh();
  },

  _cmd_killSlice: function mb__cmd_killSlice(msg) {
    var proxy = this._slices[msg.handle];
    if (!proxy) {
      this._LOG.badSliceHandle(msg.handle);
      return;
    }

    delete this._slices[msg.handle];
    var proxies = this._slicesByType[proxy._ns],
        idx = proxies.indexOf(proxy);
    proxies.splice(idx, 1);
    proxy.die();

    this.__sendMessage({
      type: 'sliceDead',
      handle: msg.handle,
    });
  },

  _cmd_getBody: function mb__cmd_getBody(msg) {
    var self = this;
    // map the message id to the folder storage
    var folderId = msg.suid.substring(0, msg.suid.lastIndexOf('/'));
    var folderStorage = this.universe.getFolderStorageForFolderId(folderId);
    folderStorage.getMessageBody(msg.suid, msg.date, function(bodyInfo) {
      self.__sendMessage({
        type: 'gotBody',
        handle: msg.handle,
        bodyInfo: bodyInfo,
      });
    });
  },

  //////////////////////////////////////////////////////////////////////////////
  // Message Mutation
  //
  // All mutations are told to the universe which breaks the modifications up on
  // a per-account basis.

  _cmd_modifyMessageTags: function mb__cmd_modifyMessageTags(msg) {
    // XXXYYY

    // - The mutations are written to the database for persistence (in case
    //   we fail to make the change in a timely fashion) and so that we can
    //   know enough to reverse the operation.
    // - Speculative changes are made to the headers in the database locally.

    var longtermIds = this.universe.modifyMessageTags(
      msg.opcode, msg.messages, msg.addTags, msg.removeTags);
    this.__sendMessage({
      type: 'mutationConfirmed',
      handle: msg.handle,
      longtermIds: longtermIds,
    });
  },

  _cmd_undo: function mb__cmd_undo(msg) {
    this.universe.undoMutation(msg.longtermIds);
  },

  //////////////////////////////////////////////////////////////////////////////
  // Composition

  _cmd_beginCompose: function mb__cmd_beginCompose(msg) {
    var req = this._pendingRequests[msg.handle] = {
      type: 'compose',
      // XXX draft persistence/saving to-do/etc.
      persistedFolder: null,
      persistedUID: null,
    };

    // - figure out the identity to use
    var account, identity, folderId;
    if (msg.mode === 'new' && msg.submode === 'folder')
      account = this.universe.getAccountForFolderId(msg.refSuid);
    else
      account = this.universe.getAccountForMessageSuid(msg.refSuid);

    identity = account.identities[0];

    if (msg.mode === 'reply' ||
        msg.mode === 'forward') {
      var folderStorage = this.universe.getFolderStorageForMessageSuid(
                            msg.refSuid);
      var self = this;
      folderStorage.getMessageBody(
        msg.refSuid, msg.refDate,
        function(bodyInfo) {
          if (msg.mode === 'reply') {
            var rTo, rCc, rBcc;
            // clobber the sender's e-mail with the reply-to
            var effectiveAuthor = {
              name: msg.refAuthor.name,
              address: bodyInfo.replyTo || msg.refAuthor.address,
            };
            switch (msg.submode) {
              case 'list':
                // XXX we can't do this without headers we're not retrieving,
                // fall through for now.
              case null:
              case 'sender':
                rTo = [effectiveAuthor];
                rCc = rBcc = [];
                break;
              case 'all':
                // No need to change the lists if the author is already on the
                // reply lists.
                //
                // nb: Our logic here is fairly simple; Thunderbird's
                // nsMsgCompose.cpp does a lot of checking that we should audit,
                // although much of it could just be related to its much more
                // extensive identity support.
                if (checkIfAddressListContainsAddress(bodyInfo.to,
                                                      effectiveAuthor) ||
                    checkIfAddressListContainsAddress(bodyInfo.cc,
                                                      effectiveAuthor)) {
                  rTo = bodyInfo.to;
                }
                // add the author as the first 'to' person
                else {
                  rTo = [effectiveAuthor].concat(bodyInfo.to);
                }
                rCc = bodyInfo.cc;
                rBcc = bodyInfo.bcc;
                break;
            }

            var referencesStr;
            if (bodyInfo.references) {
              referencesStr = bodyInfo.references.concat([msg.refGuid])
                                .map(function(x) { return '<' + x + '>'; })
                                .join(' ');
            }
            else {
              referencesStr = '<' + msg.refGuid + '>';
            }
            self.__sendMessage({
              type: 'composeBegun',
              handle: msg.handle,
              identity: identity,
              subject: $quotechew.generateReplySubject(msg.refSubject),
              // blank lines at the top are baked in
              body: $quotechew.generateReplyMessage(
                      bodyInfo.bodyRep, effectiveAuthor, msg.refDate,
                      identity),
              to: rTo,
              cc: rCc,
              bcc: rBcc,
              referencesStr: referencesStr,
            });
          }
          else {
            self.__sendMessage({
              type: 'composeBegun',
              handle: msg.handle,
              identity: identity,
              subject: 'Fwd: ' + msg.refSubject,
              // blank lines at the top are baked in by the func
              body: $quotechew.generateForwardMessage(
                      msg.refAuthor, msg.refDate, msg.refSubject,
                      bodyInfo, identity),
              // forwards have no assumed envelope information
              to: [],
              cc: [],
              bcc: [],
              // XXX imitate Thunderbird current or previous behaviour; I
              // think we ended up linking forwards into the conversation
              // they came from, but with an extra header so that it was
              // possible to detect it was a forward.
              references: null,
            });
          }
        });
      return;
    }

    this.__sendMessage({
      type: 'composeBegun',
      handle: msg.handle,
      identity: identity,
      subject: '',
      body: '',
      to: [],
      cc: [],
      bcc: [],
      references: null,
    });
  },

  /**
   * mailcomposer wants from/to/cc/bcc delivered basically like it will show
   * up in the e-mail, except it is fine with unicode.  So we convert our
   * (possibly) structured representation into a flattened representation.
   *
   * (mailcomposer will handle punycode and mime-word encoding as needed.)
   */
  _formatAddresses: function(nameAddrPairs) {
    var addrstrings = [];
    for (var i = 0; i < nameAddrPairs.length; i++) {
      var pair = nameAddrPairs[i];
      // support lazy people providing only an e-mail... or very careful
      // people who are sure they formatted things correctly.
      if (typeof(pair) === 'string') {
        addrstrings.push(pair);
      }
      else {
        addrstrings.push(
          '"' + pair.name.replace(/["']/g, '') + '" <' +
            pair.address + '>');
      }
    }

    return addrstrings.join(', ');
  },

  _cmd_doneCompose: function mb__cmd_doneCompose(msg) {
    if (msg.command === 'delete') {
      // XXX if we have persistedFolder/persistedUID, enqueue a delete of that
      // message and try and execute it.
      return;
    }

    var composer = new $mailcomposer.MailComposer(),
        wireRep = msg.state;
    var identity = this.universe.getIdentityForSenderIdentityId(
                     wireRep.senderId),
        account = this.universe.getAccountForSenderIdentityId(
                    wireRep.senderId);

    var body = wireRep.body;

    var messageOpts = {
      from: this._formatAddresses([identity]),
      subject: wireRep.subject,
      body: body,
    };
    if (identity.replyTo)
      messageOpts.replyTo = identity.replyTo;
    if (wireRep.to && wireRep.to.length)
      messageOpts.to = this._formatAddresses(wireRep.to);
    if (wireRep.cc && wireRep.cc.length)
      messageOpts.cc = this._formatAddresses(wireRep.cc);
    if (wireRep.bcc && wireRep.bcc.length)
      messageOpts.bcc = this._formatAddresses(wireRep.bcc);
    composer.setMessageOption(messageOpts);

    if (wireRep.customHeaders) {
      for (var iHead = 0; iHead < wireRep.customHeaders.length; iHead += 2){
        composer.addHeader(wireRep.customHeaders[iHead],
                           wireRep.customHeaders[iHead+1]);
      }
    }
    composer.addHeader('User-Agent', 'Mozilla Gaia Email Client 0.1alpha');
    composer.addHeader('Date', new Date().toUTCString());
    // we're copying nodemailer here; we might want to include some more...
    var messageId =
      '<' + Date.now() + Math.random().toString(16).substr(1) + '@mozgaia>';

    composer.addHeader('Message-Id', messageId);
    if (wireRep.references)
      composer.addHeader('References', wireRep.references);

    if (msg.command === 'send') {
      var self = this;
      account.sendMessage(composer, function(err, badAddresses) {
        self.__sendMessage({
          type: 'sent',
          handle: msg.handle,
          err: err,
          badAddresses: badAddresses,
          messageId: messageId,
        });
      });
    }
    else { // (msg.command === draft)
      // XXX save drafts!
    }
  },

  //////////////////////////////////////////////////////////////////////////////
};

function SliceBridgeProxy(bridge, ns, handle) {
  this._bridge = bridge;
  this._ns = ns;
  this._handle = handle;
  this.__listener = null;
}
SliceBridgeProxy.prototype = {
  sendSplice: function sbp_sendSplice(index, howMany, addItems, requested,
                                      moreExpected) {
    this._bridge.__sendMessage({
      type: 'sliceSplice',
      handle: this._handle,
      index: index,
      howMany: howMany,
      addItems: addItems,
      requested: requested,
      moreExpected: moreExpected,
    });
  },

  sendUpdate: function sbp_sendUpdate(indexUpdatesRun) {
    this._bridge.__sendMessage({
      type: 'sliceUpdate',
      handle: this._handle,
      updates: indexUpdatesRun,
    });
  },

  sendStatus: function sbp_sendStatus(status, flushSplice) {
    if (flushSplice) {
      this.sendSplice(0, 0, [], true, false);
    }
  },

  die: function sbp_die() {
    if (this.__listener)
      this.__listener.die();
  },
};

var LOGFAB = exports.LOGFAB = $log.register($module, {
  MailBridge: {
    type: $log.DAEMON,
    events: {
    },
    TEST_ONLY_events: {
    },
    errors: {
      badMessageType: { type: true },
      badSliceHandle: { handle: true },
    },
    calls: {
      cmd: {command: true},
    },
    TEST_ONLY_calls: {
    },
  },
});

}