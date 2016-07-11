import Immutable from 'immutable';
const CONNECT = 'karel-server/users/CONNECT';
const DISCONNECT = 'karel-server/users/DISCONNECT';
const ATTEMPT = 'karel-server/users/ATTEMPT';

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
  const id = decoded.sub;
  const state = getState();
  let user;
  if (state.users.has(id)) {
    user = state.users.get(id);
  } else {
    user = Immutable.fromJS({
      id,
      attempts: {},
      admin: !!profile.admin,
      connected: true,
      locked: false,
      queue: [Immutable.fromJS({ wid: 0, text: DEFAULT_WORLD })],
      socket,
      token,
      decoded,
      profile,
    });
  }
  dispatch({ type: CONNECT, payload: { user, socket } });
  return user;
}

export const disconnect = user => ({ type: DISCONNECT, payload: user });

export const attempt = (user, code, wid = 1) => ({ type: ATTEMPT, payload: { code, user, wid } });

export default (state = new Immutable.Map(), action) => {
  switch (action.type) {
    case CONNECT: {
      let user = action.payload.user;
      user = user.set('connected', true);
      user = user.set('socket', action.payload.socket);
      return state.set(user.id, user);
    }
    case DISCONNECT: {
      let user = action.payload;
      user = user.set('connected', false);
      user = user.set('socket', null);
      return state.set(user.id, user);
    }
    case ATTEMPT:
      const ret = state.set(action.payload.user.get('id'), action.payload.user.updateIn(
        ['attempts', action.payload.wid],
        (attempts = new Immutable.List())=> {
          return attempts.push({ date: Date.now(), code: action.payload.code })
        }
      ));
      return ret;
    default: return state;
  }
};

