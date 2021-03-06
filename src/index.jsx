import { Provider } from 'react-redux';
import RedBox from 'redbox-react';
import configureStore from './redux';
import App from './App';
import { setWorld, DEFAULT_WORLD } from './KarelWorld/duck';

// ReduxDevTools catches errors in the reducer, which breaks KarelErrors
const store = configureStore(undefined, !true);

store.dispatch(setWorld(DEFAULT_WORLD));

let rootEl = document.getElementById('root');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'root';
  rootEl.style = 'display: none;';
  document.body.appendChild(rootEl);
}

// DIY HMR: https://github.com/reactjs/redux/pull/1455
let render = () => {
  const App = require('./App').default;
  ReactDOM.render(
    <Provider store={store}>
      <App />
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
  module.hot.accept('./App.jsx', render);
}

render();

