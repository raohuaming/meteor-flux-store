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
  //ReactiveDict.call(this, name);
  this.__initialized__ = false;
  this.__states__ = {};
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
 * set state
 * @param: { string } state
 * @param: { any } value
 */
FluxStore.prototype.set = function(state, value){
  this.__states__[state] = value;
};

/**
 * get state
 * @param: { string } state
 */
FluxStore.prototype.get = function(state) {
  return this.__states__[state];
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
  if (typeof states === 'object'){
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
  if (this.register && (typeof this.register === 'object') ){
    var that = this;
    _.each(this.register, function(handle, eventName){
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
 *  initStates: {
 *    state1: function(){
 *      return 'A';
 *    }
 *  },
 *  defaultStates: {
 *    state2: function(){
 *      return 'B';
 *    }
 *  },
 *  register: {
 *    event1: function(event){
 *      .....
 *    }
 *  }
 * });
 */
FluxStore.define = function(name, extension){
  Meteor.startup(function(){
    var store = new FluxStore(name);
    FluxStore.__stores__[name] = store;
    _.extend(store, extension);
  });
};

/**
 * use to fetch named store
 * @param: { string } storeName
 */
FluxStore.fetch = function(storeName){
  var store = FluxStore.__stores__[storeName];
  if ( !store.__initialized__ ) {
    if ( store.defaultStates ) { store.__setDefaultStates__(); }
    if ( store.initStates  ) { store.__setInitStates__(); }
    if ( store.register ) { store.__registerEvents__(); }
    store.__initialized__ = true;
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
