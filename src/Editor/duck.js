import { createStore, combineReducers } from 'redux';
import runKarel from '../KarelWorld/runKarel';
import * as KWActionCreators from '../KarelWorld/duck';
import * as commands from '../KarelWorld/karelCommands';

export const SET_CODE = 'karel/Editor/SET_CODE';
export const RUN = 'karel/Editor/RUN';
export const DEBUG = 'karel/Editor/DEBUG';
export const NEXT = 'karel/Editor/NEXT';
export const STOP = 'karel/Editor/STOP';

export const setCode = code => ({ type: SET_CODE, payload: code });

const startRunning = (dispatch, getState, api) => {
  dispatch(KWActionCreators.reset());
  const state = getState();

  // We're creating the store ourself because we only want the KW reducer, and we don't want any
  // middleware.
  const store = createStore(
    combineReducers({ KarelWorld: KWActionCreators.reducer }),
    { KarelWorld: state.KarelWorld }
  );
  let cmds = state.KarelWorld.karel.ultra ? commands.ultraKarel :
    state.KarelWorld.karel.super ? commands.superKarel : commands.karel;

  const actions = runKarel(state.Editor.code, cmds, store);

  // Let the server know
  api.sendAttempt(state.KarelWorld.wid, state.Editor.code, store.getState().KarelWorld.won);

  return actions;
};

// I'm not really sure I like having the editor control the running of the code, but I suppose it's
// fine. I'm not sure where else it would go.
export const run = () => (dispatch, getState, api) => {
  const actions = startRunning(dispatch, getState, api);

  dispatch({ type: RUN, payload: actions });
  const dispatchNext = () => {
    console.log('dispatching(run)');
    const moreActions = dispatch(next());
    if (moreActions) setTimeout(dispatchNext, 500);
  };
  setTimeout(dispatchNext, 500);
};

export const debug = () => (dispatch, getState, api) => {
  const actions = startRunning(dispatch, getState, api);
  dispatch({ type: DEBUG, payload: actions });
  dispatch(next());
};

export const playOut = () => (dispatch, getState) => {
  if (!getState().Editor.debugging) throw new Error('Call debug() before playOut()!');
  while (true) {
    const moreActions = dispatch(next());
    if (!moreActions) break;
  }
};

export const next = () => (dispatch, getState) => {
  const state = getState();
  if (!state.Editor.running) throw new Error('Call run/debug before next!');
  if (state.Editor.actions.length === 0) {
    dispatch({ type: STOP });
    return false; // No more actions
  } else {
    let action = state.Editor.actions[0];
    // This way thunks still work (dispatch returns the action by default)
    action = dispatch(action) || action;
    dispatch({ type: NEXT, meta: action.meta });
    return true; // Yes more actions
  }
};

export const reducer = (
  state = { code: 'loading();', running: false, debugging: false, actions: null, line: null },
  action
) => {
  switch (action.type) {
    case SET_CODE: return { ...state, code: action.payload };
    case RUN: return { ...state, running: true, actions: action.payload };
    case DEBUG: return { ...state, running: true, debugging: true,  actions: action.payload };
    case NEXT:
      return { ...state, actions: (state.actions || []).slice(1), line: (action.meta || {}).line };
    case STOP: return { ...state, running: false, debugging: false, actions: null, line: null };
    default: return state;
  }
};
