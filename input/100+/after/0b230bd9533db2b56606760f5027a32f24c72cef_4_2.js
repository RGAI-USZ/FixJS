function() {
  before(function(done) {
    var req = projectReq;

    projects.add(req, db, function(err, project) {
      req = screenReq;
      screens.add(req, db, function(errScreen, screen) {
        req = componentReq;
        components.add(req, db, done);
      });
    });
  });

  after(function(done) {
    db.flushdb(done);
    console.log('cleared test elements database');
  });

  describe('POST /projects/:projectId/screens/:screenId/components/:componentId/elements',
    function() {
      it('adds a new element', function(done) {
        var req = elementReq;
        elements.add(req, db, function(err, element) {
          element.type.should.equal(req.body.type);
          element.name.should.equal(req.body.name);
          should.not.exist(element.head);
          should.not.exist(element.nextId);
          element.required.should.equal(req.body.required);
          done();
        });
      });

      it('accepts an empty callback', function(done) {
        var req = otherElementReq;
        elements.add(req, db);

        // wait 10ms for db transaction to complete
        setTimeout(function() {
          elements.get(req, db, 2, function(err, element) {
            element.type.should.equal(req.body.type);
            element.head.should.equal(req.body.head);
            element.nextId.should.equal(req.body.nextId);
            element.text.should.equal(req.body.text);
            element.level.should.equal(req.body.level);
            done();
          });
        }, 10);
      });
    });

  describe('GET /projects/:projectId/screens/:screenId/components/:componentId/elements',
    function() {
      it('returns a list of available elements for the component', function(done) {
        var req = elementReq;

        elements.list(req, db, function(errList, elementList) {
          elementList[0].type.should.equal(req.body.type);
          elementList[0].name.should.equal(req.body.name);
          should.not.exist(elementList[0].head);
          should.not.exist(elementList[0].nextId);
          elementList[0].required.should.equal(req.body.required);

          req = otherElementReq;
          elementList[1].type.should.equal(req.body.type);
          elementList[1].head.should.equal(req.body.head);
          elementList[1].nextId.should.equal(req.body.nextId);
          elementList[1].text.should.equal(req.body.text);
          elementList[1].level.should.equal(req.body.level);
          done();
        });
      });
    });

  describe('GET /projects/:projectId/screens/:screenId/components/:componentId/elements/:id',
    function() {
      var req = elementReq;

      it('returns a specific element', function(done) {
        elements.get(req, db, 1, function(err, element) {
          element.type.should.equal(req.body.type);
          element.name.should.equal(req.body.name);
          should.not.exist(element.head);
          should.not.exist(element.nextId);
          element.required.should.equal(req.body.required);
          done();
        });
      });

      it('returns no element', function(done) {
        elements.get(req, db, 12345, function(err, element) {
          should.not.exist(element);
          done();
        });
      });
    });

  describe('PUT /projects/:projectId/screens/:screenId/components/:componentId/elements/:id',
    function() {
      var req = elementReq;

      it('updates a specific element', function(done) {
        req.body.nextId = 2;
        elements.update(req, db, 1, function(err, element) {
          element.nextId.should.equal(req.body.nextId);
          done();
        });
      });

      it('accepts an empty callback', function(done) {
        req.body.nextId = 3;
        elements.update(req, db, 1);

        // wait 10ms for db transaction to complete
        setTimeout(function() {
          elements.get(req, db, 1, function(err, element) {
            element.nextId.should.equal(req.body.nextId);
            done();
          });
        }, 10);
      });
    });

  describe('DELETE /projects/:projectId/screens/:screenId/components/:componentId/elements/:id',
    function() {
      var req = elementReq;

      it('deletes an element', function(done) {
        elements.remove(req, db, 1, function(err) {
          should.not.exist(err);
          done();
        });
      });

      it('accepts an empty callback', function(done) {
        elements.remove(req, db, 2);

        // wait 10ms for db transaction to complete
        setTimeout(function() {
          elements.list(req, db, function(error, elementList) {
            elementList.should.eql([]);
            done();
          });
        }, 10);
      });
    });
}