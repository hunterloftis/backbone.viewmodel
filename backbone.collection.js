(function(Backbone) {

  _.extend(Backbone.Collection.prototype, {
    getAll: function() {
      return this.models;
    }
  });

})(Backbone);