import Immutable from 'immutable';
import { get } from './admin';

const CONNECT = 'karel-server/users/CONNECT';
const DISCONNECT = 'karel-server/users/DISCONNECT';
const ATTEMPT = 'karel-server/users/ATTEMPT';

const debug = dbg('karel:server:ducks:user');
/*const DEFAULT_WORLD = `
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
K . . .
`;
*/

const DEFAULT_WORLD = `
Default World (Min)
The Minimalist Default World! <b>Bold Text!</b>
---
moveForward();
pickupCrown();
---
. . . .
. . . .
. . . .
K @ . .
`;


export const connect = (token, decoded, profile, socket = null) => (dispatch, getState) => {
  const uid = decoded.sub;
  const state = getState();
  let user;
  if (state.users.has(uid)) {
    debug('Found User: %s', uid);
    user = state.users.get(uid);
  } else {
    debug('Creating User: %s', uid);
    user = Immutable.fromJS({
      id: uid,
      attempts: {},
      admin: !!profile.admin,
      connected: true,
      locked: false,
      queue: [Immutable.fromJS({ wid: '0', text: DEFAULT_WORLD })],
      socket,
      token,
      decoded,
      profile,
    });
  }
  dispatch({ type: CONNECT, payload: { user, socket } });
  return user;
}

export const disconnect = uid => (dispatch, getState) => {
  const { user } = dispatch(get(null, uid));
  dispatch({ type: DISCONNECT, payload: user });
};

export const attempt = (uid, code, wid) => (dispatch, getState) => {
  const { user } = dispatch(get(null, uid));
  dispatch({ type: ATTEMPT, payload: { user, code, wid } });
};

export default (state = new Immutable.Map(), action) => {
  switch (action.type) {
    case CONNECT: {
      let user = action.payload.user;
      user = user.set('connected', true);
      user = user.set('socket', action.payload.socket);
      return state.set(user.get('id'), user);
    }
    case DISCONNECT: {
      let user = action.payload;
      user = user.set('connected', false);
      user = user.set('socket', null);
      return state.set(user.get('id'), user);
    }
    case ATTEMPT:
      let { user, wid, code } = action.payload;
      user = user.updateIn(['attempts', wid], (attempts = new Immutable.List()) => {
        return attempts.push(new Immutable.Map({ date: Date.now(), code }));
      });
      return state.set(user.get('id'), user);
      return ret;
    default: return state;
  }
};

