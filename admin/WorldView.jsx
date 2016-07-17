import { ButtonGroup, ButtonToolbar, Button, Table } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { parseWorld } from '../src/KarelWorld/parseWorld';
import { formatTimestamp } from './utils';
import KarelWorld from './KarelWorld';
import SendModal from './SendModal';
import ErrorPage from './ErrorPage';

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

export const _WorldView = withRouter(Radium(({
  world: { wid, text },
  push,
  force,
  pushAll,
  forceAll,
  deleteWorld,
  router,
  users,
  attempts,
  pushModalShowing,
  showPushModal,
  forceModalShowing,
  showForceModal,
  hideModals,
}) => {
  const world = parseWorld(text);
  const makeAttemptViewHandler = (uid, num) => () => {
    router.push(`/admin/users/${uid}/attempts/${wid}/${num}`);
  };
  return (
    <div style={styles.containers.self}>
      <SendModal
        users={users}
        wid={wid}
        send={push}
        hide={hideModals}
        show={pushModalShowing}
        push
      />
      <SendModal
        users={users}
        wid={wid}
        send={force}
        hide={hideModals}
        show={forceModalShowing}
        force
      />
      <div style={styles.containers.topHalf}>
        <div style={styles.containers.titleDesc}>
          <h1>{world.title}</h1>
          <p>{world.desc}</p>
        </div>
        <div style={styles.containers.buttonsKW}>
          <ButtonToolbar style={styles.buttons.self}>
            <ButtonGroup>
              <Button bsStyle="warning" onClick={showPushModal}>Push</Button>
              <Button bsStyle="danger" onClick={showForceModal}>Force</Button>
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
  state = {
    loading: true,
    world: null,
    attempts: null,
    users: null,
    err: null,
    modals: { push: false, force: false },
  };

  fetchData(props) {
    Promise.all([props.api.worldInfo(props.params.wid), props.api.listUsers()])
      .then(([{ world, attempts }, users]) => {
        this.setState({ world, attempts, users, loading: false })
      })
      .catch(err => this.setState({ err, loading: false }));
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!equal(nextProps, this.props)) this.fetchData(nextProps);
  }

  showPushModal() {
    this.setState({ modals: { push: true, force: false } });
  }

  showForceModal() {
    this.setState({ modals: { push: false, force: true } });
  }

  hideModals() {
    this.setState({ modals: { push: false, force: false } });
  }

  render() {
    if (this.state.err) return <ErrorPage err={this.state.err}/>;
    if (this.state.loading) return <h1>Loading...</h1>;
    return <_WorldView
      world={this.state.world}
      attempts={this.state.attempts}
      users={this.state.users}
      push={this.props.api.push}
      force={this.props.api.force}
      pushAll={this.props.api.pushAll}
      forceAll={this.props.api.forceAll}
      deleteWorld={this.props.api.deleteWorld}
      pushModalShowing={this.state.modals.push}
      forceModalShowing={this.state.modals.force}
      showPushModal={::this.showPushModal}
      showForceModal={::this.showForceModal}
      hideModals={::this.hideModals}
    />
  }
}

