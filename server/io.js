import socketioJwt from 'socketio-jwt';

export const setupSocket = socket => {
  socket.emit('pushWorld', DEFAULT_WORLD);
};

export default io => {
  io.on('connection', socket => {
    // We have to get our handler here first for some reason
    socket.on('authenticate', ({ token }) => {
      socket.token = token;
    });
    socketioJwt.authorize({
      secret: Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
      timeout: 15000,
      // Undocumented. We're just using it to fetch the profile before continuing
      additional_auth: (decoded, onSuccess, onError) => {
        getProfile(socket.token)
          .then(profile => socket.profile = profile)
          .then(() => onSuccess())
          .then(() => setupSocket(socket))
          .catch(onError);
      },
    }).call(this, socket);

  })

};

