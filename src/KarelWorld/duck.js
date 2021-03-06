import { KarelError } from './KarelError';
import { parseWorld } from './parseWorld';
import { STOP, setCode } from '../Editor/duck';
import { setTitleDesc } from '../TopBar/duck';

/**
 * Actions
 */

export const MOVE_FORWARD = 'karel/KarelWorld/MOVE_FORWARD';
export const TURN_LEFT = 'karel/KarelWorld/TURN_LEFT';
export const PICKUP_CROWN = 'karel/KarelWorld/PICKUP_CROWN';
export const DIFFUSE_BOMB = 'karel/KarelWorld/DIFFUSE_BOMB';
export const RESET = 'karel/KarelWorld/RESET';
export const WIN = 'karel/KarelWorld/WIN';
export const KAREL_DIED = 'karel/KarelWorld/KAREL_DIED';
export const SET_WORLD = 'karel/KarelWorld/SET_WORLD';

const checkForWin = (dispatch, getState) => {
  const state = getState();
  if (state.KarelWorld.bombs.length === 0 && state.KarelWorld.crown === null) {
    dispatch({ type: WIN });
    const err = KarelError('World Complete');
    err.earlyExit = true;
    throw err;
    return true;
  }
  return false;
};

export const reset = () => ({ type: RESET });
export const setWorld = world => (dispatch, getState) => {
  const { title, desc, code, height, width, karel, bombs, lasers, crown } = parseWorld(world);
  dispatch({ type: SET_WORLD, payload: { height, width, karel, bombs, lasers, crown } });
  dispatch(setCode(code));
  dispatch(setTitleDesc(title, desc));
};
export const karelDied = err => dispatch => {
  dispatch({ type: KAREL_DIED, error: true, payload: err });
  dispatch({ type: STOP });
}

export const moveForward = line => ({ type: MOVE_FORWARD, meta: { line, cmd: 'moveForward();' } });
export const turnLeft = line => ({ type: TURN_LEFT, meta: { line, cmd: 'turnLeft();' } });
export const pickupCrown = line => ({ action(dispatch, getState) {
  const action = { type: PICKUP_CROWN, meta: { line, cmd: 'pickupCrown();' } };
  dispatch(action);
  checkForWin(dispatch, getState);
  return action;
} });
export const diffuseBomb = line => ({ action(dispatch, getState) {
  const action = { type: DIFFUSE_BOMB, meta: { line, cmd: 'diffuseBomb();' } };
  dispatch(action);
  checkForWin(dispatch, getState);
  return action;
} });

/**
 * Reducer
 */

export const DEFAULT_WORLD = `
Default World
The Default World! <b>Bold Text!</b>
---
moveForward();
turnLeft();
moveForward();
turnLeft();
---
. .|9 .
123 .|.|.
. @|.|#
* . . .
`;

export const reducer = (
  state = {
    bombs: [],
    karel: { x: 0, y: 0, dir: 0 },
    crown: null,
    lasers: [[false]],
    height: 1,
    width: 1,
    err: null,
    won: false,
  },
  action
) => {
  // Decrement all the bombs
  let bombs = state.bombs;
  if ([MOVE_FORWARD, TURN_LEFT, PICKUP_CROWN, DIFFUSE_BOMB].indexOf(action.type) !== -1) {
    // These are all no-ops if not running.
    bombs = state.bombs.map(bomb => {
      if (typeof bomb.limit === 'boolean') return bomb;
      const limit = bomb.limit - 1;
      if (limit <= 0) throw KarelError('A bomb exploded!', action.meta);
      return { ...bomb, limit };
    });
  }
  switch (action.type) {
    case SET_WORLD: return { ...state, ...action.payload };
    case MOVE_FORWARD: {
      let { x, y, dir } = state.karel; // eslint-disable-line prefer-const
      if (dir === 0) {        // Right
        if (state.lasers[y][x]) throw KarelError('Karel hit a laser tripwire!', action.meta);
        x++;
      } else if (dir === 1) { // Up
        y--;
      } else if (dir === 2) { // Left
        x--;
        // This is after x-- because we need to check if theres a laser to the right of our new spot
        if (state.lasers[y][x]) throw KarelError('Karel triggered a laser tripwire!', action.meta);
      } else if (dir === 3) { // Down
        y++;
      }
      if (x >= state.width || y >= state.height || y < 0 || x < 0) {
        throw KarelError('Karel hit a wall!', action.meta);
      }
      return { ...state, karel: { ...state.karel, x, y }, bombs };
    }
    case TURN_LEFT:
      return { ...state, karel: { ...state.karel, dir: (state.karel.dir + 1) % 4 }, bombs };
    case PICKUP_CROWN:
      if(
        !state.crown ||
        state.crown.x !== state.karel.x ||
        state.crown.y !== state.karel.y) {
          throw new KarelError('There\'s no crown here!', action.meta);
        }
      return { ...state, crown: null, bombs };
    case DIFFUSE_BOMB:
      const bomb = bombs.reduce(
        (bomb, b) => b.x === state.karel.x && b.y === state.karel.y ? b : bomb,
        null
      );
      if (!bomb) throw new KarelError('There\'s no bomb here!', action.meta);
      bombs = bombs.filter(b => b !== bomb);
      return { ...state, bombs };
    case WIN: return { ...state, won: true, running: false, debugging: false };
    case KAREL_DIED: return { ...state, err: action.payload };
    case RESET: return { ...state, err: null, won: false, ...parseWorld(DEFAULT_WORLD) };
    default: return state;
  }
};

