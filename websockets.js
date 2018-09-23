var sock = null;

const emitEvent = (data) => {
  if (sock && data && data.event) {
    sock.emit('event:new', data);
  }
};

const start = (io) => {
  io.on('connection', (socket) => {
    sock = socket;
    sock.on('hey', (data) => { sock.emit('hoy', data); });
    console.log('Websocket client connected');
  });
};

module.exports = {
  start: start,
  emitEvent: emitEvent
};
