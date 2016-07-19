import { Well, Button } from 'react-bootstrap';
import { withRouter, Link } from 'react-router';
import { formatTimestamp } from './utils';
import equal from 'deep-equal';
import KarelWorld from './KarelWorld';
import StatusError from '../server/StatusError';
import ErrorPage from './ErrorPage';

const PANEL_HEIGHT = 78/* vh */;

const styles = {
  main: {
    self: {
      display: 'flex',
    },
    panels: {
      self: {
        display: 'flex',
      },
      code: {
        width: '48%',
        height: `${PANEL_HEIGHT}vh`,
        flexGrow: 1,
        flexShrink: 1,
        marginRight: 8,
      },
      worlds: {
        self: {
          // Child
          height: `${PANEL_HEIGHT}vh`,
          width: '48%',
          flexGrow: 1,
          flexShrink: 1,
          marginLeft: 8,

          // Parent
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
        },
        world: {
          maxWidth: '100%',
          maxHeight: `${PANEL_HEIGHT / 2 - 5}vh`,
          flexGrow: 1,
          flexShrink: 1,
        },
        title: {
          marginTop: 0,
          flexGrow: 1,
          flexShrink: 1,
        },
      },
    },
  },
};

export const _AttemptView = Radium(({ user, world, num, forceAttempt }) => {
  const attempt = user.attempts[world.wid][num];
  const urlPrefix = `/admin/users/${encodeURIComponent(user.id)}/attempts/${world.wid}/`;
  const next = `${urlPrefix}${num + 1}`;
  const prev = `${urlPrefix}${num - 1}`;
  return (
    <div>
      <div>
        <h2>User: {user.profile.name} &middot; {user.profile.email}</h2>
        <h2>World: {world.text.trim().split('\n')[0]} ({world.wid})</h2>
        <h2 style={{ marginTop: 0, marginRight: 20, display: 'inline-block' }}>
          Attempt: #{num} ({formatTimestamp(attempt.date)})
          (<Link to={prev}>&lt; prev</Link> <Link to={next}>next &gt;</Link>)
        </h2>
        <Button
          bsStyle="danger"
          style={{ marginBottom: 10 }}
          onClick={() => forceAttempt(world.wid, user.id, num)}
        >Force</Button>
      </div>
      <div style={styles.main.panels.self}>
        <div style={styles.main.panels.code}>
          <pre>{attempt.code}</pre>
        </div>
        <Well style={styles.main.panels.worlds.self}>
          <div>
            <h4 style={styles.main.panels.worlds.title}>Start World:</h4>
            <KarelWorld code={''} world={world} style={styles.main.panels.worlds.world}/>
          </div>
          <div>
            <h4>End World:</h4>
            <KarelWorld code={attempt.code} world={world} style={styles.main.panels.worlds.world}/>
          </div>
        </Well>
      </div>
    </div>
  );
});

class AttemptView extends React.Component {
  state = { loading: true, user: null, world: null, err: null };

  fetchData(props) {
    Promise
      .all([
        this.props.api.userInfo(props.params.uid),
        this.props.api.worldInfo(props.params.wid + ''),
      ])
      .then(([user, { world }]) => {
        if (
          !user.attempts[world.wid] ||
          !user.attempts[world.wid][parseInt(props.params.num, 10)]
        ) {
          throw new StatusError(404, 'Attempt Not Found!');
        }
        user.attempts[world.wid][parseInt(props.params.num, 10)]
        this.setState({ loading: false, user, world })
      })
      .catch(err => this.setState({ loading: false, err }));
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!equal(nextProps, this.props)) this.fetchData(nextProps);
  }

  render() {
    if (this.state.loading) return <h1>Loading...</h1>;
    if (this.state.err) return <ErrorPage err={this.state.err} />;
    return (
      <_AttemptView
        user={this.state.user}
        world={this.state.world}
        num={parseInt(this.props.params.num, 10)}
        forceAttempt={this.props.api.forceAttempt}
      />
    );
  }
}

export default withRouter(AttemptView);

