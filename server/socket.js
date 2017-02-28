import {
    registerCheck
} from "../common/check.js";
import {
    errorMap,
    getError,
    successData
} from "../common/error.js";
const md5 = require('md5');
const db = require('./db.js');
const roomMap = {};
const fs = require('fs');
const config = require("../config.js");
const uaParser = require('ua-parser-js');

function getSyncData(socket) {
    return {
        avatar: socket.context.avatar,
        rooms: socket.context.rooms,
        name: socket.context.name + ""
    }
}

function isEmptyObject(a) {
    for (var i in a) {
        return false;
    }
    return true;
}

function syncRoom(socket, roomName) {

}

function getMembers(roomName) {
    const ret = {};
    const room = roomMap[roomName];

    for (const name in room) {
        const user = room[name];
        ret[name] = {
            avatar: user.avatar,
            name,
            clients: user.clients.map(function (v) {
                return {
                    os: v.os
                };
            })
        };

    }
    return ret;
}

function syncMembers(roomName, exception) {
    for (const name in roomMap[roomName]) {
        const member = roomMap[roomName][name];

        member.clients.forEach(function (client) {
            client.socket.emit("sync-members", {
                name: roomName,
                members: getMembers(roomName)
            });
        });


    }
}

function broadcaseMessage(roomName, message) {
    for (const name in roomMap[roomName]) {
        const member = roomMap[roomName][name];
        member.clients.forEach(function (client) {
            client.socket.send(message);
        });
    }
}
const userMap = {}
class User {
    constructor(name, avatar) {
        Object.assign(this, {
            avatar,
            name,
            clients: []
        });
    }
    connectClient(socket, info) {
        const item = {
            socket
        };
        for (const i in info) {
            Object.assign(item, info);
        }
        this.clients.push(item);
    }
    disconnectClient(socket) {
        this.clients.some(function (item, i, arr) {
            if (item.socket === socket) {
                arr.splice(i, 1);
                return true;
            }
        });
        if (!this.clients.length) {
            this.rooms.forEach((room) => {
                if (!roomMap[room.name]) {
                    return;
                }
                delete roomMap[room.name][this.name];
                if (isEmptyObject(roomMap[room.name])) {
                    delete roomMap[room.name];
                } else {
                    syncMembers(room.name);
                }
            });
            delete userMap[this.name];
        } else {
            this.rooms.forEach((room) => {

                syncMembers(room.name);

            });
        }
    }
    static addUser(name, avatar) {
        if (!userMap[name]) {
            userMap[name] = new User(name, avatar);
        }
        return userMap[name];
    }
    static getUser(name) {
        return userMap[name];
    }
    static getAvatar(name) {
        return userMap[name] && userMap[name].avatar;
    }
    joinRoom(roomName) {
        if (!roomMap[roomName]) {
            roomMap[roomName] = {};
        }
        roomMap[roomName][this.name] = this;
    }
}

function init(io) {
    io.on('connection', function (socket) {
        socket.context = {};
        socket.on('message', function ({
            room: roomName,
            type,
            content
        }, cb) {
            if (!socket.context.name) {
                cb(errorMap[13]);
            }
            let originalName;
            if (typeof content === "object" && (type === "image" || type === "file")) {
                console.log("aa")
                originalName = content.name || '';
                content = content.data;
            }

            if (type === "image") {
                if (content.match(/^data:/)) {

                } else {

                }
            }
            if (type === "file") {
                if (content.length > 300e6) { //300M
                    cb(errorMap[15]);
                    return;
                }
            } else {
                if (content.length > 1e6) {
                    cb(errorMap[15]);
                    return;
                }
            }

            if (type === "text" && content.length > 300) {
                cb(errorMap[15]);
                return;
            }
            if (!roomMap[roomName] || !roomMap[roomName][socket.context.name]) {
                cb(errorMap[7]);
                return;
            }
            if (type === "image" || type === "file") {
                if (content.match(/^data:/)) {
                    let suffix = (originalName.match(/(\w+)$/) || [])[1];

                    if (!suffix) {
                        suffix = "";
                    }
                    let fingerprint;
                    if (content.length < 5e6) {
                        fingerprint = md5(content);
                    } else {
                        fingerprint = parseInt(Date.now());
                    }

                    content = content.replace(/^data:\w*\/?[\w\-+]*;base64,/, "");
                    const buff = Buffer.from(content, 'base64');

                    let dir;
                    let fileFullName;
                    let localPath;
                    if (type === 'image') {
                        dir = "images/";
                        fileFullName = `${fingerprint}.${suffix}`;

                    } else {
                        dir = "files/";
                        fileFullName = `${Date.now()+'-'+originalName}`;
                    }
                    localPath = dir + fileFullName;
                    fs.writeFile('public/' + localPath, buff, function () {
                        if (type === "image") {
                            send({
                                content: {
                                    data: `//${config.domain}:${config.serverPort}/${localPath}`
                                }
                            });
                        } else {
                            send({
                                content: {
                                    name: originalName,
                                    data: `//${config.domain}:${config.serverPort}/getFile?name=${fileFullName}`
                                }
                            });
                        }

                    });
                    return;
                } else if (content.length > 1e3) {
                    cb(errorMap[16]);
                    return;
                }
            }
            send();

            function send(extra) {
                const message = {
                    room: roomName,
                    type,
                    content,
                    name: socket.context.name,
                    avatar: socket.context.avatar,
                    time: Date.now()
                };


                for (const i in extra) {
                    message[i] = extra[i];
                }
                broadcaseMessage(roomName, message);
                if (typeof message.content === "object") {
                    message.content = JSON.stringify(message.content);
                }

                db.saveMessage(message.name, roomName, new Date(), message.type, message.content);

            }

        });

        socket.on('get-room', function ({
            name: roomName,
        }, cb) {
            if (!socket.context.name) {
                cb(errorMap[13]);
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
            }
            db.getRoomsInfo([roomName]).then(function (rooms) {
                rooms.forEach(function (room) {
                    room.members = getMembers(room.name);
                });

                cb(successData(rooms[0]));
            });
        });

        socket.on('create-room', function ({
            name: roomName,
        }, cb) {
            if (!socket.context.name) {
                cb(errorMap[13]);
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
            }
            db.createRoom(socket.context.name, roomName).then(function (result) {
                user.joinRoom(roomName);
                cb(errorMap[0]);
            }).catch(function (result) {
                console.log("result", result);
                if (result.code === 'SQLITE_CONSTRAINT') {
                    cb(errorMap[7]);
                } else {

                    cb(errorMap[1]);
                }
            });
        });
        socket.on('join-room', function ({
            name: roomName,
        }, cb) {
            if (!socket.context.name) {
                cb(errorMap[13]);
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
            }
            db.joinRoom(socket.context.name, roomName).then(function (result) {
                user.joinRoom(roomName);
                syncMembers(roomName);
                cb(errorMap[0]);
            }).catch(function (result) {
                console.log("result", result);
                if (typeof result.code === "number") {
                    cb(result);
                } else {

                    cb(errorMap[1]);
                }
            });
        });
        socket.on('disconnect', function () {
            if (!socket.context.name) {
                return;
            }
            user.disconnectClient(socket);
        });
        let user;
        socket.on('login', (data, cb) => {
            const checkResult = registerCheck("server", data.name, data.password);
            //            console.log(data.name, socket.handshake.headers['user-agent'])


            if (checkResult) {
                checkResult.code = 1;
                cb(checkResult);
                return;
            }
            db.login(data.name, data.password).then(function (result) {

                if (socket.context.name) { //already logged in 
                    const user = User.getUser(socket.context.name);
                    user.disconnectClient(socket);
                }

                user = User.addUser(result.name, result.avatar);

                const ua = uaParser(socket.handshake.headers['user-agent']);
                user.connectClient(socket, {
                    os: ua.os.name
                });

                db.getRoomsInfo(JSON.parse(result.rooms)).then(function (rooms) {
                    user.rooms = rooms;
                    for (const i in result) {
                        socket.context[i] = result[i];
                    }
                    rooms.forEach(function (room) {
                        user.joinRoom(room.name);
                        console.log(room.name);
                        syncMembers(room.name);
                        room.members = getMembers(room.name);
                    });
                    cb(successData({
                        name: user.name,
                        avatar: user.avatar,
                        rooms
                    }));
                });
                //                result.rooms = db.getRoomsInfo(result.rooms);



            }).catch(function (result) {

                let ret;
                console.log(result);
                if (result === true) {
                    ret = getError(6);
                    ret.key = "password";
                } else {
                    ret = errorMap[1];
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
