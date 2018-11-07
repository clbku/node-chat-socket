import errorHandler from "errorhandler";
import app from "./app";
import SocketIO from "socket.io";



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

const io = SocketIO.listen(server);
io.on("connection", function(socket) {
    socket.on("chat message", function(msg) {
        console.log(msg.sender + ": " + msg.msg);
        io.emit("chat message", {sender: msg.sender, msg: msg.msg});
    });
});



// JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfX3YiOjAsInVwZGF0ZWRBdCI6IjIwMTgtMTEtMDdUMTQ6MDQ6NTkuODE2WiIsImNyZWF0ZWRBdCI6IjIwMTgtMTEtMDdUMTQ6MDQ6NTkuODE2WiIsInVzZXJuYW1lIjoiY29uZ2x5MTMxMSIsInBhc3N3b3JkIjoiJDJhJDEwJFczOS9aRnJuNkd4S0NXMERoaS4zeU93RUEuZE8wNVE2V29UWHVkcEVuNDNRdWU5U25LVmVLIiwiX2lkIjoiNWJlMmYxMGI1MzEyZTUwNjY4NmRiYTYwIn0.1uOci1g6rfbVvxI302tHGLQJLeD2WBbvB5LCvF8fvok
export default server;
