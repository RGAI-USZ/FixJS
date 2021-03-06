function() {
  var store = DS.Store.create({
    adapter: 'DS.fixtureAdapter'
  });

  var Person = DS.Model.extend({
    firstName: DS.attr('string'),
    lastName: DS.attr('string'),

    height: DS.attr('number')
  });

  Person.FIXTURES = [{
    id: 'wycats',
    firstName: "Yehuda",
    lastName: "Katz",

    height: 65
  },

  {
    id: 'ebryn',
    firstName: "Erik",
    lastName: "Brynjolffsosysdfon",

    height: 70
  }];

  var ebryn = store.find(Person, 'ebryn');

  equal(get(ebryn, 'isLoaded'), false, "record from fixtures is returned in the loading state");

  ebryn.addObserver('isLoaded', function() {
    clearTimeout(timer);
    start();

    ok(get(ebryn, 'isLoaded'), "data loads asynchronously");
    equal(get(ebryn, 'height'), 70, "data from fixtures is loaded correctly");

    var wycats = store.find(Person, 'wycats');
    equal(get(wycats, 'isLoaded'), true, "subsequent requests for records are returned immediately");
    equal(get(wycats, 'height'), 65, "subsequent requested records contain correct information");
  });

  stop();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
}