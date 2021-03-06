function girror(remote, worktree, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = { };
  }

  options          = options              || { };
  var remote_type  = options.remote_type  || remote_types.no_auth();
  var cachedir     = options.cachedir     || process.env.GIRROR_CACHE || path.join(tmp(), 'girror-cache');
  var logger       = options.logger       || console;
  var branch       = options.branch       || null;
  var depth        = options.depth        || -1;
  var verbose      = 'verbose' in options ? options.verbose : false;
  var girrorfile   = 'girrorfile' in options ? options.girrorfile : '.girror.json';

  if (!worktree) throw new Error('`worktree` path is required');

  // wrap using ctxobj to allow contextual logging
  logger = con(logger);

  if (!verbose) {
    logger.log = function() { };
    logger.info = function() { };
  }

  // -- private

  /**
   * Promise for `log`
   */
  function $log() {
    var args = arguments;
    return function(cb) {
      logger.info(util.format.apply(util, args));
      return cb();
    };
  }

  /**
   * Promise (and wrapper) for `git`
   */
  function $git(dir, args, ignoreErrors) {
    // just complete operation indicating error
    var onerror = function(err, cb) { return cb(err)};

    if (typeof ignoreErrors === 'function') {
      // custom error handler specified (it should call completion)
      onerror = ignoreErrors;
      // if there is custom error handler, errors are not ignored
      ignoreErrors = false;
    }

    return function(cb) {
      var opts = { logger: logger, tolerate: ignoreErrors };

      // always prefix with --git-dir <dir>
      args.unshift(dir);
      args.unshift('--git-dir');

      return git(args, opts, function(err) {
        if (err) return onerror(err, cb);
        return cb();
      });
    };
  }

  /**
   * Promise for `mkdirp`
   */
  function $mkdirp(dir) {
    return function(cb) {
      return mkdirp(dir, cb);
    };
  }

  /**
   * Async "if" flow control
   */
  function $if(cond, $then, $else) {
    return function(cb) {
      if (cond) return $then(cb);
      else return $else(cb);
    }
  }

  /**
   * Promise to create a girror file in `file`
   */
  function $girrorfile(worktree, file, remote, branch) {

    return function(cb) {
      if (!file) return cb(); // no girror file

      logger.info('creating: ' + path.join(worktree, file));

      var contents = {
        remote: remote,
        branch: branch,
        updated: new Date(),
      };

      return fs.writeFile(path.join(worktree, file), JSON.stringify(contents, true, 2), cb);
    };
  }

  /**
   * Returns the system's temp directory
   */
  function tmp() {
    return process.env.TMP || process.env.TEMP || '/tmp';
  }

  /**
   * Determines the `remote` for this girror operation
   */
  function findremote(worktree, girrorfile, remote, callback) {
    if (remote) {
      return callback(null, remote);
    }
    else {
      return find_meta(worktree, { girrorfile: girrorfile }, function(err, meta) {
        if (!err && !meta) err = new Error('unable to find ' + girrorfile + ' under ' + worktree);
        if (err) return callback(err);

        var ref = meta.remote;
        if (meta.branch) ref += '#' + meta.branch;
        return callback(null, ref);
      });
    }
  }

  // -- main

  return findremote(worktree, girrorfile, remote, function(err, remote) {
    if (err) return callback(err);
    if (!remote) return callback(new Error('`remote` url is required'));

    // if remote contains a '#' treat the hash as a branch
    if (remote.indexOf('#') !== -1) {
      if (branch) throw new Error('cannot define branch both as a remote url hash and in options');
      
      var _ = remote.split('#');
      remote = _[0];
      branch = _[1];
    }

    // parse remote using the remote parser
    var remote_input = remote; // store for saving into girror file
    remote = remote_type(remote);
    if (!branch) branch = 'master'; // default branch in case it was not defined anywhere

    // calc baredir name by replacing any non-fs chars in remote url. 
    var dirname = remote.replace(/[\\\/\:@\.]/g, '_');
    var dirpath = path.join(cachedir, dirname);

    return function girrorseq() {
      async.series([

        // make sure we have a bare repo to work with
        $log('bare repository under: ' + dirpath),
        $mkdirp(dirpath),
        $git(dirpath, ['init', '--bare']), // will not harm an existing repo

        // git remote rm/add origin
        $log('setting up remote origin to ' + remote),
        $git(dirpath, ['remote', 'add', 'origin', '--mirror=fetch', remote], true), // ignore errors (in case remote already exist)

        // git fetch origin
        $log('fetching updates from ' + remote),
        $if(
          depth === -1,
          $git(dirpath, [ 'fetch', 'origin' ]),
          $git(dirpath, [ 'fetch', '--depth', depth, 'origin' ])
        ),

        // make sure worktree exists
        $log('checking out branch ' + branch + ' into ' + worktree),
        $mkdirp(worktree),
        $git(dirpath, [ '--work-tree', worktree, 'checkout', '-f', branch ]),

        // create girrorfile
        $girrorfile(worktree, girrorfile, remote_input, branch),

      ], function(err) {
        // exit code 128 indicates an unexpected error.
        // http://stackoverflow.com/questions/4917871/does-git-return-specific-return-error-codes
        if (err && err.exitCode === 128) {
          logger.warn(dirpath + ' seems to be corrupted. Trying to recreate.');

          // rm -fr dir
          return rimraf(dirpath, function(err) {
            if (err) {
              logger.error('Unable to clean up (rm -fr) ' + dirpath);
              return callback(err);
            }

            // try again
            return girrorseq();
          });
        }
        return callback(err);
      });
    }();
  });
}