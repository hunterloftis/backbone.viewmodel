(function(Backbone) {

  // Add tracking to Backbone.Model
  Backbone.Model.prototype.get = function(attr) {
    Backbone.Computed.track(this, 'change:' + attr);
    return this.attributes[attr];
  };

  // Add tracking to Backbone.Collection
  function extendCollection(name) {
    Backbone.Collection.prototype['_' + name] = Backbone.Collection.prototype[name];
    Backbone.Collection.prototype[name] = function() {
      // Trigger an update on any write operation...
      Backbone.Computed.track(this, 'add remove reset change create sort');
      return this['_' + name].apply(this, arguments);
    };
  }
  // ...if a Computed function performs a Collection read operation:
  _.each(['get', 'getByCid', 'where', 'pluck', 'clone', 'at', 'toJSON'], extendCollection);


  Backbone.Computed = function(attr, fn, context) {
    this.attr = attr;
    this.fn = fn;
    this.context = context;
    this.dependencies = [];
    this.result = undefined;
  };

  _.extend(Backbone.Computed.prototype, Backbone.Events, {

    run: function() {
      Backbone.Computed.startTracking();
      this.result = this.fn.call(this.context);
      this.update(Backbone.Computed.stopTracking());
      this.trigger('change', this);
      return this.result;
    },

    onChange: function() {
      this.run();
    },

    update: function(newDependencies) {
      _.each(this.dependencies, this.remove, this);
      _.each(newDependencies, this.add, this);
      this.dependencies = newDependencies;
    },

    remove: function(dependency) {
      dependency.model.off(dependency.event, this.onChange, this);
    },

    add: function(dependency) {
      dependency.model.on(dependency.event, this.onChange, this);
    }

  });

  _.extend(Backbone.Computed, {
    _computations: [],
    _dependencies: undefined,

    startTracking: function() {
      // Create a new array for tracking dependencies of this compute function
      Backbone.Computed._dependencies = [];
      // Push the new tracking array onto the stack of computations
      Backbone.Computed._computations.push(Backbone.Computed._dependencies);
    },

    stopTracking: function() {
      // Pop the tracking array off of the stack
      var dependencies = Backbone.Computed._computations.pop();
      // Point the tracking array to the next item on the stack
      Backbone.Computed._dependencies = Backbone.Computed._computations.length ?
        Backbone.Computed._computations(Backbone.Computed._computations.length - 1) :
        undefined;
      return dependencies;
    },

    track: function(model, event) {
      if (Backbone.Computed._dependencies) {
        Backbone.Computed._dependencies.push({
          model: model,
          event: event
        });
      }
    }
  });

})(Backbone);