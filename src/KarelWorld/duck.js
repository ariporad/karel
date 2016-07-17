import { KarelError } from './KarelError';
import { parseWorld } from './parseWorld';
import { STOP, setCode } from '../Editor/duck';
import { setTitleDesc } from '../TopBar/duck';

/**
 * Actions
 */

export const WIN           = 'karel/KarelWorld/WIN';
export const SET_WORLD     = 'karel/KarelWorld/SET_WORLD';
export const TURN_LEFT     = 'karel/KarelWorld/TURN_LEFT';
export const KAREL_DIED    = 'karel/KarelWorld/KAREL_DIED';
export const TURN_RIGHT    = 'karel/KarelWorld/TURN_RIGHT';
export const TURN_AROUND   = 'karel/KarelWorld/TURN_AROUND';
export const PICKUP_CROWN  = 'karel/KarelWorld/PICKUP_CROWN';
export const DIFFUSE_BOMB  = 'karel/KarelWorld/DIFFUSE_BOMB';
export const MOVE_FORWARD  = 'karel/KarelWorld/MOVE_FORWARD';
export const MOVE_BACKWARD = 'karel/KarelWorld/MOVE_BACKWARD';
export { STOP } from '../Editor/duck'; // Cheat a bit

export const reset = () => (dispatch, getState) => {
  return dispatch(setWorld({ text: getState().KarelWorld.worldStr, wid: getState().KarelWorld.wid }));
}
export const setWorld = ({ text, wid }) => (dispatch, getState) => {
  const isNewWorld = getState().KarelWorld.worldStr.trim() !== text.trim();
  const { title, desc, code, ...world } = parseWorld(text);
  dispatch({
    type: SET_WORLD,
    payload: { ...world, wid, won: false, err: null, worldStr: text },
  });
  if (isNewWorld) {
    dispatch(setCode(code));
    dispatch(setTitleDesc(title, desc));
  }
};
export const karelDied = err => dispatch => {
  dispatch({ type: KAREL_DIED, error: true, payload: err });
  dispatch({ type: STOP });
}

/**
 * Reducer
 */

export const reducer = (
  state = {
    bombs: [],
    karel: { x: 0, y: 0, dir: 0, ultra: false, super: false },
    crown: null,
    lasers: [[false]],
    height: 1,
    width: 1,
    err: null,
    won: true,
    worldStr: 'K',
    wid: null,
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
      if (limit < 0) throw KarelError('A bomb exploded!', action.meta);
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
    case MOVE_BACKWARD: {
      let { x, y, dir } = state.karel; // eslint-disable-line prefer-const
      if (dir === 0) {        // Right
        if (state.lasers[y][x]) throw KarelError('Karel hit a laser tripwire!', action.meta);
        x--;
      } else if (dir === 1) { // Up
        y++;
      } else if (dir === 2) { // Left
        x++;
        // This is after x-- because we need to check if theres a laser to the right of our new spot
        if (state.lasers[y][x]) throw KarelError('Karel triggered a laser tripwire!', action.meta);
      } else if (dir === 3) { // Down
        y--;
      }
      if (x >= state.width || y >= state.height || y < 0 || x < 0) {
        throw KarelError('Karel hit a wall!', action.meta);
      }
      return { ...state, karel: { ...state.karel, x, y }, bombs };
    }
    case TURN_LEFT:
      return { ...state, karel: { ...state.karel, dir: (state.karel.dir + 1) % 4 }, bombs };
    case TURN_RIGHT:
      let dir = state.karel.dir;
      dir--;
      if (dir < 0) dir = 3;
      return { ...state, karel: { ...state.karel, dir }, bombs };
    case TURN_AROUND:
      return { ...state, karel: { ...state.karel, dir: (state.karel.dir + 2) % 4 }, bombs };
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
    default: return state;
  }
};

