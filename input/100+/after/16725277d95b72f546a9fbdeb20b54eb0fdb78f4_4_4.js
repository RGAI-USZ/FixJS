function(request, response) {
            var that = this;
            var maxTries = 5;
            that.request = request;
            that.response = response;
            that.soupData = new Buffer('');
            that.contentEncoding = false;
            that.tries = 0;

            that.getSubDomain = function() {
                if (!that.request || !that.request.headers || !that.request.headers.host) {
                    return null;
                }

                var subDomainRegex = new RegExp("(.*)\." + options.domain + ".*"),
                    results = null;

                results = that.request.headers.host.match(subDomainRegex);

                if (results && results[1]) {
                    return results[1];
                } else {
                    return null;
                }
            };

            that.getSoupDomain = function() {
                return that.subDomain + "soup.io";
            }

            that.getNewResponseLocationField = function(location) {
                return location.replace(/soup\.io/, options.domain).
                                replace(/https:\/\//, 'http://');
            };

            that.getCorrectResponseCompression = function() {
                var enc = false;
                if (that.request.headers && that.request.headers['accept-encoding'] && that.contentEncoding) {
                    var renc = that.request.headers['accept-encoding'];
                    if (/gzip/.test(renc)) {
                        enc = 'gzip';
                    } else if (/deflate/.test(renc)) {
                        enc = 'deflate';
                    }
                }

                return enc;
            };

            that.getModifiedSoupResponseHeaders = function(headers) {
                var newheaders = JSON.parse(JSON.stringify(headers));

                if (newheaders.location) {
                    newheaders.location = that.getNewResponseLocationField(newheaders.location);
                }

                var enc = that.getCorrectResponseCompression();
                if (enc) {
                    newheaders['content-encoding'] = enc;
                } else if (newheaders.hasOwnProperty('content-encoding')) {
                    delete newheaders['content-encoding'];
                }

                newheaders['content-length'] = that.soupData.length;

                return newheaders;
            };

            that.getModifiedSoupResponseData = function(callback) {
                if (that.soupData.length > 0) {
                    that.unpackCompressedData(
                        that.soupData,
                        that.contentEncoding,
                        function(data) {
                            var buf = null;
                            data = data.toString();
                            if (isRss(data)) {
                                buf = modifyRssAndReturnBuffer(data);
                            } else if (isHtml(data)) {
                                buf = modifyHtmlAndReturnBuffer(data);
                            } else {
                                buf = new Buffer(replaceSoupLinksInString(data));
                            }
                            callback(buf);
                        }
                    );
                } else {
                    callback(new Buffer(''));
                }
            };

            that.unpackCompressedData = function(data, encoding, callback) {
                var decompressor;

                if (encoding == 'gzip') {
                    decompressor = zlib.gunzip;
                } else if (encoding == 'deflate') {
                    decompressor = zlib.inflate;
                } else {
                    decompressor = function(data, cb) {
                        cb(undefined, data);
                    };
                }

                decompressor(data, function(err, buffer) {
                    if (!err) {
                        callback(buffer);
                    } else {
                        that.onSoupError();
                    }
                });
            }

            that.compressData = function(data, encoding, callback) {
                var compressor;

                if (encoding == 'gzip') {
                    compressor = zlib.gzip;
                } else if (encoding == 'deflate') {
                    compressor = zlib.deflateRaw;
                } else {
                    compressor = function(data, cb) {
                        cb(undefined, data);
                    };
                }

                compressor(data, function(err, buffer) {
                    if (!err) {
                        callback(buffer);
                    } else {
                        that.onSoupError();
                    }
                });
            }

            var isHtml = function(inputdata) {
                return inputdata.search(/<li\ class/) != -1;
            }

            var isRss = function(inputdata) {
                return inputdata.search(/<rss/) != -1;
            }

            var replaceSoupLinksInString = function(inputdata) {
                return inputdata.replace(/soup\.io/g, options.domain).
                    replace(/https:\/\//g, "http://");
            }

            var modifyHtmlAndReturnBuffer = function(inputdata) {
                var lines = inputdata.split("\n");
                for (var i in lines) {
                    if (lines[i].search(/Permalink/) == -1) {
                        lines[i] = replaceSoupLinksInString(lines[i]);
                    }
                }

                return new Buffer(lines.join("\n"));
            }

            var modifyRssAndReturnBuffer = function(inputdata) {
                inputdata = inputdata.replace(/<link>/g, "\n<link>").replace(/<\/link>/g, "</link>\n");
                var lines = inputdata.split("\n");
                for (var i in lines) {
                    if (lines[i].search(/<link>/) == -1 &&
                        lines[i].search(/soup:attributes/) == -1) {
                        lines[i] = replaceSoupLinksInString(lines[i]);
                    }
                }

                return new Buffer(lines.join("\n"));
            }

            that.writeResponseHead = function() {
                that.response.writeHead(that.soupResponse.statusCode,
                        that.getModifiedSoupResponseHeaders(that.soupResponse.headers));
            }

            that.setAcceptEncoding = function(headers) {
                headers['Accept-Encoding'] = 'gzip, deflate';
                return headers;
            };

            that.setNewRequestHost = function(headers) {
                headers['host'] = that.getSoupDomain();
                return headers;
            };

            that.setNewReferrer = function(headers) {
                if (headers['referer']) {
                    headers['referer'] = headers['referer'].replace(new RegExp(options.domain), "soup.io");
                }
                return headers;
            };

            that.getModifiedSoupRequestHeader = function(oheaders) {
                var headers = JSON.parse(JSON.stringify(oheaders));
                headers = that.setAcceptEncoding(headers);
                headers = that.setNewRequestHost(headers);
                headers = that.setNewReferrer(headers);
                return headers;
            };

            that.shouldTransformData = function(headers) {
                var textTypeRegex = /text/,
                    applicationTypeRegex = /application/;

                if (!headers['content-type']) {
                    return true;
                } else if (headers['content-type'].search(textTypeRegex) != -1) {
                    return true;
                } else if (headers['content-type'].search(applicationTypeRegex) != -1) {
                    return true;
                }

                return false;
            };

            that.onSoupData = function(chunk) {
                try {
                    var newbuf = new Buffer(that.soupData.length + chunk.length);
                    that.soupData.copy(newbuf, 0, 0);
                    newbuf.write(chunk, that.soupData.length, chunk.length, 'binary');
                    that.soupData = newbuf;
                } catch (e) {
                    options.logger.error("soupDate", e);
                }
            };

            that.onSoupEndTransform = function() {
                that.getModifiedSoupResponseData(
                    function(data) {
                        that.compressData(
                            data,
                            that.getCorrectResponseCompression(),
                            function(data) {
                                that.soupData = data;
                                that.writeResponseHead();
                                if (data.length > 0) {
                                    options.stats.dataCount[that.request.connection.remoteAddress] += data.length;
                                    that.response.write(data);
                                }
                                that.response.end();
                                options.logger.access(request, that.soupResponse.statusCode, data.length);
                            }
                        );
                    }
                );
            };

            that.onSoupEnd = function() {
                that.writeResponseHead();
                if (that.soupData.length > 0 && that.request.method != 'HEAD') {
                    var data = that.soupData;
                    options.stats.dataCount[that.request.connection.remoteAddress] += that.soupData.length;
                    that.response.write(data);
                }
                options.logger.access(request, that.soupResponse.statusCode, that.soupData.length);
                that.response.end();
            };

            that.onSoupResponse = function(res) {
                that.soupResponse = res;

                switch (res.headers['content-encoding']) {
                    case 'gzip':
                        that.contentEncoding = 'gzip';
                        break;
                    case 'deflate':
                        that.contentEncoding = 'deflate';
                        break;
                    default:
                        that.contentEncoding = false;
                        break;
                }

                res.setEncoding('binary');

                res.on('data', that.onSoupData);

                if (that.shouldTransformData(res.headers)) {
                    res.on('end', that.onSoupEndTransform);
                } else {
                    res.on('end', that.onSoupEnd);
                }
            };

            that.onSoupError = function(error) {
                if (that.tries < maxTries) {
                    that.tries++;
                    options.logger.error("soupError, code: " + error.code + ", tries: " + that.tries + "/" + maxTries +
                        ", " + that.request.headers.host + that.request.url, error);
                    setTimeout(that.respondeWithOriginalPage, 500);
                } else {
                    options.logger.error("aborting non asset request after " + that.tries + " tries", error);
                    that.response.end();
                }
            };

            that.onRequestData = function(chunk) {
                that.proxy_request.write(chunk);
            };

            that.onRequestEnd = function() {
                that.proxy_request.end();
            };

            that.onRequestTimeout = function() {
                options.logger.error("aborting non asset request due to timeout");
                that.proxy_request.abort();
                that.response.end();
            }

            var isHttpsLink = function(url) {
                var loginRegex = new RegExp("\/login");
                if (url.match(loginRegex)) return true;
                return false;
            }

            that.respondeWithOriginalPage = function() {
                var subDomain = that.getSubDomain();
                subDomain = subDomain?subDomain + "." : "";
                that.subDomain = subDomain;

                var newHeaders = that.getModifiedSoupRequestHeader(that.request.headers);
                if (request.url && isHttpsLink(request.url)) {
                    that.proxy_request = https.request({
                        host: that.getSoupDomain(),
                        port: 443,
                        method: that.request.method,
                        path: that.request.url,
                        headers: newHeaders
                    });
                } else {
                    that.proxy_request = http.request({
                        host: that.getSoupDomain(),
                        port: 80,
                        method: that.request.method,
                        path: that.request.url,
                        headers: newHeaders
                    });
                };

                that.proxy_request.on('response', that.onSoupResponse);
                that.proxy_request.on('error', that.onSoupError);
                that.request.setEncoding('binary');
                that.request.on('data', that.onRequestData);
                that.request.on('end', that.onRequestEnd);
            };

            try {
                that.respondeWithOriginalPage();
            } catch (e) {
                options.logger.error("respondeWithOriginalPage" , e);
            }
        }