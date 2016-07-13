import { withRouter } from 'react-router';
import { Navbar, NavItem, Nav } from 'react-bootstrap';

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

/*
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
*/

const App = ({ children, location, router }) => {
  const navs = [['/admin/worlds', 'Worlds'], ['/admin/users', 'Users']].map(([path, title]) => (
    <NavItem eventKey={path} key={path} onClick={() => router.push(path)}>{title}</NavItem>
  ));
  return (
    <div className="container-fluid" style={{ width: '100%', height: '100%' }}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='#'>Karel Admin</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav activeKey={location.pathname.replace(/\/$/i, '')}>
            {navs}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {children}
    </div>
  );
};

export default withRouter(Radium(App));

