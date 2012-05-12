(function(Backbone) {

  // The original Backbone.Collection that we're extending
  var proto = Backbone.Collection.prototype;

  Backbone.ViewCollection = Backbone.Collection.extend({
    // TODO: ViewCollection methods
  });

  // Add tracking to Backbone.Collection
  function extendCollection(name) {
    Backbone.ViewCollection.prototype[name] = function() {
      // Trigger an update on any write operation...
      Backbone.Virtual.track(this, 'add remove reset change create sort');
      return proto[name].apply(this, arguments);
    };
  }
  // ...if a Virtual function performs a Collection read operation:
  _.each(['get', 'getByCid', 'where', 'pluck', 'clone', 'at', 'toJSON'], extendCollection);

  // Alias back to Collection
  Backbone.Collection.prototype = Backbone.ViewCollection.prototype;

})(Backbone);