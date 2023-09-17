import { createConnection } from "typeorm";
import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as indexRouter from "./routes/index";
import * as secureRouter from "./routes/secure";
import * as callrouter from "./routes/call";
import * as vcrouter from "./routes/video-call-api";
const { Server } = require("socket.io");

createConnection().then(() => {
    const app = express();
    const port = 3000;
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'relier-front/build/')));
    app.use('/api', indexRouter);
    app.use('/api/secure', secureRouter);
    app.use('/api/video', vcrouter);
    app.use('/api/vc', callrouter);
    app.set('port', port);
    app.get('/:any', function (req, res) {
        res.sendFile(path.join(__dirname, 'relier-front/build', 'index.html'));
    });
    app.get('/home/:teamSecret', function (req, res) {
        res.sendFile(path.join(__dirname, 'relier-front/build', 'index.html'));
    });
    app.get('/vc/:sid', function (req, res) {
        res.sendFile(path.join(__dirname, 'relier-front/build', 'index.html'));
    });
    app.get('/team/:secret', function (req, res) {
        res.sendFile(path.join(__dirname, 'relier-front/build', 'index.html'));
    });
    const server = http.createServer(app);
    const io = new Server(server);
    server.listen(port);
    io.on("connection", (socket) => {
        socket.on("subscribe", function (room) {
            socket.join(room);
        });

        socket.on("unsubscribe", function (room) {
            socket.leave(room);
        });

        socket.on("send", function (data) {
            io.sockets.in(data.room).emit("message", data);
        });
    });
});
