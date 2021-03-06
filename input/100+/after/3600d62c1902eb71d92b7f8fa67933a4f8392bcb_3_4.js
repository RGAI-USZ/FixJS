function(T) {
  T.group('setup');
  var testUniverse = T.actor('testUniverse', 'U'),
      testAccount = T.actor('testImapAccount', 'A', { universe: testUniverse }),
      eSync = T.lazyLogger('sync'),
      numMessages = 7;

  var testFolder = testAccount.do_createTestFolder(
    'test_mutation_flags',
    { count: numMessages, age_incr: { days: 1 } });
  var folderView = testAccount.do_openFolderView(
    'folderView', testFolder,
    { count: numMessages, full: numMessages, flags: 0, deleted: 0 },
    { top: true, bottom: true, grow: false });

  var doHeaderExps = null, undoHeaderExps = null, undoOps = null,
      applyManips = null;

  /**
   * This tests our local modifications and that our state stays the same once
   * we have told the server our changes and then synced against them.
   *
   * TODO: We want to support custom-tags, but it's not a v1 req, so we're
   * punting it.
   */
  T.group('offline manipulation; released to server');
  testUniverse.do_pretendToBeOffline(true);
  T.action('manipulate flags, hear local changes, no network use by',
           testAccount, testAccount.eImapAccount, function() {
    // by mentioning testAccount we ensure that we will assert if we see a
    // reuseConnection from it.
    var headers = folderView.slice.items,
        toMarkRead = headers[1],
        toStar = headers[2],
        toMarkRepliedTo = headers[3],
        toMarkForwarded = headers[4],
        toMarkJunk = headers[5],
        toStarAndMarkRead = headers[6];

    applyManips = function applyManips() {
      undoOps = [];

      undoOps.push(toMarkRead.setRead(true));
      undoOps.push(toStar.setStarred(true));
      // these should normally only set by the composition mechanism on send:
      undoOps.push(toMarkRepliedTo.modifyTags(['\\Answered']));
      undoOps.push(toMarkForwarded.modifyTags(['$Forwarded']));
      // This may end up with a custom move-heuristic if it gets better supported
      undoOps.push(toMarkJunk.modifyTags(['$Junk']));
      // this normally would not be a single transaction...
      undoOps.push(toStarAndMarkRead.modifyTags(['\\Seen', '\\Flagged']));
    };
    applyManips();
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('local_do', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('local_do', 'modtags');
    }

    doHeaderExps = {
      changes: [
        [toStar, 'isStarred', true],
        [toMarkRead, 'isRead', true],
        [toMarkRepliedTo, 'isRepliedTo', true],
        [toMarkForwarded, 'isForwarded', true],
        [toMarkJunk, 'isJunk', true],
        [toStarAndMarkRead, 'isStarred', true, 'isRead', true],
      ],
      deletions: []
    };
    undoHeaderExps = {
      changes: [
        [toStar, 'isStarred', false],
        [toMarkRead, 'isRead', false],
        [toMarkRepliedTo, 'isRepliedTo', false],
        [toMarkForwarded, 'isForwarded', false],
        [toMarkJunk, 'isJunk', false],
        [toStarAndMarkRead, 'isStarred', false, 'isRead', false],
      ],
      deletions: []
    };
    testAccount.expect_headerChanges(
      folderView, doHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
  });
  T.action('go online, see changes happen for', testAccount.eImapAccount,
           eSync, function() {
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('do', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('do', 'modtags');
    }
    eSync.expect_event('ops-done');

    window.navigator.connection.TEST_setOffline(false);
    MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
      eSync.event('ops-done');
    });
  });

  // The refresh should result in us refreshing our flags but not hearing about
  // any changes because our predictions should be 100% accurate.
  testAccount.do_refreshFolderView(
    folderView,
    { count: numMessages, full: 0, flags: numMessages, deleted: 0 },
    { changes: [], deletions: [] },
    { top: true, bottom: true, grow: false });

  T.group('undo while offline; released to server');
  testUniverse.do_pretendToBeOffline(true);
  T.action('undo!', testAccount.eImapAccount, eSync, function() {
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('local_undo', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('local_undo', 'modtags');
    }

    undoOps.forEach(function(x) { x.undo(); });
    testAccount.expect_headerChanges(
      folderView, undoHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
  });

  T.action('go online, see undos happen for', testAccount.eImapAccount,
           eSync, function() {
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('undo', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('undo', 'modtags');
    }
    eSync.expect_event('ops-done');

    window.navigator.connection.TEST_setOffline(false);
    MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
      eSync.event('ops-done');
    });
  });

  // The refresh should result in us refreshing our flags but not hearing about
  // any changes because our predictions should be 100% accurate.
  testAccount.do_refreshFolderView(
    folderView,
    { count: numMessages, full: 0, flags: numMessages, deleted: 0 },
    { changes: [], deletions: [] },
    { top: true, bottom: true, grow: false });

  /**
   * If we undo an operation without having told it to the server, it should be
   * locally and remotely as if it never happened.
   */
  T.group('offline manipulation undone while offline (never online)');
  testUniverse.do_pretendToBeOffline(true);
  T.action('manipulate flags, hear local changes',
           testAccount, testAccount.eImapAccount, function() {
    applyManips();
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('local_do', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('local_do', 'modtags');
    }
    testAccount.expect_headerChanges(
      folderView, doHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
  });
  T.action('trigger undo ops, hear local changes',
           testAccount, testAccount.eImapAccount, function() {
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('local_undo', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('local_undo', 'modtags');
    }

    undoOps.forEach(function(x) { x.undo(); });
    testAccount.expect_headerChanges(
      folderView, undoHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
  });
  T.action('go online, see nothing happen',
           testAccount.eImapAccount, eSync, function() {
    // eImapAccount is listed so we complain if we see ops run
    eSync.expect_event('ops-clear');

    window.navigator.connection.TEST_setOffline(false);
    MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
      eSync.event('ops-clear');
    });
  });
  // The refresh should result in us refreshing our flags but not hearing about
  // any changes because nothing should have happened!
  testAccount.do_refreshFolderView(
    folderView,
    { count: numMessages, full: 0, flags: numMessages, deleted: 0 },
    { changes: [], deletions: [] },
    { top: true, bottom: true, grow: false });

  /**
   * Verify that mutations and their undos survive a restart.
   */
  T.group('offline manipulation, shutdown, startup, go online, see mutations');
  testUniverse.do_pretendToBeOffline(true);
  T.action('manipulate flags, hear local changes',
           testAccount, testAccount.eImapAccount, function() {
    applyManips();
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount.eImapAccount.expect_runOp_begin('local_do', 'modtags');
      testAccount.eImapAccount.expect_runOp_end('local_do', 'modtags');
    }
    testAccount.expect_headerChanges(
      folderView, doHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
  });
  testAccount.do_closeFolderView(folderView);
  testUniverse.do_saveState();
  testUniverse.do_shutdown();
  var testUniverse2 = T.actor('testUniverse', 'U2'),
      testAccount2 = T.actor('testImapAccount', 'A2',
                             { universe: testUniverse2, restored: true }),
      testFolder2 = testAccount2.do_useExistingFolder(
                      'test_mutation_flags', '#2', testFolder),
      folderView2 = testAccount2.do_openFolderView(
        'folderView2', testFolder2,
        { count: numMessages, full: numMessages, flags: 0, deleted: 0 },
        { top: true, bottom: true, grow: false });
  T.action('go online, see changes happen for', testAccount2.eImapAccount,
           eSync, function() {
    var created = false;
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount2.eImapAccount.expect_runOp_begin('do', 'modtags');
      if (!created) {
        testAccount2.eImapAccount.expect_createConnection();
        created = true;
      }
      testAccount2.eImapAccount.expect_runOp_end('do', 'modtags');
    }
    eSync.expect_event('ops-done');

    window.navigator.connection.TEST_setOffline(false);
    MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
      eSync.event('ops-done');
    });
  });

  T.group('offline undo, shutdown, startup, go online, see undos');
  testUniverse2.do_pretendToBeOffline(true);
  T.action('undo!', testAccount2.eImapAccount, eSync, function() {
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount2.eImapAccount.expect_runOp_begin('local_undo', 'modtags');
      testAccount2.eImapAccount.expect_runOp_end('local_undo', 'modtags');
    }

    // NB: our undoOps did not usefully survive the restart; they are still
    // hooked up to the old universe/bridge, and so are not useful.  However,
    // their longterm identifiers are still valid, so we can just directly
    // issue the undo requests against the universe.  (If we issued new
    // mutations without restarting, we could have those be alive and use them,
    // but we don't need coverage for that.
    undoOps.forEach(function(x) {
      MailUniverse.undoMutation(x._longtermIds);
    });
    testAccount2.expect_headerChanges(
      folderView2, undoHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
  });
  testUniverse2.do_saveState();
  testUniverse2.do_shutdown();
  var testUniverse3 = T.actor('testUniverse', 'U3'),
      testAccount3 = T.actor('testImapAccount', 'A3',
                             { universe: testUniverse3, restored: true }),
      testFolder3 = testAccount3.do_useExistingFolder(
        'test_mutation_flags', '#3', testFolder2),
      folderView3 = testAccount3.do_openFolderView(
        'folderView3', testFolder3,
        { count: numMessages, full: numMessages, flags: 0, deleted: 0 },
        { top: true, bottom: true, grow: false });

  T.action('go online, see undos happen for', testAccount3.eImapAccount,
           eSync, function() {
    var created = false;
    for (var nOps = undoOps.length; nOps > 0; nOps--) {
      testAccount3.eImapAccount.expect_runOp_begin('undo', 'modtags');
      if (!created) {
        testAccount3.eImapAccount.expect_createConnection();
        created = true;
      }
      testAccount3.eImapAccount.expect_runOp_end('undo', 'modtags');
    }
    eSync.expect_event('ops-done');

    window.navigator.connection.TEST_setOffline(false);
    MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
      eSync.event('ops-done');
    });
  });


  /**
   * Do a single manipulation and its undo while online, cases we haven't tried
   * yet.  By doing a single manipulation we avoid any races between local_do
   * and do events (which could happen).
   */
  T.group('online manipulation and undo');
  T.action('star the 0th dude', testAccount3, testAccount3.eImapAccount, eSync,
           function() {
    // - expectations
    var toStar = folderView3.slice.items[0];
    testAccount3.eImapAccount.expect_runOp_begin('local_do', 'modtags');
    testAccount3.eImapAccount.expect_runOp_end('local_do', 'modtags');
    testAccount3.eImapAccount.expect_runOp_begin('do', 'modtags');
    testAccount3.eImapAccount.expect_runOp_end('do', 'modtags');
    eSync.expect_event('ops-done');

    doHeaderExps = {
      changes: [
        [toStar, 'isStarred', true],
      ],
      deletions: [],
    };
    undoHeaderExps = {
      changes: [
        [toStar, 'isStarred', false],
      ],
      deletions: [],
    };

    // - do it!
    undoOps = [toStar.setStarred(true)];

    testAccount3.expect_headerChanges(
      folderView3, doHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
    // We need to roundtrip before waiting on the ops because the latter does
    // not cross the bridge itself.
    MailAPI.ping(function() {
      MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
        eSync.event('ops-done');
      });
    });
  });
  // Sync should find no changes from our predictive changes
  testAccount3.do_refreshFolderView(
    folderView3,
    { count: numMessages, full: 0, flags: numMessages, deleted: 0 },
    { changes: [], deletions: [] },
    { top: true, bottom: true, grow: false });
  T.action('undo the starring', testAccount3, testAccount3.eImapAccount, eSync,
           function() {
    testAccount3.eImapAccount.expect_runOp_begin('local_undo', 'modtags');
    testAccount3.eImapAccount.expect_runOp_end('local_undo', 'modtags');
    testAccount3.eImapAccount.expect_runOp_begin('undo', 'modtags');
    testAccount3.eImapAccount.expect_runOp_end('undo', 'modtags');
    eSync.expect_event('ops-done');

    undoOps[0].undo();
    testAccount3.expect_headerChanges(
      folderView3, undoHeaderExps,
      { top: true, bottom: true, grow: false },
      'roundtrip');
    // We need to roundtrip before waiting on the ops because the latter does
    // not cross the bridge itself.
    MailAPI.ping(function() {
      MailUniverse.waitForAccountOps(MailUniverse.accounts[0], function() {
        eSync.event('ops-done');
      });
    });
  });
  // And again, sync should find no changes
  testAccount3.do_refreshFolderView(
    folderView3,
    { count: numMessages, full: 0, flags: numMessages, deleted: 0 },
    { changes: [], deletions: [] },
    { top: true, bottom: true, grow: false });

  T.group('cleanup');
}