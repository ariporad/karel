import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';
import RedBox from 'redbox-react';
import configureStore from './redux';
import makeApiClient from './api';

import './handleErrors';

// dbg is defined with webpack.DefinePlugin, which doesn't work in the console
global.dbg = dbg;

makeApiClient().then(api => {
  // ReduxDevTools catches errors in the reducer, which breaks KarelErrors
  const store = configureStore(undefined, api, false);
  //const store = configureStore(undefined, api, true);

  api.setStore(store);

  let rootEl = document.getElementById('root');
  if (!rootEl) {
    rootEl = document.createElement('div');
    rootEl.id = 'root';
    rootEl.style = 'display: none;';
    document.body.appendChild(rootEl);
  }

  // DIY HMR: https://github.com/reactjs/redux/pull/1455
  let render = () => {
    const makeRoutes = require('./routes').default;
    ReactDOM.render(
      <Provider store={store}>
        {makeRoutes(api)}
      </Provider>,
      rootEl
    );
  };

  if (module.hot) {
    const renderApp = render;
    const renderError = error => ReactDOM.render(<RedBox error={error} />, rootEl);
    render = () => {
      try {
        renderApp();
      } catch (err) {
        console.error('Got rendering error:', err.message);
        console.error(err.stack);
        renderError(err);
      }
    };
    module.hot.accept('./routes.jsx', render);
  }

  render();
}).catch(err => {
  console.error('Error!');
  console.error(err.message);
  console.error(err.stack);
  alert('Fatal Error!\n' + err.message);
  localStorage.clear();
  sessionStorage.clear();
  document.location.pathname = '/admin'; // Clear the hash and query string
});

