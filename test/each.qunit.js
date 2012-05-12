$(document).ready(function() {

  module("Backbone.Binding.each");

  test("basic rendering", function() {

    var vm = new Backbone.ViewModel({
      listItems: new Backbone.Collection([
        { label: 'a' },
        { label: 'b' },
        { label: 'c' },
        { label: 'd' }
      ])
    });

    var children = $('#simpleEach').children();

    children = $('#simpleEach').children();
    strictEqual(children.length, 1, 'UL should begin with single LI for templating');
    strictEqual($(children[0]).text(), 'default content', 'first LI should be "default content"');

    vm.bindView('data-each-simple');
    children = $('#simpleEach').children();
    strictEqual(children.length, 4, 'UL should have four children');
    strictEqual($(children[0]).text(), 'a', 'first LI should be "a"');
    strictEqual($(children[1]).text(), 'b', 'first LI should be "b"');
    strictEqual($(children[2]).text(), 'c', 'first LI should be "c"');
    strictEqual($(children[3]).text(), 'd', 'first LI should be "d"');
  });

});