import Immutable from 'immutable';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import App from './App';
import WorldList from './WorldList';
import WorldView from './WorldView';
import UserList from './UserList';
import UserView from './UserView';

export default (api) => {
  const injectApi = Comp => props => <Comp {...props} api={api} />;
  return (
    <Router history={browserHistory}>
      <Route path='/admin' component={injectApi(App)}>
        <Route path='worlds'>
          <IndexRoute component={injectApi(WorldList)} />
          <Route path=':wid' component={injectApi(WorldView)} />
        </Route>
        <Route path='users'>
          <IndexRoute component={injectApi(UserList)} />
          <Route path=':uid' component={injectApi(UserView)} />
        </Route>
      </Route>
    </Router>
  );
};

