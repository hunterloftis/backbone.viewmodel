$(document).ready(function() {

  module("Backbone.ViewModel.virtual()");

  test("tracking a simple computation within a ViewModel", function() {
    var computations = 0;

    var vm = new Backbone.ViewModel({
      base: 1
    });

    vm.virtual('triple', function(attr) {
      computations++;
      return this.get('base') * 3;
    });

    strictEqual(vm.get('triple'), 3, 'initial computation should be 3');
    strictEqual(computations, 1, 'computation should be run once');

    vm.set('base', 2);
    strictEqual(vm.get('triple'), 6, 'computation should be 6 after base update');
    strictEqual(computations, 2, 'computation should be run twice');

    strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
  });

  test("tracking a simple computation across ViewModels", function() {
    var computations = 0;

    var a = new Backbone.Model({
      base: 1
    });

    var b = new Backbone.ViewModel({
      model: a
    });

    b.virtual('triple', function(attr) {
      computations++;
      return this.get('model').get('base') * 3;
    });

    strictEqual(b.get('triple'), 3, 'initial computation should be 3');
    strictEqual(computations, 1, 'computation should be run once');

    a.set('base', 2);
    strictEqual(b.get('triple'), 6, 'computation should be 6 after base update');
    strictEqual(computations, 2, 'computation should be run twice');

    strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
  });

  test("filtering a model", function() {
    var computations = 0;

    var model = new Backbone.Model({
      players: new Backbone.Collection([
        { name: 'Alice', points: 1 },
        { name: 'Bob', points: 3 },
        { name: 'Charles', points: 2 },
        { name: 'Danielle', points: 0 }
      ])
    });

    var vm = new Backbone.ViewModel({
      model: model,
      limit: 2
    });

    vm.virtual('topPlayers', function(attr) {
      computations++;
      var model = this.get('model');
      var limit = this.get('limit');
      var players = model.get('players').clone();
      players.comparator = function(a, b) {
        return b.get('points') - a.get('points');
      };
      players.sort();
      return players.first(limit);
    });

    var tops = vm.get('topPlayers');

    strictEqual(tops.length, 2, 'Top players length should be two');
    strictEqual(computations, 1, 'One computation should have been run');
    strictEqual(tops[0].get('name'), 'Bob', 'Top player should be Bob');
    strictEqual(tops[1].get('name'), 'Charles', 'Next player should be Charles');

    model.get('players').add({ name: 'Edgar', points: 4 });
    tops = vm.get('topPlayers');
    strictEqual(tops[0].get('name'), 'Edgar', 'Top player should be Edgar after add');
    strictEqual(computations, 2, 'Two computations should have been run');

    strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
  });

  test("tracking nested computations", function() {
    var computations = 0;

    var a = new Backbone.ViewModel({
      first: 'Hunter',
      last: 'Loftis'
    });

    var b = new Backbone.ViewModel();
    b.virtual('fullname', function(attr) {
      return a.get('first') + ' ' + a.get('last');
    });

    var c = new Backbone.ViewModel({
      label: 'Full name: '
    });
    c.virtual('caption', function(attr) {
      computations++;
      return this.get('label') + b.get('fullname');
    });

    strictEqual(c.get('caption'), 'Full name: Hunter Loftis', 'caption should be Full name: Hunter Loftis');
    strictEqual(computations, 1, 'one compuation should have run');

    a.set('first', 'Brooke');
    strictEqual(c.get('caption'), 'Full name: Brooke Loftis', 'caption should be Full name: Brooke Loftis');
    strictEqual(computations, 2, 'two computations should have run');

    c.set('label', 'My name: ');
    strictEqual(c.get('caption'), 'My name: Brooke Loftis', 'caption should be My name: Brooke Loftis');
    strictEqual(computations, 3, 'three computations should have run');

    strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
  });

test("object syntax on a virtual", function() {
  var gets = 0, sets = 0;

  var user = new Backbone.Model({
    first: 'Hunter',
    last: 'Loftis'
  });

  var vm = new Backbone.ViewModel({
    model: user
  });

  vm.virtual('first', 'last', {
    get: function(attr) {
      gets++;
      var model = this.get('model');
      return model.get(attr);
    },
    set: function(attr, val) {
      sets++;
      var model = this.get('model');
      return model.set(attr, val);
    }
  });

  strictEqual(user.get('first'), 'Hunter', 'Model should have .first = Hunter');
  strictEqual(user.get('last'), 'Loftis', 'Model should have .last = Loftis');
  strictEqual(vm.get('first'), 'Hunter', 'ViewModel should have .first = Hunter');
  strictEqual(vm.get('last'), 'Loftis', 'ViewModel should have .last = Loftis');

  strictEqual(gets, 2, 'get should have been called twice');
  strictEqual(sets, 0, 'set should not have been called');

  user.set('first', 'Brooke');
  strictEqual(vm.get('first'), 'Brooke', '.first should be Brooke after .set()');
  strictEqual(gets, 3, 'gets should be three');

  strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
});

test("function passthrough syntax on a virtual", function() {
  var gets = 0, sets = 0;

  var user = new Backbone.Model({
    first: 'Hunter',
    last: 'Loftis'
  });

  var vm = new Backbone.ViewModel({
    model: user
  });

  vm.virtual('first', 'last', function() {
    gets++;
    return this.get('model');
  });

  strictEqual(user.get('first'), 'Hunter', 'Model should have .first = Hunter');
  strictEqual(user.get('last'), 'Loftis', 'Model should have .last = Loftis');
  strictEqual(vm.get('first'), 'Hunter', 'ViewModel should have .first = Hunter');
  strictEqual(vm.get('last'), 'Loftis', 'ViewModel should have .last = Loftis');

  strictEqual(gets, 2, 'get should have been called twice');
  strictEqual(sets, 0, 'set should not have been called');

  user.set('first', 'Brooke');
  strictEqual(vm.get('first'), 'Brooke', '.first should be Brooke after .set()');
  strictEqual(gets, 3, 'gets should be three');

  strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
});

test("model passthrough syntax on a virtual", function() {

  var user = new Backbone.Model({
    first: 'Hunter',
    last: 'Loftis'
  });

  var vm = new Backbone.ViewModel();

  vm.virtual('first', 'last', user);

  strictEqual(user.get('first'), 'Hunter', 'Model should have .first = Hunter');
  strictEqual(user.get('last'), 'Loftis', 'Model should have .last = Loftis');
  strictEqual(vm.get('first'), 'Hunter', 'ViewModel should have .first = Hunter');
  strictEqual(vm.get('last'), 'Loftis', 'ViewModel should have .last = Loftis');

  user.set('first', 'Brooke');
  strictEqual(vm.get('first'), 'Brooke', '.first should be Brooke after .set()');

  strictEqual(Backbone.Virtual._computations.length, 0, 'computation stack should be clear');
});

});