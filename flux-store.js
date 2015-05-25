/**
 * The Global Dispatcher to handle all events
 */
FluxDispatcher = new EventEmitter();

/**
 */
FluxDispatcher.defineEvents = function(eventCheckers){
  this.__eventCheckers__ = eventCheckers;
};

/**
 */
FluxDispatcher.resetEvents = function(){
  this.removeAllListeners();
  this.__eventCheckers__ = {};
};

FluxDispatcher.resetEvents();

/**
 */
FluxDispatcher.__on__ = FluxDispatcher.on;
FluxDispatcher.on = function(eventName, listener){
  if (this.__eventCheckers__[eventName]) {
    this.__on__(eventName, listener);
  } else {
    throw new Error('You haven\'t defined the event: ' + eventName + ', please use FluxDispatcher.defineEvents to define it!');
  }
};

/**
 */
FluxDispatcher.__emit__ = FluxDispatcher.emit;
FluxDispatcher.emit = function(eventName, event){
  if (this.__eventCheckers__[eventName]) {
    check(event, this.__eventCheckers__[eventName]);
    this.__emit__(eventName, event);
  } else {
    throw new Error('You haven\'t defined the event: ' + eventName + ', please use FluxDispatcher.defineEvents to define it!');
  }
};


/**
 * FluxStore contructor
 * @constructor
 */
FluxStore = function(){
  this.states = new ReactiveDict();
  this.deps = {};
  this.__config__ = {
    exports: {},
    registers: {},
    initStates: Match.Any
  };
  this.__events__ = {};
};

/**
 * config FluxDispatcher
 * @param: { object } config
 */
FluxStore.config = function(config){
  if ( config.dispatcher) { FluxStore.__dispatcher__ = config.dispatcher; }
};

FluxStore.config({
  dispatcher: FluxDispatcher
});


/**
 * get state
 * @param: { string } state
 */
FluxStore.prototype.get = function(exportName) {
  //return this.__states__[state];
  //return this.states.get(state);
  var exportHandle = this.__config__.exports[exportName];
  if (exportHandle) {
    return exportHandle.apply(this);
  } else {
    throw new Error('This export: ' + exportName + ' is not defined in the store');
  }
};

/**
 * set default state
 * @param: { string } state
 * @param: { any } value
 */
FluxStore.prototype.setDefault = function(state, value) {
  if ( _.isUndefined(this.get(state)) ) {
    this.set(state, value);
  }
};


/**
 * iterate the given objects to set up states based on given handle
 * @param: { object } states
 * @param: { function } handle
 */
FluxStore.prototype.__setStates__ = function(states, handle){
  if ( Match.test(states, Object) ){
    var that = this;
    _.each(states, function(value, state){
      if (typeof value === 'function') {
        handle.apply(that, [state, value.apply(that)]);
      } else {
        throw new Error('Please set the parameter as function!');
        //handle.apply(that, [state, value]);
      }
    });

  } else {
    throw new Error('Please set states as Object type');
  }

};

/**
 * set initial states according to this.initStates
 */
FluxStore.prototype.__setInitStates__ = function(){
  this.__setStates__(this.initStates, function(state, value){
    this.set(state, value);
  });
};

/**
 * set default states according to this.defaultStates
 */
FluxStore.prototype.__setDefaultStates__ = function(){
  this.__setStates__(this.defaultStates, function(state, value){
    this.setDefault(state, value);
  });
};

/**
 * iterate this.register to register FluxDispatcher events and this.__events__
 */
FluxStore.prototype.__registerEvents__ = function(){
  if ( !this.__config__.registers ) return;
  if (typeof this.__config__.registers === 'object' ){
    var that = this;
    _.each(this.__config__.registers, function(handle, eventName){
      if (typeof handle === 'function') {
        that.__events__[eventName] = that.__events__[eventName] || [];
        FluxStore.__dispatcher__.on(eventName, handle.bind(that));
        that.__events__[eventName].push(handle.bind(that));
      } else {
        throw new Error('Please set the parameter as function!');
      }
    });

  } else {
    throw new Error('Please set states as Object type');
  }
};

/**
 * keep all defined stores
 */
FluxStore.__stores__ = {};

/**
 * use to define named store
 * @param: { string } name
 * @param: { object } extension
 * @usage: FluxStore.define('name', {
 *  deps: {
 *    Model: Model,
 *    Service: Service
 *  },
 *  exports: {
 *    name: function(){
 *      return 'A';
 *    }
 *  },
 *  registers: {
 *    event1: function(event){
 *      ...
 *    }
 *  }
 * });
 */
FluxStore.define = function(name, extension){
  Meteor.startup(function(){
    var store = new FluxStore(name);
    FluxStore.__stores__[name] = store;
    check(extension.exports, Match.Optional(Object));
    check(extension.registers, Match.Optional(Object));
    check(extension.initStates, Match.Optional(Object));
    if (  extension.exports ) {
      store.__config__.exports = extension.exports;
    }
    if ( extension.registers ) {
      store.__config__.registers = extension.registers;
    }
    if (extension.initStates) {
      store.__config__.initStates = extension.initStates;
    }
    delete extension.exports;
    delete extension.registers;
    delete extension.initStates;
    _.extend(store, extension);
    store.__registerEvents__();
  });
};

FluxStore.prototype.config = function(config){
  var that = this;
  if ( config.deps ) {
    _.extend(this.deps, config.deps);
  }
  if ( config.initStates ) {
    _.each(config.initStates, function(value, state){
      that.states.set(state, value);
    });
  }
};

/**
 * use to fetch named store
 * @param: { string } storeName
 */
FluxStore.fetch = function(storeName, config){
  config = config || {};
  var store = FluxStore.__stores__[storeName];
  if ( store.__config__.initStates ) {
    check( config.initStates, store.__config__.initStates );
  }
  if (config) {
    store.config(config);
  }
  return store;
};

FluxStore.reset = function(){
  _.each(FluxStore.__stores__, function(store){
    _.each(store.__events__, function(eventHandles, eventName){
      _.each(eventHandles, function(eventHandle){
        FluxStore.__dispatcher__.removeListener(eventName, eventHandle);
      });
    });
  });
  delete FluxStore.__stores__;
  FluxStore.__stores__ = {};
};
