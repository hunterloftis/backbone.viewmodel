$(document).ready(function() {

  module("Binding - Value");
  
  test("reading and updating values", function() {
    var input = $('#valueInput');
    
    var valueVM = {
      testValue: ok.base('one')
    };
    
    ok.bind(valueVM, 'value');
    
    strictEqual(input.val(), 'one', 'binding sets value on dom node');
    
    valueVM.testValue('two');
    
    strictEqual(input.val(), 'two', 'updating bound value updates dom node');
    
    ok.unbind('value');
    
    valueVM.testValue('three');
    
    strictEqual(input.val(), 'two', "dom nodes don't update after unbinding");
  });
  
  test("writing values from the dom", function() {
    var input = $('#valueInput');
    
    var valueVM = {
      testValue: ok.base('preset')
    };
    
    input.val('');
    
    strictEqual(input.val(), '', 'input box begins empty');
    
    ok.bind(valueVM, 'value');
    
    strictEqual(input.val(), 'preset', 'input box updates to vm value on bind');
    
    input.val('written');
    input.trigger('keyup');
    
    strictEqual(valueVM.testValue(), 'written', 'input box edits change the vm values on blur');
  });

  test("checkboxes", function() {
    expect(5);
    
    var input = $('#valueCheck');
    
    var valueVM = {
      toggle: ok.base(true)
    };
    
    strictEqual(input.is(':checked'), false, 'checkbox is initially false');
    
    ok.bind(valueVM, 'check');
    
    strictEqual(input.is(':checked'), true, 'checkbox should be checked after binding.');
    
    valueVM.toggle(false);
    
    strictEqual(input.is(':checked'), false, 'checkbox should be unchecked after VM change.');
    
    input.attr('checked', 'checked');
    input.trigger('change');
    
    stop();
    setTimeout(function() {
      strictEqual(valueVM.toggle(), true, 'VM should be true after checkbox click.');
      input.removeAttr('checked');
      input.trigger('change');
      start();
    }, 1);
    
    stop();
    setTimeout(function() {
      strictEqual(valueVM.toggle(), false, 'VM should be false after another checkbox click.');
      start();
    }, 10);
    
  });
  
});