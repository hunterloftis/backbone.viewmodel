(function(Backbone) {

  Backbone.ViewModel = Backbone.Model.extend({

    initialize: function(attributes, options) {
      this._virtuals = {};
      this._bindings = [];
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

    virtual: function() {
      var args = _.toArray(arguments);
      var action = args[args.length - 1];
      var attrs = args.slice(0, args.length - 1);
      var get, set, fail, reference;
      if (action instanceof Backbone.Model) {
        // Passthrough model syntax
        reference = action;
      }
      else if (typeof action === 'function') {
        if (action.length === 0) {
          // Passthrough function syntax (function returns model)
          reference = action;
        }
        else {
          // Getter-only syntax
          get = action;
        }
      }
      else {
        // Object syntax (get, set, fail all optional)
        get = action.get;
        set = action.set;
        fail = action.fail;
        reference = action.reference;
      }
      return _.map(attrs, this.createVirtual({
        model: this,
        get: get,
        set: set,
        fail: fail,
        reference: reference
      }), this);
    },

    createVirtual: function(options) {
      var self = this;
      return function(attr) {
        console.log("Creating virtual for attr", attr);
        var opts = _.extend({}, options, { attr: attr });
        var newVirtual = new Backbone.Virtual(opts);
        self._virtuals[attr] = newVirtual;
        newVirtual.on('change', self.onVirtual, self);
        newVirtual.run();
      };
    },

    onVirtual: function(virtual) {
      this.set(virtual.attr, virtual.result);
    }

  });

})(Backbone);