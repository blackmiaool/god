const config = require("../config.js");
const socket = window.io(`:${config.serverPort}`);
socket.context = {
    logged: false
};
export default socket;
