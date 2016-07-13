import Immutable from 'immutable';

const debug = dbg('karel:server:ducks:admin');

const CREATE_WORLD = 'karel-server/admin/CREATE_WORLD';
const DELETE_WORLD = 'karel-server/admin/DELETE_WORLD';

// In a way I feel this might be going to far down the pseudo-action-creators path.
export const get = (wid, uid) => (dispatch, getState) => {
  const ret = {};
  if (uid) ret.user = getState().users.get(uid);
  if (wid) ret.world = getState().admin.get('worlds').get(wid);
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

export const deleteWorld = wid => ({ type: DELETE_WORLD, payload: wid });

export const pushWorld = (wid, uid) => (dispatch, getState) => {
  debug('Pushing World: %s to User: %s', wid, uid);
  const state = getState();
  let { user, world } = dispatch(get(wid, uid));
  user = user.update('queue', queue => queue.push(world));
  if (user.get('connected') && user.get('socket')) {
    user.get('socket').emit('pushWorld', world.toJS());
  }
};
export const forceWorld = (wid, uid) => (dispatch, getState) => {
  debug('Forcing World: %s to User: %s', wid, uid);
  const state = getState();
  let { user, world } = dispatch(get(wid, uid));
  user = user.set('queue', new Immutable.List([world]));
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


export default (state = Immutable.fromJS({ next_wid: 1, worlds: {} }), action) => {
  switch (action.type) {
    case CREATE_WORLD:
      let newState = state.setIn(['worlds', action.payload.get('wid')], action.payload);
      newState = newState.set('next_wid', newState.get('next_wid') + 1);
      return newState;
    case DELETE_WORLD: return state.deleteIn(['worlds', action.payload]);
    default: return state;
  }
};
