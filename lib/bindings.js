(function(Backbone) {

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