$(document).ready(function() {

  module("Bindings - Debouncing");
  
  var repeat_renders = 0,
      html_renders = 0;
  
  // Hijack repeater update
  var repeat_update = ok.debug.RepeatBinding.prototype._update;
  ok.debug.RepeatBinding.prototype._update = function(val) {
    repeat_renders++;
    repeat_update.call(this, val);
  }
    
  // Hijack html update
  var html_update = ok.debug.HtmlBinding.prototype._update;
  ok.debug.HtmlBinding.prototype._update = function(val) {
    html_renders++;
    html_update.call(this, val);
  }
  
  function Base(val) {
    this.value = ok.base(val);
    this.label = ok.dependent(function() {
      return parseInt(this.value(), 10);
    }, this);
  }
  
  function Incrementor(previous) {
    this.prev = previous;
    
    this.value = ok.dependent(function() {
      return (this.prev.value() + 1);
    }, this);
    
    this.label = ok.dependent(function() {
      return parseInt(this.value(), 10);
    }, this);
  }
  
  var vm = {
    items: ok.collection([])
  };
  
  var ul = $('#testDebounce');
  
  test("multiple updates to a single repeat binding", function() {
    
    expect(9);
    
    repeat_renders = 0;
    html_renders = 0;
    
    strictEqual(ul.children().size(), 0, 'Size should be empty before binding.');
    
    var bindings = ok.bind(vm, 'debounce');
    
    strictEqual(ul.children().size(), 0, 'Size should be empty before adding items.');
    strictEqual(repeat_renders, 0, 'Renders should be zero before call stack is empty.');
    strictEqual(bindings.length, 1, 'Should have one (repeater) binding.');
    
    stop();
    setTimeout(function() {
      strictEqual(repeat_renders, 1, 'Renders should be one before adding items.');
      start();
    }, 100);
    
    // Add initial items
    var last = new Base(1);
    vm.items.push(last);
    for(var i = 0; i < 9; i++) {
      last = new Incrementor(last);
      vm.items.push(last);
    }
    
    stop();
    setTimeout(function() {
      strictEqual(ul.children().size(), 10, 'Size should be 10 after adding items.');
      strictEqual(repeat_renders, 1, 'Renders should be 1 after adding items.');
      strictEqual($(ul.children().get(0)).html(), '1', 'First item should be 1.');
      strictEqual($(ul.children().get(9)).html(), '10', 'Last item should be 10.');
      start();
    }, 100);
    
    
  });
  
  test("multiple updates to a single html binding", function() {
    
    expect(3);
    
    html_renders = 0;
    
    // Change the base item
    for(var i = 101; i < 111; i++) {
      vm.items()[0].value(i);
    }
    
    stop();
    setTimeout(function() {
      strictEqual(html_renders, 10, 'Renders should be 10 after changing the base item.');
      strictEqual($(ul.children().get(0)).html(), '110', 'First item should be 101.');
      strictEqual($(ul.children().get(9)).html(), '119', 'Last item should be 110.');
      start();
    }, 100);
    
  });
  
  var then = 0;
  function timer() {
    var now = new Date().getTime();
    var time = now - then;
    then = now;
    return time;
  }
  
  test("adding new items to bound repeaters", function() {
    
    var renderVM = {
      items: ok.collection([])
    };
  
    html_renders = 0;
    
    ok.bind(renderVM, 'dbrender');
    
    strictEqual(html_renders, 0, 'Renders should be 0 before adding items.');
    
    // Add initial items
    var last = new Base(1);
    renderVM.items.push(last);
    for(var i = 0; i < 9; i++) {
      last = new Incrementor(last);
      renderVM.items.push(last);
    }
    
    strictEqual(html_renders, 0, 'Renders should be 0 after adding items.');
    
  });
  
  return;

  test("speed test", function() {

    var item_count = 256;
    var change_range = 256;
    
    var bindVM = {
      items: ok.collection([])
    };
    
    var watchVM = {
      items: ok.collection([])
    };
    
    ok.bind(bindVM, 'bindSpeed');
    ok.bind(watchVM, 'watchSpeed');
    
    timer();
    
    // Add initial items to bindVM
    last = new Base(1);
    bindVM.items.push(last);
    for(var i = 0; i < item_count; i++) {
      last = new Incrementor(last);
      bindVM.items.push(last);
    }
    
    var bind_add = timer();
    
    // Change the base item
    for(var i = 100; i < 100 + change_range; i++) {
      bindVM.items()[0].value(i);
    }
    
    var bind_update = timer();
    
    // Add initial items to watchVM
    last = new Base(1);
    watchVM.items.push(last);
    for(var i = 0; i < item_count; i++) {
      last = new Incrementor(last);
      watchVM.items.push(last);
    }
    
    var watch_add = timer();
    
    // Change the base item
    for(var i = 100; i < 100 + change_range; i++) {
      watchVM.items()[0].value(i);
    }
    
    var watch_update = timer();
    
    console.log("bind add: " + bind_add + ", update: " + bind_update);
    console.log("watch add: " + watch_add + ", update: " + watch_update);
  });
  
});