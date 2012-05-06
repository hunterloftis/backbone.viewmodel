$(document).ready(function() {

  module("Binding - Submit");
  
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
  
});