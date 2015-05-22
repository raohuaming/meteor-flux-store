describe('FluxDispatcher', function(){
  beforeEach(function(){
    FluxDispatcher.resetEvents();
  });

  it('should check whether the events have been defined while calling on(event, listener)', function(){
    expect(function(){
      FluxDispatcher.on('unknown event', {});
    }).toThrowError();

  });

  it('should throw error if the events passed by emitting did not pass the checker', function(){
    FluxDispatcher.defineEvents({
      event1: {
        msg: String
      }
    });
    expect(function(){
      FluxDispatcher.emit('event1', { msg: 1 });
    }).toThrowError();

  });

  it('should throw error if the events passed by emitting have not been defined.', function(){
    expect(function(){
      FluxDispatcher.emit('event1', { msg: 1 });
    }).toThrowError();

  });
});
