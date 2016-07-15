import { FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { withRouter } from 'react-router';
import ErrorPage from './ErrorPage';

class EditWorld extends React.Component {
  state = { text: 'Loading', loading: true, err: null }

  handleSubmit(e) {
    e.preventDefault();
    this.props.api.editWorld(this.props.params.wid, this.state.text)
      .then(() => { this.props.router.push(`/admin/worlds/${this.props.params.wid}`) })
      .catch(err => this.setState({ err }));
  }

  fetchData() {
    this.props.api.worldInfo(this.props.params.wid)
      .then(({ world: { text } }) => this.setState({ text, loading: false }))
      .catch(err => this.setState({ err }));
  }

  render() {
    if (this.state.err) return <ErrorPage err={this.state.err}/>;
    return (
      <form>
        <Alert bsStyle="warning">
          <strong>Warning:</strong> If you change a world too much, you can change (or even break)
          attempts that have already been suggested! (ex. adding a wall might cause a crash, or
          adding a bomb might convert a previously sucessful attempt into a failure).
          <br />
          <br />
          <strong>You have been warned.</strong>
        </Alert>
        <FormGroup controlId='createWorld'>
          <ControlLabel>Please Input Your World Using the Standard World Syntax:</ControlLabel>
          <FormControl
            value={this.state.text}
            onChange={e => this.state.loading || this.setState({ text: e.target.value })}
            componentClass='textarea'
            style={{ height: '59vh', fontFamily: 'monospace' }}
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

