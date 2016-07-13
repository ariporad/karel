import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';

const DEFAULT_TEMPLATE = `
Title
Description (HTML is <b>OK</b> too!)
This
Can
Be
Multiline!
---
defaultCode();

this.shouldNot(runWithoutModification());

// You should explain the challenge to them with comments (especially new concepts they haven't seen
// before).
//
// For simplicity, only use // commnets, and always make them the only (and first) thing on a line.
---
. . .|.
. K .|.
. 9 . 16
. . .|@

`.trim();

class CreateWorld extends React.Component {
  state = { text: DEFAULT_TEMPLATE }

  handleSubmit(e) {
    e.preventDefault();
    if (!confirm('Create World?')) return;
    this.props.api.createWorld(this.state.text)
      .then(wid => { debugger; this.props.router.push(`/admin/worlds/${wid}`) });
  }

  render() {
    return (
      <form>
        <FormGroup controlId='createWorld'>
          <ControlLabel>Please Input Your World Using the Standard World Syntax:</ControlLabel>
          <FormControl
            value={this.state.text}
            onChange={e => this.setState({ text: e.target.value })}
            componentClass='textarea'
            style={{ height: '75vh' }}
          />
        </FormGroup>
        <FormGroup>
          <Button bsStyle="primary" onClick={::this.handleSubmit}>
            Create World
          </Button>
        </FormGroup>
      </form>
    );
  }
};

export default withRouter(Radium(CreateWorld));

