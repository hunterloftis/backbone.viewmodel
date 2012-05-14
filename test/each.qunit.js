$(document).ready(function() {

  module("Backbone.Binding.each");

  test("rendering and updating", function() {

    var list1 = new Backbone.Collection([
      { label: 'a' },
      { label: 'b' },
      { label: 'c' },
      { label: 'd' }
    ]);

    var list2 = new Backbone.Collection([
      { label: 'e' },
      { label: 'f' },
      { label: 'g' },
      { label: 'h' }
    ]);

    var vm = new Backbone.Model({
      listItems: list1
    });

    var children = $('#simpleEach').children();

    children = $('#simpleEach').children();
    strictEqual(children.length, 1, 'UL should begin with single LI for templating');
    strictEqual($(children[0]).text(), 'default content', 'first LI should be "default content"');

    vm.bindView('data-each-simple');
    children = $('#simpleEach').children();
    strictEqual(children.length, 4, 'UL should have four children');
    strictEqual($(children[0]).text(), 'a', 'first LI should be "a"');
    strictEqual($(children[1]).text(), 'b', 'second LI should be "b"');
    strictEqual($(children[2]).text(), 'c', 'third LI should be "c"');
    strictEqual($(children[3]).text(), 'd', 'fourth LI should be "d"');

    vm.get('listItems').pop();
    children = $('#simpleEach').children();
    strictEqual(children.length, 3, 'UL should have three children after pop');
    strictEqual($(children[2]).text(), 'c', 'third LI should be "c"');

    vm.set('listItems', list2);
    children = $('#simpleEach').children();
    strictEqual(children.length, 4, 'UL should have four children');
    strictEqual($(children[0]).text(), 'e', 'first LI should be "e"');
    strictEqual($(children[1]).text(), 'f', 'second LI should be "f"');
    strictEqual($(children[2]).text(), 'g', 'third LI should be "g"');
    strictEqual($(children[3]).text(), 'h', 'fourth LI should be "h"');

    vm.get('listItems').shift();
    children = $('#simpleEach').children();
    strictEqual(children.length, 3, 'UL should have three children after pop');
    strictEqual($(children[0]).text(), 'f', 'first LI should be "f"');
  });

  test("rendering fragments and extended models", function() {
    expect(0);
    return;

    var Person = Backbone.Model.extend({
      defaults: {
        name: 'name default',
        gender: 'female',
        email: ''
      }
    });

    var people = new Backbone.Collection();

    people.push(new Person({
      name: 'Hunter',
      gender: 'male',
      email: 'hunter@hunterloftis.com'
    }));

    var peopleVM = new Backbone.ViewModel({
      people: people
    });



  });

  test("rendering the DOM efficiently", function() {
    expect(0);
    var vm = new Backbone.ViewModel({
      items: new Backbone.Collection()
    });

  });

});