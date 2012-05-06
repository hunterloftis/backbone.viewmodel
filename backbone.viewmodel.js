(function(Backbone) {

  Backbone.ViewModel = Backbone.Model.extend({

    initialize: function(attributes, options) {
      this._bindings = [];
      this._computes = {};
      this._tracking = false;
      this._tracked = [];
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
      if (this._tracking) {
        this._tracked.push(attr);
      }
      return this.attributes[attr];
    },

    compute: function(attr, fn) {
      this._computes[attr] = {
        fn: fn,
        dependencies: [],
        listeners: []
      };
      this.set(attr, this.runCompute(attr));
    },

    runCompute: function(attr) {
      var compute = this._computes[attr];
      result = compute.fn.call(this);
      return result;
    },

    startTracking: function() {
      this._tracking = true;
      this._tracked = [];
    },

    stopTracking: function() {
      this._tracking = false;
      var deps = this._tracked;
      this._tracked = [];
      return deps;
    }

  });

})(Backbone);