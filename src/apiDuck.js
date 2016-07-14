import { parseWorld } from './KarelWorld/parseWorld';
import { setWorld } from './KarelWorld/duck';

const debug = dbg('karel:client:api');

export const PUSH_WORLD = 'karel/api/PUSH_WORLD';
export const NEXT_WORLD = 'karel/api/NEXT_WORLD';
export const SET_WID = 'karel/api/SET_WID';

export const pushWorld = world => (dispatch, getState) => {
  debug('Pushing World:', world);
  const state = getState();
  dispatch({ type: PUSH_WORLD, payload: world });
  if (state.KarelWorld.won) dispatch(nextWorld());
}
export const forceWorld = world => (dispatch, getState, api) => {
  debug('Forcing World:', world);
  const state = getState();
  api.sendAttempt(state.KarelWorld.wid, state.Editor.code, false);
  return dispatch(setWorld(world));
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
