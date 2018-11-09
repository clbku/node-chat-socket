import errorHandler from "errorhandler";
import app from "./app";
import SocketIO from "socket.io";
import crypto from  "crypto-js";
import jwt from "jsonwebtoken";



/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

export const io = SocketIO.listen(server);

io.on("connection", function(socket) {
    const rooms = io.sockets.adapter.rooms;
    io.emit("room", rooms);
    socket.on("chat message", function(msg) {
        console.log(socket.rooms);
        io.to(msg.room).emit("chat message", msg);
    });
    socket.on("join room", function(data) {
        // @ts-ignore
        jwt.verify(data.token, "join-secret", function (err) {
            if (err) {
                socket.emit("authenticate", {msg: "Authenticate failed!"});
            }
            else {
                socket.join(data.room);
            }
        });
    });
});

// JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfX3YiOjAsInVwZGF0ZWRBdCI6IjIwMTgtMTEtMDdUMTQ6MDQ6NTkuODE2WiIsImNyZWF0ZWRBdCI6IjIwMTgtMTEtMDdUMTQ6MDQ6NTkuODE2WiIsInVzZXJuYW1lIjoiY29uZ2x5MTMxMSIsInBhc3N3b3JkIjoiJDJhJDEwJFczOS9aRnJuNkd4S0NXMERoaS4zeU93RUEuZE8wNVE2V29UWHVkcEVuNDNRdWU5U25LVmVLIiwiX2lkIjoiNWJlMmYxMGI1MzEyZTUwNjY4NmRiYTYwIn0.1uOci1g6rfbVvxI302tHGLQJLeD2WBbvB5LCvF8fvok
export default server;
