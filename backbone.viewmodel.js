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
        var bindingList = bindingString.split(';');
        var descriptions = _.map(bindingList, self.parseBinding(node));

        _.each(descriptions, self.createBinding, self);
      };
    },

    parseBinding: function(node) {
      var self = this;
      return function(bindingPair) {
        var typeSplit = bindingPair.split('(');
        var type = typeSplit[0].trim();
        var argString = typeSplit[1].trim().slice(0, -1);
        var args = argString.split(',');
        args = _.map(args, self.parseArgument);
        // TODO: identify special data types here --
        // undefined, null, Numbers, Strings, true/false
        return {
          node: node,
          viewModel: self,
          type: type,
          args: args
        };
      };
    },

    parseArgument: function(arg) {
      arg = arg.trim();
      var map = {
        'undefined': undefined,
        'null': null,
        'true': true,
        'false': false
      };
      if (map[arg]) {
        arg = map[arg];
      }
      else if (arg.charAt[0] === '"' || arg.charAt[0] === "'") {
        // TODO: figure out what to do about string literals
      }
      else if (!isNaN(arg)) {
        arg = Number(arg);
      }
      return arg;
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

})(Backbone);