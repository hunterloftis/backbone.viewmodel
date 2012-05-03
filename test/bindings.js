$(document).ready(function() {

  module("Bindings");
  
  test("simple bindings", function() {
    
    var viewModel = {
      testVisible: ok.base(false)
    };
    viewModel.testHtml = ok.dependent(function() {
      if (this.testVisible()) {
        return 'visible';
      }
      return 'invisible';
    }, viewModel);
    
    strictEqual($('#testVisible').css('display'), 'block', 'no effect to visible before binding');
    strictEqual($('#testHtml').html(), 'html', 'no effect to html before binding');
    
    ok.bind(viewModel);
    
    strictEqual($('#testVisible').css('display'), 'none', 'bind visible to a base value');
    strictEqual($('#testHtml').html(), 'invisible', 'bind html to a dependent value');
    
    viewModel.testVisible(true);
    
    strictEqual($('#testVisible').css('display'), 'block', 'display property should update to "block" when bound base value updates');
    strictEqual($('#testHtml').html(), 'visible', 'html property should be "visible" after bound dependent autoupdates');
    
    ok.unbind();

    viewModel.testVisible(false);
    
    strictEqual(viewModel.testVisible(), false, 'viewmodel base is changed');
    strictEqual(viewModel.testHtml(), 'invisible', 'viewmodel dependent is changed');
    strictEqual($('#testVisible').css('display'), 'block', 'view bound to base is unchanged');
    strictEqual($('#testHtml').html(), 'visible', 'view bound to dependent is unchanged');
    
  });
  

  test("simple namespaced bindings", function() {
    
    var vm1 = {
      visible: ok.base(false)
    };
    
    var vm2 = {
      visible: ok.base(false)
    }
    
    strictEqual($('#namespace1').css('display'), 'block', 'no effect to namespaced nodes before binding');
    strictEqual($('#namespace2').css('display'), 'block', 'no effect to namespaced nodes before binding');
    
    ok.bind(vm1, 'namespace1');

    strictEqual($('#namespace1').css('display'), 'none', 'namespaced nodes can bind to view model');
    strictEqual($('#namespace2').css('display'), 'block', 'other namespaces are unaffected');
    
    ok.bind(vm2, 'namespace2');
    
    strictEqual($('#namespace2').css('display'), 'none', 'other namespaces can bind to different view models');
    
    vm1.visible(true);
    
    strictEqual($('#namespace1').css('display'), 'block', 'namespaced view models update nodes on change');
    strictEqual($('#namespace2').css('display'), 'none', 'other namespaces are unaffected');
    
    ok.unbind('namespace1');
    vm1.visible(false);
    vm2.visible(true);
    
    strictEqual($('#namespace1').css('display'), 'block', 'namespaces can be unbound');
    strictEqual($('#namespace2').css('display'), 'block', 'other namespaces are unaffected');
  });
    
});