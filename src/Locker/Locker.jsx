import { connect } from 'react-redux';

const styles = {
  overlay: {
    // Child
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eeeeee',
    zIndex: 99999,

    // Parent
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const Locker = ({ locked }) => {
  if (!locked) return null;
  return (
    <div style={styles.overlay}>
      <h1>Please look up</h1>
    </div>
  );
};

export default connect(({ Locker: { locked } }) => ({ locked }))(Locker);

