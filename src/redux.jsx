import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reducer as KarelWorld } from './KarelWorld/duck';

const reducer = combineReducers({ KarelWorld });

export const store = createStore(reducer, compose(
  applyMiddleware(thunk),
  // ReduxDevTools catches errors in the reducer, which breaks KarelErrors
  false && window.devToolsExtension ? window.devToolsExtension() : f => f
));

