do (Backbone) ->

  # Reference the old Collection.prototype
  proto = Backbone.Collection::

  # Methods that should trigger re-evaluation of virtuals
  writes = 'add remove reset change create sort'

  # Methods that indicate this collection is a virtual's dependency
  backboneReads = ['get', 'getByCid', 'where', 'pluck', 'clone', 'at', 'toJSON']
  underscoreReads = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy']

  class Backbone.ViewCollection extends Backbone.Collection
    list: ->
      Backbone.Virtual.track(this, writes)
      return @models

  Backbone.Collection::model = Backbone.Model

  extendCollection = (name) ->
    Backbone.ViewCollection::[name] = ->
      Backbone.Virtual.track(this, writes)
      return proto[name].apply(this, arguments)

  # Intercept and track all read operations
  extendCollection(fn) for fn in backboneReads.concat(underscoreReads)

  # Alias ViewCollection to Collection
  Backbone.Collection = Backbone.ViewCollection