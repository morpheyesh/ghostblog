var async = require('async')
var slice = Function.call.bind(Array.prototype.slice)

var asyncMixin = module.exports = function asyncMixin(target, property, methods) {
  if (typeof target === 'string') methods = property, property = target, target = null
  
  if (Array.isArray(target)) {
    target = {
      items: arguments[0]
    }
    methods = property
    property = 'items'
  }
  if (!Array.isArray(methods)) methods = asyncCollectionMethods

  var wrapper = Object.create(target || {})
  methods.forEach(function(key) {
    if (typeof async[key] !== 'function') return
    wrapper[key] = function() {
      return async[key].apply(this, [this[property]].concat(slice(arguments)))
    }
  })
  return wrapper
}

var asyncCollectionMethods = [
  'each',
  'eachSeries',
  'eachLimit',
  'map',
  'mapSeries',
  'mapLimit',
  'filter',
  'filterSeries',
  'reject',
  'rejectSeries',
  'reduce',
  'reduceRight',
  'detect',
  'detectSeries',
  'sortBy',
  'some',
  'every',
  'concat',
  'concatSeries'
]
