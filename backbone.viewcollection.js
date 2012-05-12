(function(Backbone) {

  // Store reference to old methods
  var proto = Backbone.Collection.prototype;

  Backbone.ViewCollection = Backbone.Collection.extend({
    // TODO: ViewCollection methods
  });

  // Use the external, monkeypatched version of Backbone.Model instead of the internal closed-over Model
  Backbone.Collection.prototype.model = Backbone.Model;

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

  // Alias ViewCollection to Collection
  Backbone.Collection = Backbone.ViewCollection;

})(Backbone);