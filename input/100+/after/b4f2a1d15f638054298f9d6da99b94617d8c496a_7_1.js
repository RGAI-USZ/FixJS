function () {
    var valid;
    beforeEach(function () {
        valid = {
            description: "An object",
            author: "Someone <foo@example.com>",
            main: "foo",
            hosts: {
                foo: {
                    addr: "1.2.3.4",
                    user: "test",
                    password: "test"
                },
                bar: {
                    addr: "2.2.3.4",
                    user: "test",
                    key: "something"
                }
            },
            forwards: {
                'A description': [ { from: '127.0.0.1:9999', to: '10.0.0.1:9999' } ]
            },
        };
    });

    it('should permit a valid object', function () {
        validate(valid).should.equal(true);
    });

    it('should deny missing author', function () {
        var invalid = valid;
        delete invalid.author;
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny missing description', function () {
        var invalid = valid;
        delete invalid.description;
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny missing main', function () {
        var invalid = valid;
        delete invalid.main;
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny missing hosts', function () {
        var invalid = valid;
        delete invalid.main;
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny hosts without addr', function () {
        var invalid = valid;
        invalid.hosts = {
            foo: {
                user: 'test',
                password: 'test',
            }
        };
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny hosts without users', function () {
        var invalid = valid;
        invalid.hosts = {
            foo: {
                addr: 'a1234',
                password: 'test',
            }
        };
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny hosts without password or key', function () {
        var invalid = valid;
        invalid.hosts = {
            foo: {
                addr: 'a1234',
                user: 'test',
            }
        };
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny missing main host', function () {
        var invalid = valid;
        invalid.main = 'other';
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny malformed forward from', function () {
        var invalid = valid;
        invalid.forwards.invalid = { from: '127.0.0.1.99:44', to: '1.2.3.4:55' };
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny malformed forward to', function () {
        var invalid = valid;
        invalid.forwards.invalid = { from: '127.0.0.1:44', to: '1.2.3.4.55' };
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny malformed localForward from', function () {
        var invalid = valid;
        invalid.localForwards = {};
        invalid.localForwards.invalid = { from: '127.0.0.1.99:44', to: '1.2.3.4:55' };
        (function () {
            validate(invalid);
        }).should.throw();
    });

    it('should deny malformed localForward to', function () {
        var invalid = valid;
        invalid.localForwards = {};
        invalid.localForwards.invalid = { from: '127.0.0.1:44', to: '1.2.3.4.55' };
        (function () {
            validate(invalid);
        }).should.throw();
    });
}