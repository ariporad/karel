const debug = dbg('karel:admin:App');
const styles = {
  editor: {
    fontFamily: 'monospace',
    width: '100vw',
    height: '90vh',
  },
};

const DEFAULT_TEMPLATE = `
Title
Description (HTML is <b>OK</b> too!)
---
// Blah Blah Blah
defaultCode();
---
. . . .
. K .|.
. 9 .|16
. . .|@

`.trim();

class App extends React.Component {
  constructor () {
    super();
    this.state = { value: DEFAULT_TEMPLATE };
  }

  handleEditorChange(e) {
    this.setState({ value: e.target.value });
  }

  submitState(e) {
    e.preventDefault();
    debug('Submitting world:\n%s', this.state.value);
    this.props.api.createWorld(this.state.value);
  }

  render() {
    return (
      <div>
        <textarea
          style={[styles.editor]}
          value={this.state.value}
          ref='editor'
          onChange={::this.handleEditorChange}
        />
        <br />
        <input type='button' value='Create World' onClick={::this.submitState} />
      </div>
    );
  }
}

export default Radium(App);

