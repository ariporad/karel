import configureStore from 'redux-mock-store';
import KarelError from './KarelError';
import runKarel from './runKarel';

const mockStore = configureStore([]);
const funcs = {
  funcA: line => ({ type: 'a', payload: { a: true }, meta: { line, cmd: 'funcA();' }  }),
  funcB: line => ({ type: 'b', payload: { b: true }, meta: { line, cmd: 'funcB();' }  }),
};

describe('runKarel()', () => {
  it('should properly generate a list of actions from the code', () => {
    expect(runKarel('funcA();\nfuncB();funcA();', funcs, mockStore())).to.deep.equal([
      { type: 'a', payload: { a: true }, meta: { line: 1, cmd: 'funcA();' } },
      { type: 'b', payload: { b: true }, meta: { line: 2, cmd: 'funcB();' } },
      { type: 'a', payload: { a: true }, meta: { line: 2, cmd: 'funcA();' } },
    ]);
  });

  it('should properly catch syntax errors', () => {
    const actions = runKarel('funcA();\nfuncB#();funcA();', funcs, mockStore())
    expect(actions.length).to.equal(1);
    expect(actions[0].type).to.equal('karel/KarelWorld/KAREL_DIED');
    expect(actions[0].error).to.be.true();
    expect(actions[0].payload.karel).to.be.true();
    expect(actions[0].payload.name).to.equal('SyntaxError');
    expect(actions[0].payload.message).to.match(/(unexpected|token)/i);
    expect(actions[0].payload.line).to.equal(null);
    expect(actions[0].payload.cmd).to.equal(null);
  });

  it('should properly catch KarelErrors', () => {
    const store = mockStore();
    let dispatchCalledTimes = 0;
    const dispatch = store.dispatch;
    store.dispatch = action => {
      dispatchCalledTimes++;
      if (dispatchCalledTimes === 2) throw KarelError('Everything\'s Broken!', action.meta);
      return dispatch(action);
    };

    const actions = runKarel('funcA();\nfuncB();funcA();', funcs, store)
    expect(actions).to.deep.equal([
      { type: 'a', payload: { a: true }, meta: { line: 1, cmd: 'funcA();' } },
      {
        type: 'karel/KarelWorld/KAREL_DIED',
        error: true,
        payload: KarelError('Everything\'s Broken!', { line: 2, cmd: 'funcB();' }),
      }
    ]);
  });

  it('should respect a function\'s arguments', () => {
    let n1, n2;
    runKarel('test(42, -4)', { test: (line, n1_, n2_) => { n1 = n1_; n2 = n2_ } }, mockStore());
    expect(n1).to.equal(42);
    expect(n2).to.equal(-4);
  });

  it('should respect a function\'s return value', () => {
    let n1, n2;
    runKarel('test(n1(), n2())', {
      n1: () => ({ ret: 7 }),
      n2: () => ({ ret: 42 }),
      test: (line, n1_, n2_) => { n1 = n1_; n2 = n2_ },
    }, mockStore());
    expect(n1).to.equal(7);
    expect(n2).to.equal(42);
  });

  it('dispatches actions to the store', () => {
    // NOTE: We're explicitly not checking for if it dispatches KAREL_DIED's to the store, because
    // it doesn't need to. (Since a KAREL_DIED markes the end of the run, if it should be dispatched
    // is undefined).
    const store = mockStore();
    const actions = runKarel('funcA(); funcB(); funcB(); funcA();', funcs, store);
    expect(store.getActions()).to.deep.equal(actions);
    expect(store.getActions()).to.deep.equal([
      { type: 'a', payload: { a: true }, meta: { line: 1, cmd: 'funcA();' } },
      { type: 'b', payload: { b: true }, meta: { line: 1, cmd: 'funcB();' } },
      { type: 'b', payload: { b: true }, meta: { line: 1, cmd: 'funcB();' } },
      { type: 'a', payload: { a: true }, meta: { line: 1, cmd: 'funcA();' } },
    ]);
  });

  it('emits correct line numbers', () => {
    const actions = runKarel('funcA();\nfuncB(); funcB();\nfuncA();', funcs, mockStore());
    expect(actions).to.deep.equal([
      { type: 'a', payload: { a: true }, meta: { line: 1, cmd: 'funcA();' } },
      { type: 'b', payload: { b: true }, meta: { line: 2, cmd: 'funcB();' } },
      { type: 'b', payload: { b: true }, meta: { line: 2, cmd: 'funcB();' } },
      { type: 'a', payload: { a: true }, meta: { line: 3, cmd: 'funcA();' } },
    ]);
  });
});
