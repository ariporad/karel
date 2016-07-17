import { Modal, Button, Table } from 'react-bootstrap';
import ErrorPage from './ErrorPage';

const styles = {
  avatar: {
    maxHeight: 33,
    marginRight: 8,
  }
}

export const SendModal = ({ wid, show, hide, send, push, force = !push, users }) => {
  if (!push && !force) throw new Error('Either push or force must be true!');
  if (push && force) throw new Error('Both push and force cannot be true!');
  return (
    <Modal show={show} onHide={hide}>
      <Modal.Header closeButton>
        <Modal.Title>{push ? 'Push' : 'Force'} World (WID: {wid})</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered>
          <thead>
            <tr>
              <td>Name</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(users).map(k => users[k]).map(user => (
              <tr>
                <td>
                  <img style={styles.avatar} src={user.profile.picture} />
                  {user.profile.name}
                </td>
                <td>
                  <Button
                    bsStyle={push ? 'warning' : 'danger'}
                    onClick={() => send(wid, user.id)}
                  >
                    {push ? 'Push' : 'Force'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={hide} bsStyle='primary'>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SendModal;
