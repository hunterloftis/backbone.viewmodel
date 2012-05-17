do (Backbone) ->

  class Backbone.Binding
    constructor: (description) ->
      _.extend(this, description)
      @initialize(description.args...)

    initialize: =>
    onModelChange: =>
    onCollectionChange: =>
    onViewChange: =>

    start: =>
      @viewModel.on('change:' + @attribute, @onModelChange)
      @onModelChange()

    stop: =>
      @viewModel.off('change:' + @attribute, @onModelChange)

  Backbone.Binding.extend = Backbone.Model.extend