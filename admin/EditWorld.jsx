import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';

class EditWorld extends React.Component {
  state = { text: 'Loading', loading: true }

  handleSubmit(e) {
    e.preventDefault();
    this.props.api.editWorld(this.props.params.wid, this.state.text)
      .then(() => { this.props.router.push(`/admin/worlds/${this.props.params.wid}`) });
  }

  componentDidMount() {
    this.props.api.worldInfo(this.props.params.wid)
      .then(({ world: { text } }) => this.setState({ text, loading: false }));
  }

  render() {
    return (
      <form>
        <FormGroup controlId='createWorld'>
          <ControlLabel>Please Input Your World Using the Standard World Syntax:</ControlLabel>
          <FormControl
            value={this.state.text}
            onChange={e => this.state.loading || this.setState({ text: e.target.value })}
            componentClass='textarea'
            style={{ height: '75vh', fontFamily: 'monospace' }}
          />
        </FormGroup>
        <FormGroup>
          <Button bsStyle="primary" onClick={::this.handleSubmit}>
            Update World
          </Button>
        </FormGroup>
      </form>
    );
  }
};

export default withRouter(Radium(EditWorld));

