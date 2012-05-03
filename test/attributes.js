describe('Attributes', function() {
  describe('setting and getting', function() {
    var vm = new Backbone.ViewModel({
      num: 123,
      str: 'abc',
      bool: false
    });
    strictEqual(vm.)
  });
});

$(document).ready(function() {

  module("Bases");

  test("setting and getting", function() {
    var base, obj;
    obj = {
      num: 123,
      str: 'abc',
      bool: false
    };
    base = ok.base('abc');
    strictEqual(base(), 'abc', 'can store a string in a base');
    base = ok.base(123);
    strictEqual(base(), 123, 'can store a number in a base');
    base = ok.base(true);
    strictEqual(base(), true, 'can store a boolean in a base');
    base = ok.base(null);
    strictEqual(base(), null, 'can store null in a base');
    base = ok.base(undefined);
    strictEqual(base(), undefined, 'can store undefined in a base');
    base = ok.base(obj);
    strictEqual(base(), obj, 'can store an object in a base');
    base('replaced');
    strictEqual(base(), 'replaced', 'can replace a stored base');
  });

  test("undefined bases", function() {
    var base = ok.base();
    strictEqual(typeof(base()), 'undefined', 'empty base returns undefined');
    base('okay');
    strictEqual(base(), 'okay', 'assigning a value to an empty base works');
  });

  test("subscribing to updates", function() {
    var base = ok.base('abc'),
        val = base();
    base.subscribe(function(newVal) {
      val = newVal;
    });
    strictEqual(val, 'abc', 'initial value is correct');
    base(123);
    strictEqual(val, 123, 'subscription updates on value change');
  });

});