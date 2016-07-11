import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import users from './ducks/users';
import admin from './ducks/admin';

export default initialState => {
  return createStore(combineReducers({ users, admin }), initialState, applyMiddleware(thunk));
};
