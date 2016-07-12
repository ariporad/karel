import { KarelError } from './KarelError';
import { MOVE_FORWARD, TURN_LEFT, PICKUP_CROWN, DIFFUSE_BOMB, WIN, STOP } from './duck';

/**
 * These are kind of action creators, kind of not. They can only be used with runKarel, as they have
 * and invalid signature otherwise. Maybe there should be seperate, redux compatible action creators
 * to match, but I don't really care.
 */

// Internal Helper
const checkForWin = (dispatch, getState) => {
  const state = getState();
  if (state.KarelWorld.bombs.length === 0 && state.KarelWorld.crown === null) {
    dispatch({ type: WIN });
    dispatch({ type: STOP });
    const err = KarelError('World Complete');
    err.earlyExit = true;
    throw err;
  }
  return false;
};

export const moveForward = (dispatch, getState) => line => {
  dispatch({ type: MOVE_FORWARD, meta: { line, cmd: 'moveForward();' } });
};

export const turnLeft = (dispatch, getState) => line => {
  dispatch({ type: TURN_LEFT, meta: { line, cmd: 'turnLeft();' } });
};

export const pickupCrown = (dispatch, getState) => line => {
  const action = { type: PICKUP_CROWN, meta: { line, cmd: 'pickupCrown();' } };
  dispatch(action);
  checkForWin(dispatch, getState);
};

export const diffuseBomb = (dispatch, getState) => line => {
  const action = { type: DIFFUSE_BOMB, meta: { line, cmd: 'diffuseBomb();' } };
  dispatch(action);
  checkForWin(dispatch, getState);
};

// TODO: SuperKarel, UltraKarel
export const karel = { moveForward, turnLeft, pickupCrown, diffuseBomb };

