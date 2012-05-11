$(document).ready(function() {

  module("Backbone.Binding");

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

  test("'css' binding", function() {
    var vm = new Backbone.ViewModel({
      isRed: false,
      isGreen: 0,
      isBlue: undefined,
      isTransparent: true
    });

    vm.compute('isWhite', function() {
      return this.get('isRed') && this.get('isGreen') && this.get('isBlue');
    });

    strictEqual($('#testCss').attr('class'), 'existing', 'Existing class should be present before binding');

    vm.bindView('data-test-css');
    strictEqual($('#testCss').attr('class'), 'existing transparent', 'Transparent should be appended to existing class');

    vm.set('isRed', true);
    strictEqual($('#testCss').attr('class'), 'existing transparent red', 'Red class should be appended after set');

    vm.set('isTransparent', false);
    strictEqual($('#testCss').attr('class'), 'existing red', 'Transparent class should be removed after set');

    vm.set('isBlue', 'astring');
    strictEqual($('#testCss').attr('class'), 'existing red blue', 'Blue class should be added with "astring"');

    vm.set('isGreen', true);
    strictEqual($('#testCss').attr('class'), 'existing red blue green white', 'Green class should automatically add white class');

    strictEqual($('#testInvertedCss').attr('class'), '', 'Inverted CSS should be classless');

    vm.set('isRed', null);
    strictEqual($('#testInvertedCss').attr('class'), 'red', 'Inverted CSS should become red when isRed is falsy');
  });

});