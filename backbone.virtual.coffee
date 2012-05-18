do (Backbone) ->

  class Backbone.Virtual

    @_computations = []
    @_dependencies = undefined

    @startTracking: ->
      Backbone.Virtual._dependencies = []
      Backbone.Virtual._computations.push(Backbone.Virtual._dependencies)

    @stopTracking: ->
      computations = Backbone.Virtual._computations
      dependencies = computations.pop()
      if computations.length
        Backbone.Virtual._dependencies = computations[computations.length - 1]
      else
        Backbone.Virtual._dependencies = undefined
      return dependencies

    @track: (model, event) ->
      Backbone.Virtual._dependencies?.push(
        model: model
        event: event
      )

    constructor: (options) ->
      _.extend(this, options)
      @dependencies = []
      @result = undefined

    runSafe: =>
      try
        return @get.call(@model, @attr, this)
      catch error
        return @fail

    run: =>
      Backbone.Virtual.startTracking()
      if @hasOwnProperty('fail')
        @result = @runSafe()
      else
        @result = @get.call(@model, @attr, this)
      @update(Backbone.Virtual.stopTracking())
      @trigger('change', this)
      return @result

    onChange: =>
      @run()

    update: (newDependencies) =>
      @remove(dep) for dep in @dependencies
      @add(dep) for dep in newDependencies
      @dependencies = newDependencies

    add: (dependency) =>
      dependency.model.on(dependency.event, @onChange)

    remove: (dependency) =>
      dependency.model.off(dependency.event, @onChange)

    get: (attr, virtual) ->
      if typeof virtual.reference == 'function' then model = virtual.reference.call(this)
      else model = virtual.reference
      return model.get(attr)

    set: (attr, val, options, virtual) ->
      if typeof virtual.reference == 'function' then model = virtual.reference.call(this)
      else model = virtual.reference
      return model.set(attr, val)

  _.extend(Backbone.Virtual::, Backbone.Events)

