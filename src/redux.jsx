import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reducer as KarelWorld } from './KarelWorld/duck';

const configureStore = initialState => {
  const reducer = combineReducers({ KarelWorld });
  return createStore(reducer, initialState, compose(
    applyMiddleware(thunk),
    // ReduxDevTools catches errors in the reducer, which breaks KarelErrors
    false && window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
};

export default configureStore;

