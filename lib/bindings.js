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
      var callback = this.viewModel[this.callback] || this.viewModel.get(this.callback);
      callback.apply(this.viewModel, this.args);
    },
    stop: function() {
      $(this.node).off('click', this.onViewChange);
    }
  });

  // CSS Class Binding
  var CssBinding = Backbone.Binding['css'] = Backbone.Binding.extend({
    initialize: function(className, attr, truth) {
      this.truth = (typeof truth !== 'undefined') ? truth : true;
      this.className = className;
      this.attribute = attr;
    },
    onModelChange: function() {
      var val = this.viewModel.get(this.attribute);
      if (Boolean(this.truth) === Boolean(val)) {
        return $(this.node).addClass(this.className);
      }
      return $(this.node).removeClass(this.className);
    }
  });

  // Each binding
  var EachBinding = Backbone.Binding['each'] = Backbone.Binding.extend({
    initialize: function(attr) {
      this.attr = attr;
      // Store the inner html fragment
      var node = $(this.node);
      this.itemTemplate = node.html();
      // Clear the inner DOM
      node.html('');
    },
    start: function() {
      this.viewModel.on('change:' + this.attr, this.onCollectionChange);
      this.onCollectionChange();
    },
    onCollectionChange: function() {
      var self = this;
      var node = $(this.node);
      var newFragment;
      // Clear the inner DOM
      node.html('');
      // Get the currently referenced collection
      this.collection = this.viewModel.get(this.attr);
      if (this.collection instanceof Backbone.Collection) {
        // collection is a Backbone.Collection with an each method
        this.collection.off('add remove reset change create sort', this.onCollectionChange);
        this.collection.each(renderVM);
        this.collection.on('add remove reset change create sort', this.onCollectionChange);
      }
      else {
        // collection is a regular Array
        _.each(this.collection, renderVM);
      }
      function renderVM(viewModel) {
        // Build a new DOM fragment from the inner HTML
        newFragment = $(self.itemTemplate);
        // DOM fragments may have multiple nodes, so append and bind each node separately
        _.each(newFragment, function(innerNode) {
          node.append(innerNode);
          viewModel.bindView(self.bindingAttr, innerNode);
        });
      }
    },
    onModelChange: function() {

    },
    stop: function() {
      this.viewModel.off('change:' + this.attr, this.onCollectionChange);
    }
  });

})(Backbone);