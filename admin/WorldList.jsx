import { Table, ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';

const styles = {
  table: {
    tableLayout: 'fixed',
    border: '1px solid #dddddd',
  }, title: {
    display: 'inline',
    verticalAlign: 'center',
  },
  td: {
    actions: {
      whiteSpace: 'nowrap',
      width: 235,
    },
    title: {
    },
    id: {
      whiteSpace: 'nowrap',
      width: 30,
      textAlign: 'center',
    },
  },
}

export const _WorldList = withRouter(Radium(({ worlds, router, pushAll, forceAll }) => {
  const trs = worlds.map((world, i) => (
    <tr key={i}>
      <td style={styles.td.id}>{world.wid}</td>
      {/* Cheat title extraction */}
      <td style={styles.td.title}>
        <h3 style={styles.title}>{world.text.trim().split('\n')[0]}</h3>
      </td>
      <td style={styles.td.actions}>
        <ButtonToolbar className='pull-right'>
          <ButtonGroup>
            <Button bsStyle="warning" onClick={() => pushAll(world.wid)}>Push All</Button>
            <Button
              bsStyle="danger"
              onClick={() => {
                confirm('You\'d like to force this world to everyone?') && forceAll(world.wid)
              }}
            >Force All</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button bsStyle="link" onClick={() => router.push(`/admin/worlds/${world.wid}`)}>
              View
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </td>
    </tr>
  ));

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 20, width: '100%' }}>
        <h2 style={{ margin: 0 }}>Worlds</h2>
        <div style={{ marginLeft: 'auto' }}>
          <Button bsStyle="primary">Create World</Button>
        </div>
      </div>
      <Table style={styles.table} striped>
        <thead>
          <tr>
            <td style={styles.td.id}>ID</td>
            <td style={styles.td.title}>Title</td>
            <td style={styles.td.actions}>Actions</td>
          </tr>
        </thead>
        <tbody>{trs}</tbody>
      </Table>
    </div>
  );
}));

export default class WorldList extends React.Component {
  state = { worlds: [], loading: true };

  componentDidMount() {
    this.props.api.listWorlds().then(worlds => {
      worlds = Object.keys(worlds).map(key => worlds[key]);
      this.setState({ worlds, loading: false })
    });
  }

  render() {
    if (this.loading) return <h1>Loading...</h1>;
    return <_WorldList
      worlds={this.state.worlds}
      pushAll={this.props.api.pushAll}
      forceAll={this.props.api.forceAll}
    />;
  }
};

