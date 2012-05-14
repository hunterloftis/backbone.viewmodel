(function(Backbone) {

  // Store reference to old methods
  var proto = Backbone.Collection.prototype;

  // Writes: methods that should trigger re-evaluation of dependent values
  var writes = 'add remove reset change create sort';

  // Reads: methods that indicate this collection is a dependency of another value
  var backboneReads = ['get', 'getByCid', 'where', 'pluck', 'clone', 'at', 'toJSON'];
  var underscoreReads = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  Backbone.ViewCollection = Backbone.Collection.extend({
    // TODO: ViewCollection methods
    list: function() {
      Backbone.Virtual.track(this, writes);
      return this.models;
    }
  });

  // Use the external, monkeypatched version of Backbone.Model instead of the internal closed-over Model
  Backbone.Collection.prototype.model = Backbone.Model;

  // Add tracking to Backbone.Collection
  function extendCollection(name) {
    Backbone.ViewCollection.prototype[name] = function() {
      // Trigger an update on any write operation...
      Backbone.Virtual.track(this, writes);
      return proto[name].apply(this, arguments);
    };
  }
  // ...if a Virtual function performs a Collection read operation:
  _.each(backboneReads.concat(underscoreReads), extendCollection);

  // Alias ViewCollection to Collection
  Backbone.Collection = Backbone.ViewCollection;

})(Backbone);