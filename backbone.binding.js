(function(Backbone) {

  // Generic Binding (all bindings inherit from this)
  // description is an object with: node, viewModel, args, type
  Backbone.Binding = function(description) {
    _.bindAll(this);
    _.extend(this, description);
    this.initialize.apply(this, description.args);
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

})(Backbone);