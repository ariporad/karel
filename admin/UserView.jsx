import { withRouter } from 'react-router';
import { Table, Button } from 'react-bootstrap';
import { formatTimestamp } from './utils';

const styles = {
  wid: {
    width: 30,
    textAlign: 'center',
  },
  actions: {
    width: 70,
    textAlign: 'center',
  }, table: {
    marginTop: 12,
    border: '1px solid #ddd',
  },
};

const _UserView = withRouter(Radium(({ user, worlds, router }) => {
  const makeAttemptUrl = (uid, wid, num) => `/admin/users/${uid}/attempts/${wid}/${num}`;
  const attempts = [];
  Object.keys(user.attempts).forEach(wid => {
    user.attempts[wid].forEach(attempt => {
      attempts.push({ ...attempt, wid });
    });
  });
  return (
    <div>
      <div>
        <h1>
          User: {user.profile.name}
          <small> <code>{user.profile.user_id}</code> &middot; {user.profile.email || 'No Email'}</small>
        </h1>
      </div>
      <div>
        <Table style={styles.table}>
          <thead>
            <tr>
              <td style={styles.wid}>WID</td>
              <td>World</td>
              <td>Time</td>
              <td style={styles.actions}>Actions</td>
            </tr>
          </thead>
          <tbody>
            {attempts.length > 0 ? attempts.sort((a, b) => b.date - a.date).map((attempt, num) => (
              <tr>
                <td style={styles.wid}>{attempt.wid}</td>
                <td><b>{worlds[attempt.wid].text.trim().split('\n')[0]}</b></td>
                <td>{formatTimestamp(attempt.date)}</td>
                <td style={styles.actions}>
                  <Button
                    bsStyle="link"
                    onClick={() => {
                      router.push(makeAttemptUrl(user.profile.user_id, attempt.wid, num))
                    }}
                  >View</Button>
                </td>
              </tr>
            )) : <tr><td colSpan={4} style={{ textAlign: 'center' }}>No Attempts</td></tr>}
          </tbody>
        </Table>
      </div>
    </div>
  );
}));

export default class UserView extends React.Component {
  state = { loading: true, error: null, user: null, worlds: null };

  componentDidMount() {
    Promise.all([this.props.api.userInfo(this.props.params.uid), this.props.api.listWorlds()])
      .then(([user, worlds]) => this.setState({ loading: false, user, worlds }))
      .catch(err => {
        console.error(err.message);
        console.error(err.stack);
        this.setState({ loading: false, error: err })
      });
  }

  render() {
    if (this.state.loading) return <h1>Loading...</h1>;
    if (this.state.error) return <h1><code>{this.state.error.message || this.state.error}</code></h1>;
    return <_UserView worlds={this.state.worlds} user={this.state.user} />;
  }
};

