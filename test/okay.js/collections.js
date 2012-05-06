$(document).ready(function() {

  module("Collections");
  
  test("creating a collection", function() {
    var collection, a = ['abc', 123, true];
    collection = ok.collection(a);
    strictEqual(collection(), a, 'can get full array');
    strictEqual(collection()[0], 'abc', 'can get first element');
    strictEqual(collection()[1], 123, 'can get second element');
    strictEqual(collection()[2], true, 'can get third element');
    collection = ok.collection([0, 1, 2, 3, 4]);
    strictEqual(collection().length, 5, 'collection can be replaced');
    strictEqual(collection()[0], 0, 'collection can be replaced');
  });
  
  test("undefined collections", function() {
    var collection = ok.collection();
    strictEqual(typeof(collection()), 'undefined', 'collection can be instantiated without an array');
    collection.push(1);
    strictEqual(collection()[0], 1, 'array method access converts undefined collection to empty array')
  });
  
  test("array methods on collection object (pop, push, reverse, etc...)", function() {
    var a = [], collection, i, ret;
    for (i = 0; i < 100; i++) {
      a.push(i);
    }
    collection = ok.collection(a);
    ret = collection.pop();
    strictEqual(ret, 99, '.pop returns correct value');
    strictEqual(collection().length, 99, '.pop removes last value');
    ret = collection.push('abc');
    strictEqual(collection()[99], 'abc', '.push adds correct value to end');
    strictEqual(ret, 100, '.push increases length');
    collection.reverse();
    strictEqual(collection()[0], 'abc', '.reverse reverses order');
    strictEqual(collection()[99], 0, '.reverse reverses order');
    ret = collection.shift();
    strictEqual(ret, 'abc', '.shift returns correct value');
    strictEqual(collection().length, 99, '.shift decreases length');
    collection.sort();
    strictEqual(collection()[0], 0, '.sort sorts by value');
    strictEqual(collection()[98], 98, '.sort sorts by value');
    collection.splice(10, 3, 'abc');
    strictEqual(collection()[10], 'abc', '.splice inserts correct value at correct position');
    strictEqual(collection()[11], 20, '.splice correctly removes elements');
    collection.unshift('beginning');
    strictEqual(collection()[0], 'beginning', '.unshift adds value to beginning of array');
    strictEqual(collection().length, 98, '.unshift increases length of array');
  });
  
  test('tracking dependencies on collections', function() {
    var collection = ok.collection([1, 2, 3]),
        dependent = ok.dependent(function() {
          var c = collection();
          return c[c.length - 1];
        });
    strictEqual(collection().length, 3, 'collection has a length of 3');
    strictEqual(collection()[0], 1, 'collection starts with 1');
    strictEqual(collection()[2], 3, 'collection ends with 3');
    strictEqual(dependent(), 3, 'dependent maps to last element in collection');
    collection.push(4);
    strictEqual(collection().length, 4, 'collection now has a length of 5');
    strictEqual(dependent(), 4, 'dependent still maps to last element in collection');
  });

});