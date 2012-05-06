$(document).ready(function() {

  module("Backbone.ViewModel.compute()");

  test("tracking a simple computation within a ViewModel", function() {

    var computations = 0;

    var vm = new Backbone.ViewModel({
      base: 1
    });

    vm.compute('triple', function() {
      computations++;
      return this.get('base') * 3;
    });

    strictEqual(vm.get('triple'), 3, 'initial computation should be 3');
    strictEqual(computations, 1, 'computation should be run once');

    vm.set('base', 2);
    strictEqual(vm.get('triple'), 6, 'computation should be 6 after base update');
    strictEqual(computations, 2, 'computation should be run twice');
  });

  test("tracking a simple computation across ViewModels", function() {

    var computations = 0;

    var a = new Backbone.ViewModel({
      base: 1
    });

    var b = new Backbone.ViewModel({
      model: a
    });

    b.compute('triple', function() {
      computations++;
      return this.get('model').get('base') * 3;
    });

    strictEqual(b.get('triple'), 3, 'initial computation should be 3');
    strictEqual(computations, 1, 'computation should be run once');

    a.set('base', 2);
    strictEqual(b.get('triple'), 6, 'computation should be 6 after base update');
    strictEqual(computations, 2, 'computation should be run twice');
  });

return;

  test("filtering a model", function() {

    var model = new Backbone.ViewModel({
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

    vm.compute('topPlayers', function() {
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
    strictEqual(tops[0].get('name'), 'Bob', 'Top player should be Bob');
    strictEqual(tops[1].get('name'), 'Charles', 'Next player should be Charles');

    tops = vm.get('topPlayers');
    model.get('players').add({ name: 'Edgar', points: 4 });
    strictEqual(tops[0].get('name'), 'Edgar', 'Top player should be Edgar after add');

  });

});