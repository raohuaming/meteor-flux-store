describe('FluxStore', function(){

  beforeEach(function(){
    FluxStore.reset();
    FluxDispatcher.resetEvents();
  });

  describe('.define', function(){

    describe('-- initStates',function(){
      it('should accept a function to initialize states', function(){
        FluxStore.define('store', {
          initStates: {
            name: function(){
              return 'Huaming';
            }
          }
        });
        var store = FluxStore.fetch('store');
        expect(store.get('name')).toEqual('Huaming');
      });

      it('should throw error while pass non-objects to initStates', function(){
        FluxStore.define('store', {
          initStates: function(){}
        });
        expect(function(){ FluxStore.fetch('store'); }).toThrowError();
      });

      it('should throw error while pass a object instead of function to a state', function(){
        FluxStore.define('store', {
          initStates: {
            name: 'Huaming'
          }
        });
        expect(function(){ FluxStore.fetch('store'); }).toThrowError();
      });
    });

    describe('-- defaultStates', function(){
      it('should accept a function to initialize default states', function(){
        FluxStore.define('store', {
          defaultStates: {
            name: function(){
              return 'Huaming';
            }
          }
        });
        var store = FluxStore.fetch('store');
        expect(store.get('name')).toEqual('Huaming');
      });

      it('should throw error while pass non-objects to defaultStates', function(){
        FluxStore.define('store', {
          defaultStates: function(){}
        });
        expect(function(){ FluxStore.fetch('store'); }).toThrowError();
      });

      it('should throw error while pass a object instead of function to a state', function(){
        FluxStore.define('store', {
          defaultStates: {
            name: 'Huaming'
          }
        });
        expect(function(){ FluxStore.fetch('store'); }).toThrowError();
      });

    });

    describe('-- register events', function(){

      beforeEach(function(){
        FluxDispatcher.removeAllListeners();
      });

      it('should register events to configured Dispatcher', function(done){
        var handle = jasmine.createSpy('handle');
        FluxDispatcher.defineEvents({
          'event1': {
            msg: String
          }
        });
        FluxStore.define('store', {
          register: {
            'event1': handle
          }
        });
        FluxStore.fetch('store');
        FluxDispatcher.on('event1', handle);
        FluxDispatcher.emit('event1', { msg: 'hello' });
        setTimeout(function(){
          expect(handle).toHaveBeenCalledWith({ msg: 'hello' });
          done();
        }, 100);
      });

      it('should throw error while passing a non-object parameter', function(){
        expect(function(){
          FluxStore.define('store', {
            register: 'A'
          });
          FluxStore.fetch('store');
        }).toThrowError();
      });

      it('should throw error while passing a non-function handle to register', function(){
        expect(function(){
          FluxStore.define('store', {
            register: {
              'event': 'A'
            }
          });
          FluxStore.fetch('store');
        }).toThrowError();
      });
    });

  });

  describe('.fetch', function(){
    it('should return the named store', function(){
      FluxStore.define('store', {
        initStates: {
          name: function(){
            return 'A';
          }
        }
      });
      expect(FluxStore.fetch('store')).toBeDefined();
    });

    it('should initizlize the states while fetched', function(){
      FluxStore.define('store', {
        initStates: {
          name: function(){
            return 'A';
          }
        }
      });
      expect(FluxStore.__stores__['store']).toBeDefined();
      expect(FluxStore.__stores__['store'].get('name')).toBeUndefined();
      expect(FluxStore.fetch('store').get('name')).toBeDefined();
    });

  });

  describe('#set', function(){
    it('should set a named state', function(){
      FluxStore.define('store', {
        initStates: {
          name: function(){
            return 'A';
          }
        }
      });
      var store = FluxStore.fetch('store');
      expect(store.get('name')).toEqual('A');
      store.set('name', 'B');
      expect(store.get('name')).toEqual('B');
    });

  });

  describe('#get', function(){
    it('should set a named state', function(){
      FluxStore.define('store', {
        initStates: {
          name: function(){
            return 'A';
          }
        }
      });
      var store = FluxStore.fetch('store');
      expect(store.get('name')).toEqual('A');
      store.set('name', 'B');
      expect(store.get('name')).toEqual('B');
    });

  });

  describe('#setDefault', function(){
    it('should set default for a named state', function(){
      FluxStore.define('store', {
        initStates: {
          name: function(){
            return 'A';
          }
        }
      });
      var store = FluxStore.fetch('store');
      expect(store.get('name')).toEqual('A');
      store.setDefault('name', 10);
      expect(store.get('name')).toEqual('A');
      store.setDefault('score', 10);
      expect(store.get('score')).toEqual(10);
    });

  });

});
