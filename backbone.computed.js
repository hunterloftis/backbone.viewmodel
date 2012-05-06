(function(Backbone) {

  Backbone.Computed = function(description) {
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

})(Backbone);