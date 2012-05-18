do (Backbone) ->

  proto = Backbone.Model::

  argMap = {
    'undefined': undefined
    'null': null
    'true': true
    'false': false
  }

  class Backbone.ViewModel extends Backbone.Model
    constructor: (attributes, options) ->
      @_virtuals = {}
      @_bindings = []
      super

    set: (key, value, options) ->
      unless options && options.dependency
        virtual = @_virtuals?.hasOwnProperty(key) && @_virtuals[key]
        if virtual then return virtual.set.call(this, key, value, options, virtual)
      return proto.set.apply(this, arguments)

    bindView: (attribute, container = 'body') ->
      selector = '*[' + attribute + ']'
      nodes = $(container).find(selector)
      if $(container).is(selector) then nodes = $(container).add(nodes)
      @bindToNode(attribute, node) for node in nodes
      return nodes

    unbindView: ->
      binding.stop() for binding in @_bindings
      @_bindings = []

    isBoundTo: (node) ->
      for binding in @_bindings
        if binding.node == node then return true
      return false

    bindToNode: (attribute, node) =>
      if @isBoundTo(node) then return
      bindingString = $(node).attr(attribute)
      bindingList = bindingString.split(';')
      descriptions = (@parseBinding(node, attribute, pair) for pair in bindingList)
      @createBinding(description) for description in descriptions

    parseBinding: (node, attribute, pair) =>
      typeSplit = pair.split('(')
      type = typeSplit[0].trim()
      argString = typeSplit[1].trim().slice(0, -1)
      args = (@parseArgument(arg) for arg in argString.split(','))
      return {
        node: node
        viewModel: this
        type: type
        bindingAttr: attribute
        args: args
      }

    parseArgument: (arg) ->
      arg = arg.trim()
      if argMap.hasOwnProperty(arg)
        arg = argMap[arg]
      else if !isNaN(arg)
        arg = Number(arg)
      return arg

    createBinding: (description) ->
      Binding = Backbone.Binding[description.type]
      if Binding?
        binding = new Binding(description)
        binding.start()
        @_bindings.push(binding)
        return binding
      else
        throw new Error('Trying to create a binding of unknown type "' + description.type + '"')

    get: (attr) ->
      Backbone.Virtual.track(this, 'change:' + attr)
      return @attributes[attr]

    compute: ->
      args = _.toArray(arguments)
      get = args.pop()
      args.push({ get: get })
      @virtual.apply(this, args)

    pass: ->
      args = _.toArray(arguments)
      reference = args.pop()
      args.push({ reference: reference })
      @virtual.apply(this, args)

    virtual: ->
      attrs = _.toArray(arguments)
      options = attrs.pop()
      options.model = this
      return (@createVirtual(attr, options) for attr in attrs)

    createVirtual: (attr, options) =>
      opts = _.extend({}, options, { attr: attr })
      newVirtual = new Backbone.Virtual(opts)
      @_virtuals[attr] = newVirtual
      newVirtual.on('change', @onVirtual)
      newVirtual.run()

    onVirtual: (virtual) =>
      @set(virtual.attr, virtual.result, { dependency: true })

  Backbone.Model = Backbone.ViewModel
