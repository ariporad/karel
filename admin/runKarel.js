import configureStore from '../src/redux';
import { reducer, setWorld } from '../src/KarelWorld/duck';
import runKarel from '../src/KarelWorld/runKarel';
import { karel, superKarel, ultraKarel } from '../src/KarelWorld/karelCommands';

const runCode = (world, code) => {
  const store = configureStore(undefined, undefined, false);
  store.dispatch(setWorld(world));
  const { ultra, super: isSuper } = store.getState().KarelWorld.karel;
  const actions = runKarel(code, ultra ? ultraKarel : isSuper ? superKarel : karel, store);
  const state = store.getState().KarelWorld;
  const won = state.won;
  const err = state.err;
  return { won, err, actions, final: state };
};

export default runCode;
global.runCode = runCode;

