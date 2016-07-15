const styles = {
  container: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    height: window.innerHeight - 72, // Navbar
    margin: 0,
    textAlign: 'center',
  },
};

const ErrorPage = ({ err: { message = 'That\'s an error.', status = 500 } }) => {
  return (
    <div style={styles.container}>
      <h1>{status}</h1>
      <h2>{message}</h2>
    </div>
  );
};

export default ErrorPage;

