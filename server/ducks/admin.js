import Immutable from 'immutable';

const debug = dbg('karel:server:ducks:admin');

const CREATE_WORLD = 'karel-server/admin/CREATE_WORLD';
const DELETE_WORLD = 'karel-server/admin/DELETE_WORLD';

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
  const wid = state.admin.get('next_wid');
  debug('Got wid:', wid);
  world = new Immutable.Map({ wid, text: world });
  dispatch({ type: CREATE_WORLD, payload: world });
  return wid;
};

export const deleteWorld = wid => ({ type: DELETE_WORLD, payload: wid });

export const pushWorld = (wid, user) => (dispatch, getState) => {
  debug('Pushing World: %s to User: %s', wid, user.get('id'));
  const state = getState();
  const world = state.admin.get('worlds').get(wid);
  debug('World:', state.admin.toJS());
  user = user.update('queue', queue => queue.push(world));
  if (user.get('connected') && user.get('socket')) {
    user.get('socket').emit('pushWorld', world.toJS());
  }
};
export const forceWorld = (wid, user) => (dispatch, getState) => {
  debug('Forcing World: %s to User: %s', wid, user.get('id'));
  const state = getState();
  const world = state.admin.get('worlds').get(wid);
  user = user.set('queue', new Immutable.List([world]));
  if (user.get('connected') && user.get('socket')) {
    user.get('socket').emit('forceWorld', world.toJS());
  }
};

export const pushWorldAll = wid => (dispatch, getState) => {
  debug('Pushing world: %s to everyone', wid);
  const state = getState();
  // Immutable stops the forEach if it returns false, which we don't want.
  state.users.forEach(user => dispatch(pushWorld(wid, user)) || true);
};

export const forceWorldAll = wid => (dispatch, getState) => {
  debug('Forcing world: %s to everyone', wid);
  const state = getState();
  // Immutable stops the forEach if it returns false, which we don't want.
  state.users.forEach(user => dispatch(forceWorld(wid, user)) || false);
};


export default (state = Immutable.fromJS({ next_wid: 1, worlds: {} }), action) => {
  switch (action.type) {
    case CREATE_WORLD: return state.setIn(['worlds', action.payload.get('wid')], action.payload);
    case DELETE_WORLD: return state.deleteIn(['worlds', action.payload]);
    default: return state;
  }
};
