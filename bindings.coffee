do (Backbone) ->

  Backbone.Binding['visible'] = class VisibleBinding extends Backbone.Binding
    initialize: (@attribute) ->
    onModelChange: ->
      val = @viewModel.get(@attribute)
      if val then return $(@node).show()
      return $(@node).hide()

  Backbone.Binding['text'] = class TextBinding extends Backbone.Binding
    initialize: (@attribute) ->
    onModelChange: ->
      val = @viewModel.get(@attribute)
      $(@node).text(val)

  Backbone.Binding['val'] = class ValueBinding extends Backbone.Binding
    initialize: (@attribute) ->
    start: ->
      super
      $(@node).on('keyup change', @onViewChange)
    onModelChange: ->
      val = @viewModel.get(@attribute)
      $(@node).val(val)
    onViewChange: ->
      val = $(@node).val()
      @viewModel.set(@attribute, val)
    stop: ->
      super
      $(@node).off('keyup change', @onViewChange)

  Backbone.Binding['css'] = class CssBinding extends Backbone.Binding
    initialize: (@className, @attribute, @truth = true) ->
    onModelChange: ->
      val = @viewModel.get(@attribute)
      if Boolean(@truth) == Boolean(val)
        return $(@node).addClass(@className)
      return $(@node).removeClass(@className)

  Backbone.Binding['click'] = class ClickBinding extends Backbone.Binding
    initialize: ->
      args = _.toArray(arguments)
      @callback = args.shift()
      @args = args
    start: ->
      $(@node).on('click', @onViewChange)
    onViewChange: (event) ->
      event.preventDefault()
      callback = @viewModel[@callback] ? @viewModel.get(@callback)
      callback.apply(@viewModel, @args)
    stop: ->
      $(@node).off('click', @onViewChange)

  Backbone.Binding['each'] = class EachBinding extends Backbone.Binding
    initialize: (@attr) ->
      @container = $(@node)
      @itemTemplate = @container.html()
      @container.html('')
    start: ->
      @viewModel.on('change:' + @attr, @onCollectionChange)
      @onCollectionChange()
    onCollectionChange: ->
      self = this
      @container.html('')
      @collection = @viewModel.get(@attr)
      if @collection instanceof Backbone.Collection
        @collection.off('add remove reset change create sort', @onCollectionChange);
        @collection.each(@renderItem);
        @collection.on('add remove reset change create sort', @onCollectionChange);
      else
        @renderItem(item) for item in @collection
    renderItem: (viewModel) =>
      for node in $(@itemTemplate)
        @container.append(node)
        viewModel.bindView(@bindingAttr, node)
    stop: ->
      @viewModel.off('change:' + @attr, @onCollectionChange)

