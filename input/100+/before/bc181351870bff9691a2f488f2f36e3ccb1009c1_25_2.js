function() {
    winMock.location.hash = "#ADD_EMAIL=testuser@testuser.com";

    createController({
      ready: function() {
        mediator.subscribe("start", function(msg, info) {
          equal(info.type, "primary", "correct type");
          equal(info.email, TESTEMAIL, "email_chosen with correct email");
          equal(info.add, true, "add is specified with ADD_EMAIL option");
          start();
        });

        try {
          controller.get(testHelpers.testOrigin, {}, function() {}, function() {});
        }
        catch(e) {
          // do nothing, an exception will be thrown because no modules are
          // registered for the any services.
        }
      }
    });
  }