describe('FluxStore', function(){

  beforeEach(function(){
    FluxStore.reset();
    FluxDispatcher.resetEvents();
  });

  describe('.define', function(){

    describe('-- deps',function(){
      it ('should set deps in __config__', function(){

        var depsChecker = {
          Dep: String
        };

        FluxStore.define('store', {
          deps: depsChecker
        });

        var store = FluxStore.fetch('store', {
          deps: {
            Dep: '10'
          }
        });
        expect(store.__config__.deps).toEqual(depsChecker);

      });
    });

    describe('-- exports ', function(){
      it('should set exports in __config__', function(){
        var handle = function(){
          return 'A';
        };
        FluxStore.define('store', {
          exports: {
            name: handle
          }
        });
        var store = FluxStore.fetch('store');
        expect(store.__config__.exports.name).toEqual(handle);
      });

    });

    describe(' -- initStates', function(){
      it('should set initStates in __config__ and check initStates while being fetched', function(){
        var checker = {
          name: String
        };
        FluxStore.define('store', {
          initStates: checker
        });
        var store = FluxStore.fetch('store', {
          initStates: {
            name: 'A'
          }
        });
        expect(store.__config__.initStates).toEqual(checker);
      });
    });

    describe('-- register events', function(){

      beforeEach(function(){
        FluxDispatcher.removeAllListeners();
      });

      it('should register events to configured Dispatcher', function(){
        var handle = jasmine.createSpy('handle');
        FluxDispatcher.defineEvents({
          'event1': {
            msg: String
          }
        });
        FluxStore.define('store', {
          registers: {
            'event1': handle
          }
        });
        FluxStore.fetch('store');
        FluxDispatcher.on('event1', handle);
        FluxDispatcher.emit('event1', { msg: 'hello' });
        expect(handle).toHaveBeenCalledWith({ msg: 'hello' });
      });

      it('should throw error while passing a non-object parameter', function(){
        expect(function(){
          FluxStore.define('store', {
            registers: 'A'
          });
          FluxStore.fetch('store');
        }).toThrowError();
      });

      it('should throw error while passing a non-function handle to register', function(){
        expect(function(){
          FluxStore.define('store', {
            registers: {
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
      });
      expect(FluxStore.fetch('store')).toBeDefined();
    });

    it('should throw Match.Error while not giving the correct init states', function(){
      FluxStore.define('store', {
        initStates: {
          name: String
        }
      });
      expect(function(){
        FluxStore.fetch('store');
      }).toThrowError(Match.Error);
    });

    it('should throw Match.Error while not giving the correct deps', function(){
      FluxStore.define('store', {
        deps: {
          Dep: {
            name: String
          }
        }
      });
      expect(function(){
        FluxStore.fetch('store');
      }).toThrowError(Match.Error);
      expect(function(){
        FluxStore.fetch('store', {
          deps: {
            Dep: { name: 'A' }
          }
        });
      }).not.toThrowError(Match.Error);

    });

  });

  describe('#config', function(){

    it('should set a new Deps by given new dep', function(){
      var Dep1, Dep2, Dep3, store;

      Dep1 = { name: 'Dep1' };
      Dep2 = { score: 1000 };
      Dep3 = { name: 'Dep3' };
      FluxStore.define('store', {
        deps: {
          Dep1: {
            name: String
          },
          Dep2: {
            score: Match.Integer
          }
        }
      });
      store = FluxStore.fetch('store', {
        deps: {
          Dep1: Dep1,
          Dep2: Dep2
        }
      });

      expect(store.deps.Dep1).toEqual(Dep1);
      expect(store.deps.Dep2).toEqual(Dep2);
      store.config({
        deps: {
          Dep1: Dep3
        }
      });
      expect(store.deps.Dep1).toEqual(Dep3);
      expect(store.deps.Dep2).toEqual(Dep2);
    });



    it('should set store\'s init states', function(){
      FluxStore.define('store', {
      });
      store = FluxStore.fetch('store');
      expect(store.states.get('name')).toBeUndefined();

      store.config({
        initStates: {
          name: 'A'
        }
      });
      expect(store.states.get('name')).toEqual('A');
    });
  });

  describe('#get', function(){
    it('should set a named state', function(){
      FluxStore.define('store', {
        exports: {
          name: function(){
            return 'A';
          }
        }
      });
      var store = FluxStore.fetch('store');
      expect(store.get('name')).toEqual('A');
    });

  });

});
