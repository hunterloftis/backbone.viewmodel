$(document).ready(function() {

  module("Independent Bindings");

  test("'visible' binding", function() {

    var vm = new Backbone.ViewModel({
      isVisible: false
    });

    strictEqual($('#testVisible').css('display'), 'block', 'no effect to visible before binding');

    vm.bindView('data-test-visible');
    strictEqual($('#testVisible').css('display'), 'none', 'bind visible to a base value');

    vm.set('isVisible', true);
    strictEqual($('#testVisible').css('display'), 'block', 'display property should update to "block" when bound base value updates');

    vm.unbindView();
    strictEqual($('#testVisible').css('display'), 'block', 'display property should update to "block" when bound base value updates');

    vm.set('isVisible', false);
    strictEqual(vm.get('isVisible'), false, 'viewmodel base is changed');
    strictEqual($('#testVisible').css('display'), 'block', 'view bound to base is unchanged');
  });

  test("'text' binding", function() {
    var vm = new Backbone.ViewModel({
      name: 'Hunter'
    });

    strictEqual($('#testText').text(), 'unset', 'Text is initially "unset"');

    vm.bindView('data-test-text');
    strictEqual($('#testText').text(), 'Hunter', 'Text is "Hunter" after binding');

    vm.set({name: 'Amy'});
    strictEqual($('#testText').text(), 'Amy', 'Text is "Amy" after .set()');

    vm.unbindView();
    strictEqual($('#testText').text(), 'Amy', 'Text is still "Amy" after unbinding the view');

    vm.set({name: 'Shouldnothappen'});
    strictEqual($('#testText').text(), 'Amy', 'Text is still "Amy" after unbound .set()');
  });

  test("'val' binding", function() {
    var vm = new Backbone.ViewModel({
      name: 'Hunter'
    });

    strictEqual($('#testVal').val(), 'unset', 'Input is initially "unset"');

    vm.bindView('data-test-val');
    strictEqual($('#testVal').val(), 'Hunter', 'Text is "Hunter" after binding');

    vm.set({name: 'Amy'});
    strictEqual($('#testVal').val(), 'Amy', 'Text is "Amy" after .set()');

    vm.unbindView();
    strictEqual($('#testVal').val(), 'Amy', 'Text is still "Amy" after unbinding the view');

    vm.set({name: 'Shouldnothappen'});
    strictEqual($('#testVal').val(), 'Amy', 'Text is still "Amy" after unbound .set()');

    vm.set({name: 'Edit this'});
    vm.bindView('data-test-val');
    strictEqual($('#testVal').val(), 'Edit this', 'Text is "Edit this" after re-binding');

    $('#testVal').val('typing');
    $('#testVal').trigger('keyup');
    strictEqual(vm.get('name'), 'typing', 'Model is "typing" after View gets input');
  });

});