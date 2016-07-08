import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reducer as KarelWorld } from './KarelWorld/duck';
import { reducer as Editor } from './Editor/duck';
import TopBar from './TopBar/duck';

const configureStore = (initialState, devtools = false) => {
  const reducer = combineReducers({ KarelWorld, Editor, TopBar });
  return createStore(reducer, initialState, compose(
    applyMiddleware(thunk),
    devtools && window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
};

export default configureStore;

