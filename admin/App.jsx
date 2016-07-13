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

const App = ({ children, location, router }) => {
  const navs = [
    ['/admin/worlds', 'Worlds'],
    ['/admin/users', 'Users'],
    ['/admin/worlds/create', 'Create World'],
  ].map(([path, title]) => (
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

