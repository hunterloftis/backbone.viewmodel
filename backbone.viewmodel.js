(function(Backbone) {

  // description is an object with: node, viewModel, attribute
  var TextBinding = function(description) {
    _.bindAll(this);

    console.log("New 'text' binding:", description);
    _.extend(this, description);

    this.bind();
    this.onModelChange();
  };

  _.extend(TextBinding.prototype, {

    bind: function() {
      this.viewModel.on('change:' + this.attribute, this.onModelChange);
    },

    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      $(this.node).text(val);
    },

    unbind: function() {
      this.viewModel.removeListener('change:' + this.attribute, this.update);
    }
  });

  var ValBinding = function(description) {
    _.bindAll(this);

    console.log("New 'val' binding:", description);
    _.extend(this, description);

    this.bind();
    this.onModelChange();
  };

  _.extend(ValBinding.prototype, {

    bind: function() {
      this.viewModel.on('change:', this.attribute, this.onModelChange);
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

    unbind: function() {

    }
  });

  Backbone.ViewModel = Backbone.Model.extend({

    initialize: function(attributes, options) {
      this._bindings = [];
    },

    bindTo: function(attribute, container) {
      container = container || 'body';
      var nodes = $(container).find('*[' + attribute + ']');

      _.each(nodes, this.bindToNode(attribute));
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
      var Binding = Backbone.ViewModel.bindings[description.type];
      if (Binding) {
        var binding = new Binding(description);
        if (binding) {
          this._bindings.push(binding);
          return binding;
        }
        throw new Error("Unable to create '" + description.type + "' binding");
      }
      throw new Error("Trying to create a binding of unknown type '" + description.type + "'");
    }

  }, {
    bindings: {
      text: TextBinding,
      val: ValBinding
    }
  });

})(Backbone);