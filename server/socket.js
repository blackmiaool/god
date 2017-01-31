import {
    registerCheck
} from "../common/check.js";
const db = require('./db.js');
const roomMap = {};

function getSyncData(socket) {
    return {
        avatar: socket.context.avatar,
        rooms: socket.context.rooms,
        name: socket.context.name + ""
    }
}

function syncUserInfo(socket) {
    socket.emit("sync", {
        avatar: socket.context.avatar || "/static/img/avatar.gif",
        rooms: socket.context.rooms,
        name: socket.context.name
    });
}

function isEmptyObject(a) {
    for (var i in a) {
        return false;
    }
    return true;
}

function syncMembers(roomName, userName) {
    console.log("sync-members");
    for (const name in roomMap[roomName]) {
        const member = roomMap[roomName][name];
        if (member.name !== userName) {
            member.socket.emit("sync-members", {
                name: roomName,
                members: roomMap[roomName]
            });
        }
    }
}

function broadcaseMessage(roomName, message) {
    for (const name in roomMap[roomName]) {
        const member = roomMap[roomName][name];
        member.socket.send(message);
    }
}

function init(io) {
    io.on('connection', function (socket) {
        socket.context = {};
        socket.on('message', function ({
            room: roomName,
            type,
            content
        }) {
            if (!socket.context.name) {
                return;
            }
            if (!roomMap[roomName] || !roomMap[roomName][socket.context.name]) {
                return;
            }
            console.log('roomName', roomName)
            broadcaseMessage(roomName, {
                room: roomName,
                type,
                content,
                name: socket.context.name,
                avatar: socket.context.avatar,
                time: Date.now()
            });
        });
        socket.on('disconnect', function () {
            if (!socket.context.name) {
                return;
            }
            socket.context.rooms.forEach(function (room) {
                delete roomMap[room.name][socket.context.name];
                if (isEmptyObject(roomMap[room.name])) {
                    delete roomMap[room.name];
                } else {
                    syncMembers(room.name, socket.context.name);
                }
            });
        });
        socket.on('login', (data, cb) => {
            let ret;
            const checkResult = registerCheck("server", data.name, data.password);
            if (checkResult) {
                checkResult.code = 1;
                ret = checkResult;
                cb(ret);
                return;
            }
            db.login(data.name, data.password).then(function (result) {
                db.getRoomsInfo(JSON.parse(result.rooms)).then(function (rooms) {
                    result.rooms = rooms;
                    result.rooms.forEach(function (room) {
                        if (!roomMap[room.name]) {
                            roomMap[room.name] = {};
                        }
                        roomMap[room.name][result.name] = {
                            name: result.name,
                            avatar: result.avatar
                        };
                        Object.defineProperty(roomMap[room.name][result.name], 'socket', {
                            enumerable: false,
                            value: socket
                        });
                        syncMembers(room.name, result.name);
                        room.members = roomMap[room.name];
                    });
                    for (const i in result) {
                        socket.context[i] = result[i];
                    }
                    cb({
                        code: 0,
                        msg: "ok",
                        data: getSyncData(socket)
                    });
                });
                //                result.rooms = db.getRoomsInfo(result.rooms);



            }).catch(function (result) {

                console.log(result);
                if (result === true) {
                    ret = {
                        code: 2,
                        key: "password",
                        msg: "Wrong password or wrong nickname"
                    }
                } else {
                    ret = {
                        code: 3,
                        msg: "DB error"
                    }
                }
                cb(ret);
            });
        })

    });

    io.on('join', (ctx, data) => {
        console.log('join event fired', data)
    })
    io.on('simple', function (ctx, data) {
        console.log("sim", arguments);
    });

    io.on('god-message', function (ctx, data) {
        console.log("god-message", ctx, data);
        if (crSocket)
            crSocket.emit("message", {
                data
            });
    });
    let crSocket;
    io.on('cr-register', function (ctx, data) {
        console.log("cr-register");
        crSocket = ctx.socket;
    });
    io.on('cr-message', function (ctx, data) {
        console.log("cr-message", ctx, data);
        crSocket = ctx.socket;
        crSocket.broadcast("cr-message", data);
    });
}
module.exports = {
    init
}