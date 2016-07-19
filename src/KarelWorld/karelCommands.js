import { KarelError } from './KarelError';
import {
  MOVE_FORWARD,
  MOVE_BACKWARD,
  TURN_LEFT,
  TURN_RIGHT,
  TURN_AROUND,
  PICKUP_CROWN,
  DIFFUSE_BOMB,
  WIN,
  STOP
} from './duck';

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

export const turnRight = (dispatch, getState) => line => {
  dispatch({ type: TURN_RIGHT, meta: { line, cmd: 'turnRight();' } });
};

export const turnAround = (dispatch, getState) => line => {
  dispatch({ type: TURN_AROUND, meta: { line, cmd: 'turnAround();' } });
};

export const moveBackward = (dispatch, getState) => line => {
  dispatch({ type: MOVE_BACKWARD, meta: { line, cmd: 'moveBackward();' } });
};

const _dirIsClear = turn => (dispatch, getState) => line => {
  let { karel: { dir, x, y }, lasers, height, width } = getState().KarelWorld;
  dir = (dir + turn) % 4;
  if (dir === 0) return !lasers[y][x] && x + 1 !== width;
  if (dir === 1) return y !== 0;
  if (dir === 2) return !lasers[y][x - 1] && x !== 0;
  if (dir === 3) return y + 1 !== height;
  return true;
};

const _isFacing = expectedDir => (dispatch, getState) => line => {
  let { karel: { dir } } = getState().KarelWorld;
  return expectedDir === dir;
};

export const frontIsClear = _dirIsClear(0);
export const leftIsClear  = _dirIsClear(1);
export const backIsClear  = _dirIsClear(2);
export const rightIsClear = _dirIsClear(3);

export const bombsPresent = (dispatch, getState) => line => getState().KarelWorld.bombs.length > 0;
export const crownLost    = (dispatch, getState) => line => getState().KarelWorld.crown !== null;

export const facingEast   = _isFacing(0);
export const facingNorth  = _isFacing(1);
export const facingWest   = _isFacing(2);
export const facingSouth  = _isFacing(3);

export const width        = (dispatch, getState) => line => getState().KarelWorld.width;
export const height       = (dispatch, getState) => line => getState().KarelWorld.height;

export const onCrown = (dispatch, getState) => line => {
  const state = getState();
  if (!state.KarelWorld.crown) return false;
  const { karel: { x: kx, y: ky }, crown: { x: cx, y: cy } } = state.KarelWorld;
  return kx === cx && ky === cy;
};
export const onBomb  = (dispatch, getState) => line => {
  const { karel: { x, y }, bombs } = getState().KarelWorld;
  return bombs.reduce((onBomb, { x: bx, y: by }) => onBomb || (bx === x && by === y), false);
};

export const randomChance = (dispatch, getState) => (line, outOf) => {
  // http://stackoverflow.com/a/4960020/1928484
  return Math.floor(Math.random() * outOf) + 1 === 1;
}

// TODO: UltraKarel
export const karel = { moveForward, turnLeft, pickupCrown, diffuseBomb };
export const superKarel = {
  ...karel,
  turnRight,
  turnAround,
  moveBackward,
  frontIsClear,
  leftIsClear,
  rightIsClear,
  backIsClear,
  bombsPresent,
  crownLost,
  onCrown,
  onBomb,
  facingEast,
  facingNorth,
  facingWest,
  facingSouth,
};
export const ultraKarel = { ...superKarel, width, height, randomChance };
