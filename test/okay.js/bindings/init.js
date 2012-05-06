$(document).ready(function() {

  module("Binding - Init");

  test("calling initialization function on bind", function() {
    var div = $('#testInit');
    
    var testVM = {
      build_dom: function(el) {
        // Modify the element here
        $(el).append($('<div>New div</div>'));
      }
    };
    
    strictEqual(div.children().size(), 0, 'div should start with 0 children.');

    ok.bind(testVM, 'init');
    
    strictEqual(div.children().size(), 1, 'div should have 1 child after binding.');
    
  });
    
});