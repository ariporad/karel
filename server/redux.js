import Immutable from 'immutable';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { writeFile, readFileSync, existsSync } from 'mz/fs';
import thunk from 'redux-thunk';
import users from './ducks/users';
import admin from './ducks/admin';

const debug = dbg('karel:server:redux');
/**
 * A store enchancer which stores the state to disk after each action, and loads the initialState
 * from a file.
 *
 * This should be the first store echancer (ie. the other store enchancers should be on top of this)
 * It will be completely transparent to them.
 *
 * NOTE: This will override any initialState with the state loaded from the file.
 *
 * Usage:
 * ```javascript
 * import { createStore, applyMiddleware, compose } from 'redux';
 *
 * const store = createStore(reducer, compose(applyMiddleware(middleware), saveStore({ path: '~/.store/store.json' })));
 * ```
 */
// TODO: move into own module
export const saveStore =
  ({ path = './store.json' } = {}) => createStore => (reducer, initialState, enchancer) => {
    const debug = dbg('karel:server:redux:saveStore');
    let loadedState = null;
    if (existsSync(path)) {
      debug('Loading State');
      try {
        loadedState = JSON.parse(readFileSync(path, 'utf8'));
      } catch (err) {
        debug('Failed to load state:');
        debug(err.message);
        debug(err.stack);
      }
    }

    if (loadedState) {
      loadedState.admin = Immutable.fromJS(loadedState.admin);
      loadedState.users = Immutable.fromJS(loadedState.users);
    }

    const store = createStore(reducer, loadedState || initialState, enchancer);
    const dispatch = store.dispatch;

    return {
      ...store,
      dispatch(action) {
        const ret = dispatch(action);

        let state = { ...store.getState() };
        state.admin = state.admin.toJS();
        state.users = state.users.toJS();

        const stateStr = JSON.stringify(state, (key, value) => key === 'socket' ? null : value);
        writeFile(path, stateStr).then(() => {
          debug('Successfully Stored State');
        }).catch(err => {
          console.error('Failed to save state!:');
          console.error(err.message);
          console.error(err.stack);
        });

        return ret;
      },
    };
};

export default saveOpts => {
  const reducer = combineReducers({ users, admin });
  return createStore(reducer, undefined, compose(saveStore(saveOpts), applyMiddleware(thunk)));
};
