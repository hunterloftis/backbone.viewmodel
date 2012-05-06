(function(Backbone) {

  Backbone.ViewModel = Backbone.Model.extend({

    initialize: function(attributes, options) {
      this._bindings = [];
      this._computes = {};
    },

    bindView: function(attribute, container) {
      container = container || 'body';
      var nodes = $(container).find('*[' + attribute + ']');

      _.each(nodes, this.bindToNode(attribute));
    },

    unbindView: function() {
      _.each(this._bindings, function(binding) {
        binding.stop();
      });
      this._bindings = [];
    },

    isBoundTo: function(node) {
      return _.any(this._bindings, function(binding) {
        return binding.node === node;
      });
    },

    bindToNode: function(attribute) {
      var self = this;
      return function(node) {
        if (self.isBoundTo(node)) return;

        var bindingString = $(node).attr(attribute);
        var bindingList = bindingString.split(',');
        var descriptions = _.map(bindingList, self.parseBinding(node));

        _.each(descriptions, self.createBinding, self);
      };
    },

    parseBinding: function(node) {
      var self = this;
      return function(bindingPair) {
        var bindingSplit = bindingPair.split(':');
        var type = bindingSplit[0].trim();
        var attribute = bindingSplit[1].trim();
        return {
          type: type,
          node: node,
          viewModel: self,
          attribute: attribute
        };
      };
    },

    createBinding: function(description) {
      var Binding = Backbone.Binding[description.type];
      if (Binding) {
        var binding = new Binding(description);
        if (binding) {
          binding.start();
          this._bindings.push(binding);
          return binding;
        }
        throw new Error("Unable to create '" + description.type + "' binding");
      }
      throw new Error("Trying to create a binding of unknown type '" + description.type + "'");
    },

    // Get the value of an attribute.
    get: function(attr) {
      Backbone.Computed.track(this, 'change:' + attr);
      return this.attributes[attr];
    },

    compute: function(attr, fn) {
      var newComputed = new Backbone.Computed(attr, fn, this);
      this._computes[attr] = newComputed;
      newComputed.on('change', this.onCompute, this);
      newComputed.run();
    },

    onCompute: function(compute) {
      this.set(compute.attr, compute.result);
    }

  });

})(Backbone);(function(Backbone) {

  // Generic Binding (all bindings inherit from this)
  // description is an object with: node, viewModel, attribute
  Backbone.Binding = function(description) {
    _.bindAll(this);
    _.extend(this, description);
    this.initialize.apply(this, arguments);
  };

  _.extend(Backbone.Binding.prototype, {
    initialize: function() {},
    start: function() {
      this.viewModel.on('change:' + this.attribute, this.onModelChange);
      this.onModelChange();
    },
    onModelChange: function() {},
    onViewChange: function() {},
    stop: function() {
      this.viewModel.off('change:' + this.attribute, this.onModelChange);
    }
  });

  Backbone.Binding.extend = Backbone.Model.extend;

})(Backbone);(function(Backbone) {

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
    if (typeof(fn) === 'function') {
      this.get = fn;
      this.safe = false;
    }
    else {
      // extend with: get, safe
      _.extend(this, fn);
      this.safe = fn.hasOwnProperty('fail');
    }
    this.context = context;
    this.dependencies = [];
    this.result = undefined;
  };

  _.extend(Backbone.Computed.prototype, Backbone.Events, {

    run: function() {
      Backbone.Computed.startTracking();
      if (this.safe) {
        try {
          this.result = this.get.call(this.context);
        }
        catch (e) {
          this.result = this.fail;
        }
      }
      else {
        this.result = this.get.call(this.context);
      }
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

})(Backbone);(function(Backbone) {

  // Visible Binding
  var VisibleBinding = Backbone.Binding['visible'] = Backbone.Binding.extend({
    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      if (val) {
        return $(this.node).show();
      }
      return $(this.node).hide();
    }
  });

  // Text Binding
  var TextBinding = Backbone.Binding['text'] = Backbone.Binding.extend({
    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      $(this.node).text(val);
    }
  });

  // Value Binding
  var ValueBinding = Backbone.Binding['val'] = Backbone.Binding.extend({
    start: function() {
      Backbone.Binding.prototype.start.apply(this, arguments);
      $(this.node).on('keyup change', this.onViewChange);
    },
    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      $(this.node).val(val);
    },
    onViewChange: function() {
      var val = $(this.node).val();
      this.viewModel.set(this.attribute, val);
    },
    stop: function() {
      Backbone.Binding.prototype.stop.apply(this, arguments);
      $(this.node).off('keyup change', this.onViewChange);
    }
  });

})(Backbone);