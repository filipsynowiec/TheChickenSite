const decorateEmitter = function (emitter) {
  return function () {
    const token = localStorage.getItem("token");
    if (token) {
      arguments[1].token = token;
    }
    return emitter.apply(this, arguments);
  };
};

const getIO = function () {
  const socket = io();
  // decorate emit to
  socket.emit = decorateEmitter(socket.emit);
  return socket;
};
