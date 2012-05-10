(function(Backbone) {

  Backbone.ViewModel = Backbone.Model.extend({

    initialize: function(attributes, options) {
      this._virtuals = {};
      this._bindings = [];
    },

    // TODO: This probably gets called twice whenever a virtual value is manually set()
    // Once for when the property is initially set, then when the property triggers its referenced model to change
    // the model change will trigger this set() again. Try to eliminate this inefficiency.
    set: function(key, value, options) {
      var virtual;
      // Call virtual's set() unless this was triggered by a dependency change
      if (!(options && options.dependency)) {
        virtual = this._virtuals && this._virtuals.hasOwnProperty(key) && this._virtuals[key];
        if (virtual) {
          return virtual.set.call(this, key, value, options, virtual);
        }
      }
      return Backbone.Model.prototype.set.apply(this, arguments);
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
      Backbone.Virtual.track(this, 'change:' + attr);
      return this.attributes[attr];
    },

    compute: function() {
      var args = _.toArray(arguments);
      var get = args.pop();
      args.push({ get: get });
      this.virtual.apply(this, args);
    },

    pass: function() {
      var args = _.toArray(arguments);
      var reference = args.pop();
      args.push({ reference: reference });
      this.virtual.apply(this, args);
    },

    virtual: function() {
      var attrs = _.toArray(arguments);
      var options = attrs.pop();
      options.model = this;
      return _.map(attrs, this.createVirtual(options), this);
    },

    createVirtual: function(options) {
      var self = this;
      return function(attr) {
        var opts = _.extend({}, options, { attr: attr });
        var newVirtual = new Backbone.Virtual(opts);
        self._virtuals[attr] = newVirtual;
        newVirtual.on('change', self.onVirtual, self);
        newVirtual.run();
      };
    },

    onVirtual: function(virtual) {
      this.set(virtual.attr, virtual.result, { dependency: true });
    }

  });

})(Backbone);(function(Backbone) {

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
    set: function(attr, val, options, virtual) {
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

  // Click Binding
  var ClickBinding = Backbone.Binding['click'] = Backbone.Binding.extend({
    start: function() {
      $(this.node).on('click', this.onViewChange);
    },
    onViewChange: function(event) {
      event.preventDefault();
      this.viewModel.get(this.attribute).call(this.viewModel);
    },
    stop: function() {
      $(this.node).off('click', this.onViewChange);
    }
  });

})(Backbone);