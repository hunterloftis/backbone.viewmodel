$(document).ready(function() {

module("Backbone.ViewCollection");

test("tracking collection dependency through VMs and VCs", function() {

  var items = new Backbone.Collection();

  var vm = new Backbone.ViewModel({
    collection1: items
  });

  vm.compute('collection2', function() {
    var items = this.get('collection1');
    return items.filter(function(item) {
      return item.get('val') % 2 === 0;
    });
  });

  strictEqual(vm.get('collection2').length, 0, 'list should start out empty');

  items.add({ val: 2 });
  strictEqual(vm.get('collection2').length, 1, 'list should grow after adding an even number');
  strictEqual(vm.get('collection2')[0].get('val'), 2, 'after adding 2, should be in list');

});

});