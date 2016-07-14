import { ButtonGroup, ButtonToolbar, Button, Table } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { parseWorld } from '../src/KarelWorld/parseWorld';
import { formatTimestamp } from './utils';
import KarelWorld from './KarelWorld';

const CONTAINER_HEIGHT = 90 /* vh */;
const TOP_HALF_HEIGHT = 40 /* % */ / 100;
const BOTTOM_HALF_HEIGHT = 1 - TOP_HALF_HEIGHT;

const styles = {
  containers: {
    self: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: `${CONTAINER_HEIGHT}vh`,
    },

    // Top Half
    topHalf: {
      // Child
      width: '100%',
      height: `${CONTAINER_HEIGHT * TOP_HALF_HEIGHT}vh`,
      flexGrow: 1,
      flexShrink: 1,
      overflow: 'auto',

      // Parent
      display: 'flex',
    },
    titleDesc: {
      marginRight: 'auto',
      flexGrow: 1,
    },
    buttonsKW: {
      // Child
      marginLeft: 'auto',
      flexGrow: 0,

      // Parent
      display: 'flex',
      flexDirection: 'column',
    },

    // Bottom Half
    bottomHalf: {
      width: '100%',
      height: `${CONTAINER_HEIGHT * BOTTOM_HALF_HEIGHT}vh`,
      flexGrow: 4,
      flexShrink: 4,
      display: 'flex',
      overflow: 'hidden',
    },
  },
  buttons: {
    self: {
      margin: 10,
      flexShrink: 0,
    },
  },
  KarelWorld: {
    flexShrink: 1,
  },

  // Bottom Half
  bottomQuarter: {
    flexGrow: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  defaultCode: {
    marginRight: 5,
  },
  attempts: {
    self: {
      marginLeft: 5,
      overflowY: 'scroll',
    },
    avatar: {
      maxWidth: 34,
      maxHeight: 35,
      marginRight: 8,
    },
    table: {
    },
  },
};

export const _WorldView = withRouter(Radium(({ world: { wid, text }, attempts, pushAll, forceAll, deleteWorld, router }) => {
  const world = parseWorld(text);
  const makeAttemptViewHandler = (uid, num) => () => {
    router.push(`/admin/users/${uid}/attempts/${wid}/${num}`);
  };
  return (
    <div style={styles.containers.self}>
      <div style={styles.containers.topHalf}>
        <div style={styles.containers.titleDesc}>
          <h1>{world.title}</h1>
          <p>{world.desc}</p>
        </div>
        <div style={styles.containers.buttonsKW}>
          <ButtonToolbar style={styles.buttons.self}>
            <ButtonGroup>
              <Button bsStyle="warning">Push</Button>
              <Button bsStyle="danger">Force</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button bsStyle="warning" onClick={() => pushAll(wid)}>Push All</Button>
              <Button bsStyle="danger" onClick={() => {
                confirm('Force world to everyone?') && forceAll(wid);
              }}>Force All</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button onClick={() => router.push(`/admin/worlds/${wid}/edit`)}>Edit World</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button bsStyle="danger" onClick={() => {
                if (!confirm('Delete World?')) return;
                deleteWorld(wid);
                router.push('/admin/worlds');
              }}>Delete World</Button>
            </ButtonGroup>
          </ButtonToolbar>
          <KarelWorld style={styles.KarelWorld} world={{ text, wid }} code='' />
        </div>
      </div>
      <div style={styles.containers.bottomHalf}>
        <pre style={[styles.bottomQuarter, styles.defaultCode]}>{world.code}</pre>
        <div style={[styles.bottomQuarter, styles.attempts.self]}>
          <Table style={[styles.attempts.table]} bordered>
            <thead>
              <tr>
                <td>Name</td>
                <td>Time</td>
                <td>Actions</td>
              </tr>
            </thead>
            <tbody>
              {attempts.length > 0 ? attempts.sort((a, b) => b.date - a.date).map((attempt, num) => (
                <tr>
                  <td>
                    <img style={styles.attempts.avatar} src={attempt.user.picture} />
                    {attempt.user.name}
                  </td>
                  <td>{formatTimestamp(attempt.date)}</td>
                  <td>
                    <Button
                      bsStyle="link"
                      onClick={makeAttemptViewHandler(attempt.user.user_id, num)}
                    >View</Button>
                  </td>
                </tr>
              )) : <tr><td style={{ textAlign: 'center' }} colSpan={3}>No Attempts</td></tr>}
            </tbody>
          </Table>
        </div>
      </div>
      <Radium.Style rules={{ 'html, body, #root': { width: '100%', height: '100%' } }} />
    </div>
  );
}));

export default class WorldView extends React.Component  {
  state = { world: null, attempts: null, loading: true, error: null };

  componentDidMount() {
    this.props.api.worldInfo(this.props.params.wid)
      .then(({ world, attempts, error }) => this.setState({ world, attempts, error, loading: false }))
      .catch(err => this.setState({ error: err, loading: false }));
  }

  render() {
    if (this.state.loading) return <h1>Loading...</h1>;
    if (this.state.error) return <h1><code>{this.state.error.toString()}</code></h1>;
    return <_WorldView
      world={this.state.world}
      attempts={this.state.attempts}
      pushAll={this.props.api.pushAll}
      forceAll={this.props.api.forceAll}
      deleteWorld={this.props.api.deleteWorld}
    />
  }
}


