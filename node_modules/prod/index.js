"use strict"

var readInstalled = require('read-installed')
var asyncMixin = require('async-mixin')
var advisable = require('advisable')

var slice = Function.call.bind(Array.prototype.slice)

var Processor = module.exports = function Processor(start) {
  if (!(this instanceof Processor)) return new Processor(start)
  this.start = start || process.cwd()
  this.dependencies = []
  this.initialized = false
}

// inherit async methods
Processor.prototype = asyncMixin('dependencies')
var asyncMethods = Object.keys(Processor.prototype)
Processor.prototype.load = function(fn) {
  var self = this
  readInstalled(this.start, function(err, dep) {
    if (err) return fn(err)
    getDependencies(dep, self.dependencies)
    self.initialized = true
    return fn(null, self.dependencies)
  })
}

advisable.async.call(Processor.prototype);

asyncMethods.forEach(function(method) {
  // Ensure we have some dependencies to work with before
  // calling any async functions.
  Processor.prototype.before(method, function() {
    var callback = arguments[arguments.length - 1];
    if (this.initialized) callback()
    else this.load(function(err, deps) {
      if (err) return callback(err)
      callback()
    })
  })
})

function getDependencies(mod, result) {
  result = result || []
  result.push(mod)
  var dependencies = mod.dependencies || []
  Object.keys(dependencies).forEach(function(dep) {
    getDependencies(mod.dependencies[dep], result)
  })
  return result
}
