function() {
  var subject;

  suiteSetup(function() {
    subject = Calendar.Templates.Account;
  });

  function renderHTML(type, options) {
    return subject[type].render(options);
  }

  test('#accountItem', function() {
    var output = renderHTML('accountItem', {
      name: 'yahoo'
    });

    assert.include(output, 'yahoo');
  });


}