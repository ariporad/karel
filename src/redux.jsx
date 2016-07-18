import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reducer as KarelWorld } from './KarelWorld/duck';
import { reducer as Editor } from './Editor/duck';
import TopBar from './TopBar/duck';
import apiDuck from './apiDuck';
import Locker from './Locker/duck';

const configureStore = (initialState, api, devtools = false) => {
  const reducer = combineReducers({ KarelWorld, Editor, TopBar, api: apiDuck, Locker });
  return createStore(reducer, initialState, compose(
    applyMiddleware(thunk.withExtraArgument(api)),
    devtools && window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
};

export default configureStore;

