import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import apiDuck from './apiDuck';

const configureStore = (initialState, api, devtools = false) => {
  const reducer = combineReducers({ api: apiDuck });
  return createStore(reducer, initialState, compose(
    applyMiddleware(thunk.withExtraArgument(api)),
    devtools && window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
};

export default configureStore;

