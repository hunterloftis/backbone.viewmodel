$(document).ready(function() {

  module("Binding - Css");
  
  test("setting two classes from a base", function() {
    var div = $('#testCss');
    
    var vm = {
      first: ok.base(false),
      second: ok.base(true)
    };
    
    strictEqual($(div).hasClass('default'), true, 'div starts with class "default"');
    
    ok.bind(vm, 'css');
    
    strictEqual($(div).hasClass('default'), true, 'div keeps original classes after binding');
    strictEqual($(div).hasClass('first'), false, '"first" class is false after binding');
    strictEqual($(div).hasClass('second'), true, '"second" class is true after binding');
    
    vm.first(true);
    vm.second(false);
    
    strictEqual($(div).hasClass('first'), true, '"first" class is true after update');
    strictEqual($(div).hasClass('second'), false, '"second" class is false after update');
    
  });
  
});