$(document).ready(function() {

  module("Dependents");
  
  test("calculations based on bases", function() {
    var obj = {};
    obj.base = ok.base(1);
    obj.dependentTriple = ok.dependent(function() {
      return this.base() * 3;
    }, obj);
    strictEqual(obj.dependentTriple(), 3, 'dependent initializes accurately');
    obj.base(2);
    strictEqual(obj.dependentTriple(), 6, 'dependent recomputes accurately');
  });
  
  test('subscribing to updates', function() {
    var obj = {}, dependent;
    obj.base = ok.base(1);
    obj.dependentTriple = ok.dependent(function() {
      return this.base() * 3;
    }, obj);
    obj.dependentTriple.subscribe(function(newdependent) {
      dependent = newdependent;
    });
    dependent = obj.dependentTriple();
    strictEqual(dependent, 3, 'dependent has correct starting base');
    obj.base(2)
    strictEqual(dependent, 6, 'subscription updates dependent automatically')
  });
  
  test('tracking dependencies on bases', function() {
    var obj = {}, dependent, secondary;
    obj.toggled = ok.base(false);
    obj.first = ok.base('first');
    obj.second = ok.base('second');
    obj.dependent = ok.dependent(function() {
      if (!this.toggled()) {
        return this.first();
      }
      else {
        return this.second();
      }
    }, obj);
    obj.secondary = ok.dependent(function() {
      return this.dependent() + '-secondary';
    }, obj);
    obj.dependent.subscribe(function(newdependent) {
      dependent = newdependent;
    });
    obj.secondary.subscribe(function(newSecondary) {
      secondary = newSecondary;
    });
    dependent = obj.dependent();
    secondary = obj.secondary();
    strictEqual(dependent, 'first', 'dependent evaluates accurately before dependency switch');
    strictEqual(secondary, 'first-secondary', 'dependent based on another dependent evaluates accurately');
    obj.toggled(true);
    strictEqual(dependent, 'second', 'dependent evaluates accurately after dependency switch');
    strictEqual(secondary, 'second-secondary', 'dependent dependent on another dependent updates automatically');
  });
  
  test('tracking dependencies on dependents', function() {
    var base = ok.base(1),
        dep1 = ok.dependent(function() {
          return base() + 1;
        }),
        dep2 = ok.dependent(function() {
          return dep1() + 1;
        });
    strictEqual(base(), 1, 'base evaluates to 1');
    strictEqual(dep1(), 2, 'primary dependent evaluates to 2');
    strictEqual(dep2(), 3, 'secondary dependent evaluates to 3');
  });
  
});