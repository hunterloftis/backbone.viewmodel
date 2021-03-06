// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function(Backbone) {
    Backbone.Binding = (function() {

      function Binding(description) {
        this.stop = __bind(this.stop, this);

        this.start = __bind(this.start, this);

        this.onViewChange = __bind(this.onViewChange, this);

        this.onCollectionChange = __bind(this.onCollectionChange, this);

        this.onModelChange = __bind(this.onModelChange, this);

        this.initialize = __bind(this.initialize, this);
        _.extend(this, description);
        this.initialize.apply(this, description.args);
      }

      Binding.prototype.initialize = function() {};

      Binding.prototype.onModelChange = function() {};

      Binding.prototype.onCollectionChange = function() {};

      Binding.prototype.onViewChange = function() {};

      Binding.prototype.start = function() {
        this.viewModel.on('change:' + this.attribute, this.onModelChange);
        return this.onModelChange();
      };

      Binding.prototype.stop = function() {
        return this.viewModel.off('change:' + this.attribute, this.onModelChange);
      };

      return Binding;

    })();
    return Backbone.Binding.extend = Backbone.Model.extend;
  })(Backbone);

}).call(this);
