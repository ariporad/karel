import { KarelError } from './KarelError';
import { parseWorld } from './parseWorld';

/**
 * Actions
 */

export const MOVE_FORWARD = 'karel/KarelWorld/MOVE_FORWARD';
export const TURN_LEFT    = 'karel/KarelWorld/TURN_LEFT';
export const RESET        = 'karel/KarelWorld/RESET';
export const KAREL_DIED   = 'karel/KarelWorld/KAREL_DIED';

// TODO: Action Creators

export const reset = () => ({ type: RESET });

const karelDied   = err => ({ type: KAREL_DIED, error: true, payload: err });
const handleDeath = actionCreator => (...args) => dispatch => {
  try {
    return dispatch(actionCreator(...args));
  } catch (err) {
    if (err.karel) return dispatch(karelDied(err));
    throw err;
  }
};

export const moveForward = handleDeath(line => ({ type: MOVE_FORWARD, meta: { line, cmd: 'moveForward();' } }));
export const turnLeft    = handleDeath(line => ({ type: TURN_LEFT,    meta: { line, cmd: 'turnLeft();'    } }));

global.moveForward = moveForward;
global.turnLeft = turnLeft;

/**
 * Reducer
 */

export const DEFAULT_WORLD = `
. .|9 .
123 .|.|.
. .|.|#
* . . .
`;

export const reducer = (state = { ...parseWorld(DEFAULT_WORLD), err: null }, action) => {
  // Decrement all the bombs
  let bombs = state.bombs;
  if ([MOVE_FORWARD, TURN_LEFT].indexOf(action.type) !== -1) {
    bombs = state.bombs.map(bomb => {
      if (typeof bomb.limit === 'boolean') return bomb;
      bomb = { ...bomb, limit: bomb.limit - 1 };
      if (bomb.limit <= 0) throw KarelError('A bomb exploded!', action.meta);
      return bomb;
    });
  }
  switch (action.type) {
    case MOVE_FORWARD:
      let { x, y, dir } = state.karel;
      if (dir === 0) {        // Right
        if (state.lasers[y][x]) throw KarelError('Karel hit a laser tripwire!', action.meta);
        x++;
      } else if (dir === 1) { // Up
        y--;
      } else if (dir === 2) { // Left
        x--;
        // This goes after we x--, because we need to check if there's a laser to the right of our new spot.
        if (state.lasers[y][x]) throw KarelError('Karel triggered a laser tripwire!', action.meta);
      } else if (dir === 3) { // Down
        y++;
      }
      if (x >= state.width || y >= state.height || y < 0 || x < 0) throw KarelError('Karel hit a wall!', action.meta);
      return { ...state, karel: { ...state.karel, x, y }, bombs };
    case TURN_LEFT: return { ...state, karel: { ...state.karel, dir: (state.karel.dir + 1) % 4 }, bombs };
    case KAREL_DIED: return { ...state, err: action.payload };
    case RESET: return { ...state, err: null, ...parseWorld(DEFAULT_WORLD) };
    default: return state;
  }
};

