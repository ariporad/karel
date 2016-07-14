import { Well } from 'react-bootstrap';
import { withRouter, Link } from 'react-router';
import { formatTimestamp } from './utils';
import KarelWorld from './KarelWorld';

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

export const _AttemptView = Radium(({ user, world, num }) => {
  const attempt = user.attempts[world.wid][num];
  const urlPrefix = `/admin/users/${encodeURIComponent(user.id)}/attempts/${world.wid}/`;
  const next = `${urlPrefix}${num + 1}`;
  const prev = `${urlPrefix}${num - 1}`;
  return (
    <div>
      <div>
        <h2>User: {user.profile.name} &middot; {user.profile.email}</h2>
        <h2>World: {world.text.trim().split('\n')[0]} ({world.wid})</h2>
        <h2>Attempt: #{num} ({formatTimestamp(attempt.date)})
          (<Link to={prev}>&lt; prev</Link> <Link to={next}>next &gt;</Link>)
        </h2>
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
  state = { loading: true, user: null, world: null };

  componentDidMount() {
    Promise.all([
      this.props.api.userInfo(this.props.params.uid),
      this.props.api.worldInfo(this.props.params.wid + ''),
    ])
      .then(([user, { world }]) => {
        try {
          this.setState({ loading: false, user, world })
        } catch (err) {
          console.error(err.message);
          console.error(err.stack);
        }
      })
      .catch(err => {
        console.error(err.message);
        console.error(err.stack);
      });
  }

  render() {
    if (this.state.loading) return <h1>Loading...</h1>;
    return (
      <_AttemptView
        user={this.state.user}
        world={this.state.world}
        num={parseInt(this.props.params.num, 10)}
      />
    );
  }
}

export default withRouter(AttemptView);

