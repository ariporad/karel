import Immutable from 'immutable';
import StatusError from '../StatusError';
import { PUSH, DELETE_ATTEMPTS_FOR_WORLD, LOCK, UNLOCK } from './users';

const debug = dbg('karel:server:ducks:admin');

const CREATE_WORLD = 'karel-server/admin/CREATE_WORLD';
const DELETE_WORLD = 'karel-server/admin/DELETE_WORLD';
const UPDATE_WORLD = 'karel-server/admin/UPDATE_WORLD';

// In a way I feel this might be going to far down the pseudo-action-creators path.
export const get = (wid, uid) => (dispatch, getState) => {
  const state = getState();
  const ret = {};
  if (wid && !state.admin.get('worlds').has(wid)) throw new StatusError(404, 'World Doesn\'t Exist!');
  if (uid && !state.users.has(uid)) throw new StatusError(404, 'World Doesn\'t Exist!');
  if (uid) ret.user = state.users.get(uid);
  if (wid) ret.world = state.admin.get('worlds').get(wid);
  return ret;
};

export const createWorld = world => (dispatch, getState) => {
  debug('Creating World:\n', world);
  const state = getState();
  if (state.admin.get('worlds').includes(world)) {
    const wid = state.admin.get('worlds')
      .entrySeq()
      .filter(([k, v]) => v.trim() === world.trim())
      .first();
    debug('World already exists, doing nothing (wid: %s)', wid);
    return wid;
  }
  // WIDs have to be strings because the will eventually get un-JSONed as strings
  const wid = state.admin.get('next_wid') + '';
  debug('Got wid:', wid);
  world = new Immutable.Map({ wid, text: world });
  dispatch({ type: CREATE_WORLD, payload: world });
  return wid;
};

export const editWorld = (wid, text) => (dispatch, getState) => {
  if (!getState().admin.get('worlds').has(wid)) throw new StatusError(409, 'World Doesn\'t Exist!');
  dispatch({ type: UPDATE_WORLD, payload: { wid, text } });
};

export const deleteWorld = wid => (dispatch, getState) => {
  if (!getState().admin.get('worlds').has(wid)) throw new StatusError(404, 'World Doesn\'t Exist!');
  dispatch({ type: DELETE_WORLD, payload: wid });
  dispatch({ type: DELETE_ATTEMPTS_FOR_WORLD, payload: wid });
}

export const pushWorld = (wid, uid) => (dispatch, getState) => {
  debug('Pushing World: %s to User: %s', wid, uid);
  const state = getState();
  let { user, world } = dispatch(get(wid, uid));
  const alreadyPushed = user.get('queue').reduce((already, world) => already || world.wid === wid);
  if (!alreadyPushed) user = user.update('queue', queue => queue.push(world));
  dispatch({ type: PUSH, payload: user });
  if (user.get('connected') && user.get('socket')) {
    user.get('socket').emit('pushWorld', world.toJS());
  }
};
export const forceWorld = (wid, uid) => (dispatch, getState) => {
  debug('Forcing World: %s to User: %s', wid, uid);
  const state = getState();
  let { user, world } = dispatch(get(wid, uid));
  user = user.set('queue', new Immutable.List([world]));
  dispatch({ type: PUSH, payload: user });
  if (user.get('connected') && user.get('socket')) {
    user.get('socket').emit('forceWorld', world.toJS());
  }
};

export const pushWorldAll = wid => (dispatch, getState) => {
  debug('Pushing world: %s to everyone', wid);
  const state = getState();
  // Immutable stops the forEach if it returns false, which we don't want.
  state.users.forEach(user => dispatch(pushWorld(wid, user.get('id'))) || true);
};
export const forceWorldAll = wid => (dispatch, getState) => {
  debug('Forcing world: %s to everyone', wid);
  const state = getState();
  // Immutable stops the forEach if it returns false, which we don't want.
  state.users.forEach(user => dispatch(forceWorld(wid, user.get('id'))) || true);
};

export const lock = uid => (dispatch, getState) => {
  debug('Locking user: %s', uid);
  const state = getState();
  let { user } = dispatch(get(null, uid));
  if (user.get('unlockable')) return;
  dispatch({ type: LOCK, payload: uid });
  if (user.get('connected') && user.get('socket')) user.get('socket').emit('lock');
};
export const unlock = uid => (dispatch, getState) => {
  debug('Unlocking user: %s', uid);
  const state = getState();
  let { user } = dispatch(get(null, uid));
  dispatch({ type: UNLOCK, payload: uid });
  if (user.get('connected') && user.get('socket')) user.get('socket').emit('unlock');
};

export const lockAll = () => (dispatch, getState) => {
  debug('Locking everyone');
  const state = getState();
  // Immutable stops the forEach if it returns false, which we don't want.
  state.users.forEach(user => dispatch(lock(user.get('id'))) || true);
};
export const unlockAll = () => (dispatch, getState) => {
  debug('Unlocking everyone');
  const state = getState();
  // Immutable stops the forEach if it returns false, which we don't want.
  state.users.forEach(user => dispatch(unlock(user.get('id'))) || true);
};

export const forceAttempt = (wid, uid, num) => (dispatch, getState) => {
  debug('Forcing Attempt #%s of WID:%s to UID:%s', num, wid, uid);
  dispatch(forceWorld(wid, uid));

  const { user } = dispatch(get(null, uid));
  if (user.get('connected') && user.get('socket')) {
    user.get('socket').emit('setCode', user.get('attempts').get(wid).get(num).get('code'));
  }
};

export default (state = Immutable.fromJS({ next_wid: 1, worlds: {} }), action) => {
  switch (action.type) {
    case CREATE_WORLD:
      let newState = state.setIn(['worlds', action.payload.get('wid')], action.payload);
      newState = newState.set('next_wid', newState.get('next_wid') + 1);
      return newState;
    case DELETE_WORLD: return state.deleteIn(['worlds', action.payload]);
    case UPDATE_WORLD: return state.setIn(['worlds', action.payload.wid, 'text'], action.payload.text);
    default: return state;
  }
};
