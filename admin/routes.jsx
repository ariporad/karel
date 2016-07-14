import Immutable from 'immutable';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import App from './App';
import WorldList from './WorldList';
import WorldView from './WorldView';
import UserList from './UserList';
import UserView from './UserView';
import CreateWorld from './CreateWorld';
import EditWorld from './EditWorld';
import AttemptView from './AttemptView';

export default (api) => {
  const injectApi = Comp => props => <Comp {...props} api={api} />;
  return (
    <Router history={browserHistory}>
      <Route path='/admin' component={injectApi(App)}>
        <Route path='worlds'>
          <IndexRoute component={injectApi(WorldList)} />
          <Route path='create' component={injectApi(CreateWorld)} />
          <Route path=':wid' component={injectApi(WorldView)} />
          <Route path=':wid/edit' component={injectApi(EditWorld)} />
        </Route>
        <Route path='users'>
          <IndexRoute component={injectApi(UserList)} />
          <Route path=':uid/attempts/:wid/:num' component={injectApi(AttemptView)} />
          <Route path=':uid' component={injectApi(UserView)} />
        </Route>
      </Route>
    </Router>
  );
};

