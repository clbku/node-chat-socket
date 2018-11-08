"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const errorhandler_1 = __importDefault(require("errorhandler"));
const app_1 = __importDefault(require("./app"));
const socket_io_1 = __importDefault(require("socket.io"));
/**
 * Error Handler. Provides full stack - remove for production
 */
app_1.default.use(errorhandler_1.default());
/**
 * Start Express server.
 */
const server = app_1.default.listen(app_1.default.get("port"), () => {
    console.log("  App is running at http://localhost:%d in %s mode", app_1.default.get("port"), app_1.default.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
exports.io = socket_io_1.default.listen(server);
exports.io.on("connection", function (socket) {
    socket.on("chat message", function (msg) {
        console.log(socket.rooms);
        exports.io.to(msg.room).emit("chat message", msg);
    });
    socket.on("join room", function (room) {
        socket.join(room.room);
    });
    socket.on("create room", function (room) {
        socket.join(room.room);
        const rooms = exports.io.sockets.adapter.rooms;
        exports.io.emit("room", rooms);
    });
});
// JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfX3YiOjAsInVwZGF0ZWRBdCI6IjIwMTgtMTEtMDdUMTQ6MDQ6NTkuODE2WiIsImNyZWF0ZWRBdCI6IjIwMTgtMTEtMDdUMTQ6MDQ6NTkuODE2WiIsInVzZXJuYW1lIjoiY29uZ2x5MTMxMSIsInBhc3N3b3JkIjoiJDJhJDEwJFczOS9aRnJuNkd4S0NXMERoaS4zeU93RUEuZE8wNVE2V29UWHVkcEVuNDNRdWU5U25LVmVLIiwiX2lkIjoiNWJlMmYxMGI1MzEyZTUwNjY4NmRiYTYwIn0.1uOci1g6rfbVvxI302tHGLQJLeD2WBbvB5LCvF8fvok
exports.default = server;
//# sourceMappingURL=server.js.map