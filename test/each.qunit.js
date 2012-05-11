$(document).ready(function() {

  module("Backbone.Binding.each");

  test("basic rendering", function() {

    var vm = new Backbone.ViewModel({
      listItems: new Backbone.Collection([
        new Backbone.Model({ text: 'a' }),
        new Backbone.Model({ text: 'b' }),
        new Backbone.Model({ text: 'c' }),
        new Backbone.Model({ text: 'd' })
      ])
    });

    vm.bindView('data-each-simple');
    strictEqual($('#simpleEach').children().length, 4, 'UL should have four children');
  });

});