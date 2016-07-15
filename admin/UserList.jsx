import { Table, ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';

const styles = {
  table: {
    tableLayout: 'fixed',
    border: '1px solid #dddddd',
  },
  name: {
    display: 'inline',
    verticalAlign: 'center',
  },
  td: {
    actions: {
      whiteSpace: 'nowrap',
      width: 150,
    },
    name: {
    },
    image: {
      maxWidth: 48,
      maxHeight: 48,
      paddingTop: 0,
      paddingBottom: 0,
    },
    id: {
      whiteSpace: 'nowrap',
    },
  },
  lock: {
    backgroundColor: '#666666',
    borderColor: '#555555',
    color: 'white',
  },
  id: {
    margin: 0,
    // I don't think this looks as good, but it makes it have the same height as the button.
    // The other option would be to use a <code> instead of a <pre>, but that's less semantic.
    padding: 7,
  },
}

export const _UserList = withRouter(Radium(({ users, router }) => {
  const trs = users.map((user, i) => (
    <tr key={i}>
      <td style={styles.td.image}>
        <img src={user.profile.picture} style={styles.td.image}/>
      </td>
      <td style={styles.td.name}>
        <p style={styles.name}>{user.profile.name}</p>
      </td>
      <td style={styles.td.id}><pre style={styles.id}>{user.id}</pre></td>
      <td style={styles.td.actions}>
        <ButtonToolbar>
          <ButtonGroup>
            <Button style={styles.lock}>{user.locked ? 'Unlock': 'Lock'}</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              bsStyle="link"
              onClick={() => router.push(`/admin/users/${encodeURIComponent(user.id)}`)}
            >View</Button>
          </ButtonGroup>
        </ButtonToolbar>
      </td>
    </tr>
  ));

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 20, width: '100%' }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <div style={{ marginLeft: 'auto' }}>
          <ButtonGroup>
            <Button style={styles.lock}>Lock All</Button>
            <Button style={styles.lock}>Unlock All</Button>
          </ButtonGroup>
        </div>
      </div>
      <Table style={styles.table} striped bordered>
        <thead>
          <tr>
            <td style={{ width: 64, textAlign: 'center' }}>{'Avatar'}</td>
            <td style={styles.td.title}>{'Name'}</td>
            <td style={styles.td.id}>{'ID'}</td>
            <td style={styles.td.actions}>{'Actions'}</td>
          </tr>
        </thead>
        <tbody>{trs}</tbody>
      </Table>
    </div>
  );
}));


export default class UserList extends React.Component {
  state = { users: [], loading: true, err: null };

  componentDidMount() {
    this.props.api.listUsers()
      .then(users => {
        users = Object.keys(users).map(key => users[key]);
        this.setState({ users, loading: false })
      })
      .catch(err => this.setState({ err }));
  }

  render() {
    if (this.err) return <ErrorPage err={this.state.err} />;
    if (this.loading) return <h1>Loading...</h1>;
    return <_UserList users={this.state.users} />;
  }
};

