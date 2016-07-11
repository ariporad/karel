import { parseWorld } from './KarelWorld/parseWorld';
import { setWorld } from './KarelWorld/duck';

const debug = dbg('karel:client:api');

const PUSH_WORLD = 'karel/api/PUSH_WORLD';
const NEXT_WORLD = 'karel/api/NEXT_WORLD';

export const pushWorld = world => (dispatch, getState) => {
  debug('pushingWorld', world);

  const state = getState();
  dispatch({ type: PUSH_WORLD, payload: world.text });
  if (state.KarelWorld.won) dispatch(nextWorld());
}
export const forceWorld = text => (dispatch, getState, api) => {
  const state = getState();
  api.sendAttempt(state.KarelWorld.wid, state.Editor.code);
  return dispatch(setWorld(text));
};
export const nextWorld = () => (dispatch, getState) => {
  const world = getState().api.worlds[0];
  dispatch({ type: NEXT_WORLD });
  return dispatch(setWorld(world));
};


export default (state = { worlds: [] }, action) => {
  switch (action.type) {
    case PUSH_WORLD: return { ...state, worlds: [...state.worlds, action.payload] };
    case NEXT_WORLD: return { ...state, worlds: state.worlds.slice(1) };
    default: return state;
  }
};
