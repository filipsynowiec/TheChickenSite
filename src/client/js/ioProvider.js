const decorateEmitter = function (emitter) {
  return function () {
    const token = localStorage.getItem("token");
    if (token) {
      arguments[1].token = token;
    }
    return emitter.apply(this, arguments);
  };
};
let socket = null
const getIO = function () {
  if (!socket) {
    socket = io();
    socket.emit = decorateEmitter(socket.emit);
  }
  // decorate emit to
  return socket;
};
