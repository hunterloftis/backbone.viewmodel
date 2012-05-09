(function(Backbone) {

  // Add tracking to Backbone.Model
  Backbone.Model.prototype.get = function(attr) {
    Backbone.Virtual.track(this, 'change:' + attr);
    return this.attributes[attr];
  };

  // Add tracking to Backbone.Collection
  function extendCollection(name) {
    Backbone.Collection.prototype['_' + name] = Backbone.Collection.prototype[name];
    Backbone.Collection.prototype[name] = function() {
      // Trigger an update on any write operation...
      Backbone.Virtual.track(this, 'add remove reset change create sort');
      return this['_' + name].apply(this, arguments);
    };
  }
  // ...if a Virtual function performs a Collection read operation:
  _.each(['get', 'getByCid', 'where', 'pluck', 'clone', 'at', 'toJSON'], extendCollection);


  // Options = model, attr, get, set, fail
  Backbone.Virtual = function(options) {
    _.extend(this, options);
    this.dependencies = [];
    this.result = undefined;
  };

  _.extend(Backbone.Virtual.prototype, Backbone.Events, {

    run: function() {
      Backbone.Virtual.startTracking();
      if (this.hasOwnProperty('fail')) {
        try {
          this.result = this.get.call(this.model, this.attr, this);
        }
        catch (e) {
          this.result = this.fail;
        }
      }
      else {
        this.result = this.get.call(this.model, this.attr, this);
      }
      this.update(Backbone.Virtual.stopTracking());
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
    },

    // Default virtual .get()
    // TODO: remove the typeof checks in the getters/setters
    get: function(attr, virtual) {
      var model = (typeof virtual.reference === 'function') ?
        virtual.reference.call(this) : virtual.reference;
      return model.get(attr);
    },

    // Default virtual .set()
    // TODO: remove the typeof checks in the getters/setters
    set: function(attr, val, virtual) {
      var model = (typeof virtual.reference === 'function') ?
        virtual.reference.call(this) : virtual.reference;
      return model.set(attr, val);
    }

  });

  _.extend(Backbone.Virtual, {
    _computations: [],
    _dependencies: undefined,

    startTracking: function() {
      // Create a new array for tracking dependencies of this compute function
      Backbone.Virtual._dependencies = [];
      // Push the new tracking array onto the stack of computations
      Backbone.Virtual._computations.push(Backbone.Virtual._dependencies);
    },

    stopTracking: function() {
      // Pop the tracking array off of the stack
      var dependencies = Backbone.Virtual._computations.pop();
      // Point the tracking array to the next item on the stack
      Backbone.Virtual._dependencies = Backbone.Virtual._computations.length ?
        Backbone.Virtual._computations(Backbone.Virtual._computations.length - 1) :
        undefined;
      return dependencies;
    },

    track: function(model, event) {
      if (Backbone.Virtual._dependencies) {
        Backbone.Virtual._dependencies.push({
          model: model,
          event: event
        });
      }
    }
  });

})(Backbone);