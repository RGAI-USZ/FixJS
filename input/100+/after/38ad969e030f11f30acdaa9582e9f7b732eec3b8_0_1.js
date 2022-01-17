function (options) {
        var $this = this,
            app = this.app = express.createServer();

        if (this.options.memcache) {
            var mo = this.options.memcache;
            this.memcached = new Memcached(mo.server, mo.options || {});
        } else {
            // If the configuration is missing, use the fake stub cache
            this.memcached = new ks_utils.FakeMemcached();
        }

        // Configure the HTTP server...
        app.configure(function () {
            // Configure a logger that pipes to the winston logger.
            app.use(express.logger({
                format: ':remote-addr - - [:date] ":method :url ' +
                        'HTTP/:http-version" :status :res[content-length] ' +
                        '":referrer" ":user-agent" :response-time',
                stream: {
                    write: function(s) {
                        log.info(s.trim(), {
                            source: "server",
                            pid: process.pid
                        });
                    }
                }
            }));
            app.use(firelogger());
        });

        // Set up HTTP routing, pretty simple so far...
        app.get('/docs/*', _.bind(this.docs_GET, this));
        app.post('/docs/', _.bind(this.docs_POST, this));
    }