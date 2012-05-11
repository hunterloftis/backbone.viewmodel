(function(Backbone) {

  // Visible Binding
  var VisibleBinding = Backbone.Binding['visible'] = Backbone.Binding.extend({
    initialize: function(attr) {
      this.attribute = attr;
    },
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
    initialize: function(attr) {
      this.attribute = attr;
    },
    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      $(this.node).text(val);
    }
  });

  // Value Binding
  var ValueBinding = Backbone.Binding['val'] = Backbone.Binding.extend({
    initialize: function(attr) {
      this.attribute = attr;
    },
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
    initialize: function() {
      var args = _.toArray(arguments);
      this.callback = args.shift();
      this.args = args;
    },
    start: function() {
      $(this.node).on('click', this.onViewChange);
    },
    onViewChange: function(event) {
      event.preventDefault();
      this.viewModel.get(this.callback).apply(this.viewModel, this.args);
    },
    stop: function() {
      $(this.node).off('click', this.onViewChange);
    }
  });

  // CSS Class Binding
  var CssBinding = Backbone.Binding['css'] = Backbone.Binding.extend({
    initialize: function(className, attr) {
      this.className = className;
      this.attribute = attr;
    },
    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      if (val) {
        return $(this.node).addClass(this.className);
      }
      return $(this.node).removeClass(this.className);
    }
  });

  // Each binding
  var EachBinding = Backbone.Binding['each'] = Backbone.Binding.extend({
    initialize: function(collection) {
      this.collection = collection;
      // store the inner DOM structure somewhere & remove it from the DOM
    },
    start: function() {

    },
    stop: function() {

    }
  });

})(Backbone);