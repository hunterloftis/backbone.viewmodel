$(document).ready(function() {

  module("Backbone.ViewModel internals");

  test("parsing bindings", function() {
    var vm = new Backbone.ViewModel();

    strictEqual(vm.parseArgument('true'), true, 'String "true" should become boolean');
    strictEqual(vm.parseArgument('false'), false, 'String "false" should become boolean');
  });

});