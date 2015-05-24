# Usage

This is a Simple Store for meteor inspired by [Facebook Flux](https://facebook.github.io/flux/), by using EventEmitter and ReactiveVar

## FluxStore
## FluxDispatcher

It is an extension for [EventEmitter](https://github.com/Wolfy87/EventEmitter), but I made below changes to it.

### FluxDispatcher.defineEvents(eventsMap)

It defines the events map and specify its check matchers (refer to the official package [‘check’](http://docs.meteor.com/#/full/check))

```
  FluxDispatcher.defineEvents({
    event1: {
      _id: String,
      updated: {
        score: Match.Integer
      }
    }
  });
```

You must define all the events before you can use FluxDipatcher.on and FluxDispatcher.emit to register or emit an event, otherwise it will throw an error to warn you to define the event first.

### FluxDispatcher.on(eventName, listener)

It is a wrap function of EventEmitter.on, but check whether the eventName have been defined by FluxDispatcher.defineEvents.

### FluxDispatcher.emit(eventName, __event__)

It is a wrap function of EventEmitter.emit, but check whether then passed parameter __event__ matcher the checker defined by FluxDispatcher.defineEvents.

## FluxStore

This follows the concept introduced by Facebook Flux Store, and FluxStore inherits from Meteor ReactiveDict. So it is reactive!

### FluxStore.define(storeName, config)

This is define a store named storeName, you can pass config to configure it like this way:

```
  FluxStore.define('storeName', {
    initStates: {
      state1: function(){
        return 'state1 value';
      }
    },
    defaultStates: {
      state2: function(){
        return 'state2 default value';
      }
    },
    register: {
      event1: {
        this.otherFunction();
      }
    },
    otherFunction: function(a, b){
    
    }
  });
```

### FluxStore.fetch('storeName')

After defining stores by FluxStore.define, then you can fetch a given store by calling this function:

```
  var Store = FluxStore.fetch('store');
  Store.set('myName', 'Altman');
  console.log(Store.get('myName'));
  FluxDispatcher.emit('event1', { _id: '1111', updated: { score: 10 }});
``` 

### store.get('stateName')
### store.set('stateName', stateValue)

It gets and sets the state in the store. It is actually the same to ReactiveDict#get and ReactiveDict#.set

# Testing

Please run:

```
   VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter ./
```
