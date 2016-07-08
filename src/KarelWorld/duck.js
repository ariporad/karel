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
export const RESET = 'karel/KarelWorld/RESET';
export const KAREL_DIED = 'karel/KarelWorld/KAREL_DIED';
export const SET_WORLD = 'karel/KarelWorld/SET_WORLD';

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
export const pickupCrown = line => ({ type: PICKUP_CROWN, meta: { line, cmd: 'pickupCrown();' } });

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
  },
  action
) => {
  // Decrement all the bombs
  let bombs = state.bombs;
  if ([MOVE_FORWARD, TURN_LEFT, PICKUP_CROWN].indexOf(action.type) !== -1) {
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
    case KAREL_DIED: return { ...state, err: action.payload };
    case RESET: return { ...state, err: null, ...parseWorld(DEFAULT_WORLD) };
    default: return state;
  }
};

