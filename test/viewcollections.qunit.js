$(document).ready(function() {

module("Backbone.ViewCollection");

test("tracking collection dependency through VMs and VCs", function() {

  var items = new Backbone.Collection();

  var vm = new Backbone.ViewModel({
    collection1: items
  });

  vm.compute('collection2', function() {
    var items = this.get('collection1');
    return _.filter(items, function(item) {
      return item % 2 === 0;
    });
  });

  strictEqual(vm.get('collection2').length, 0, 'list should start out empty');

});

});