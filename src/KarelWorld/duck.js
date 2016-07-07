import { KarelError } from './KarelError';
import { parseWorld } from './parseWorld';

/**
 * Actions
 */

export const MOVE_FORWARD = 'karel/KarelWorld/MOVE_FORWARD';
export const TURN_LEFT = 'karel/KarelWorld/TURN_LEFT';
export const RESET = 'karel/KarelWorld/RESET';
export const KAREL_DIED = 'karel/KarelWorld/KAREL_DIED';

export const reset = () => ({ type: RESET });
export const karelDied = err => ({ type: KAREL_DIED, error: true, payload: err });

export const moveForward = line => ({ type: MOVE_FORWARD, meta: { line, cmd: 'moveForward();' } })
export const turnLeft = line => ({ type: TURN_LEFT, meta: { line, cmd: 'turnLeft();' } })

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
      const limit = bomb.limit - 1;
      if (limit <= 0) throw KarelError('A bomb exploded!', action.meta);
      return { ...bomb, limit };
    });
  }
  switch (action.type) {
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
    case KAREL_DIED: return { ...state, err: action.payload };
    case RESET: return { ...state, err: null, ...parseWorld(DEFAULT_WORLD) };
    default: return state;
  }
};

