const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.cached.Database('db');
const config = require("../config.js");
import {
    errorMap,
    getError,
    successData
} from "../common/error.js";
db.serialize(function () {

    db.run(`CREATE TABLE user (
        Name VARCHAT(32),
        Password TEXT,
        Avatar TEXT,
        Rooms TEXT default '[]',
        PRIMARY KEY (Name)
        );
    `, function (e) {});

    db.run(`CREATE TABLE room (
        Name VARCHAT(32),
        Admin VARCHAT(32),
        Bulletin TEXT default '',
        Avatar TEXT,       
        PRIMARY KEY (Name)
        FOREIGN KEY (Admin) REFERENCES user(Name)
        );
    `, function (e) {});

    db.run(`INSERT INTO room (Name,Bulletin,Avatar) VALUES ($name,$bulletin,$avatar);`, {
        $name: config.firstRoom.name,
        $bulletin: config.firstRoom.bulletin,
        $avatar: config.firstRoom.avatar
    }, function (e) {

    });


    db.all(`SELECT * FROM user;
    `, function (e, data) {});
});
//db.close();
async function login($name, $password) {
    let result;
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.get(`SELECT Name as name,Password as password,Avatar as avatar,Rooms as rooms FROM user WHERE Name=$name;`, {
                $name,
            }, function (e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        reject(true);
                    } else if (result.password === $password) {
                        resolve(result);
                    } else {
                        reject(true);
                    }
                }
            });
        });
    });
    return result;
}
async function getRoomsInfo(rooms) {
    rooms = JSON.parse(JSON.stringify(rooms)) || [];
    let promise = new Promise(function (resolve) {
        resolve();
    });
    rooms.forEach(function (room, i, a) {
        promise = promise.then(function () {
            return new Promise(function (resolve, reject) {
                db.get(`SELECT Name as name,Admin as admin,Avatar as avatar,Bulletin as bulletin FROM room WHERE Name=$name;`, {
                    $name: room
                }, function (e, result) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        result.messages = [];
                        a[i] = result;
                        resolve();
                    }
                });

            })
        });
    });
    await promise;
    return rooms;
}
async function joinRoom($name, $roomName) {
    let result = await new Promise(function (resolve, reject) {
        const p1 = new Promise(function (resolve, reject) {
            db.get(`SELECT Admin as admin FROM room WHERE Name=$roomName;`, {
                $roomName,
            }, function (e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (result && result.admin) {
                        resolve();
                    } else {
                        reject(errorMap[2]);
                    }
                }
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                db.get(`SELECT Rooms as rooms FROM user WHERE Name=$name;`, {
                    $name,
                }, function (e, result) {

                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve(JSON.parse(result.rooms));
                    }
                });
            });
        }).then(function ($rooms) {
            return new Promise(function (resolve, reject) {
                if ($rooms.indexOf($roomName) !== -1) {
                    reject(errorMap[5]);
                    return;
                }
                $rooms.push($roomName);
                db.run(`UPDATE user SET Rooms=$rooms WHERE Name=$name;`, {
                    $name,
                    $rooms: JSON.stringify($rooms),
                }, function (e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        }).then(function () {
            resolve(false);
        }).catch(function (e) {
            console.log("e", e);
            reject(e);
        });
    });

    return result;
}
async function createRoom($name, $roomName) {
    let result = await new Promise(function (resolve, reject) {
        let $rooms;
        const p1 = new Promise(function (resolve, reject) {
            db.run(`INSERT INTO room (Name,Bulletin,Avatar,Admin) VALUES ($roomName,$bulletin,$avatar,$name);`, {
                $roomName,
                $bulletin: `Hello`,
                $avatar: config.roomDefaultAvatar,
                $name,
            }, function (e) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
        p1.then(function () {
            return new Promise(function (resolve, reject) {
                db.get(`SELECT Rooms as rooms FROM user WHERE Name=$name;`, {
                    $name,
                }, function (e, result) {
                    $rooms = JSON.parse(result.rooms);
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                $rooms.push($roomName);
                db.run(`UPDATE user SET Rooms=$rooms WHERE Name=$name;`, {
                    $name,
                    $rooms: JSON.stringify($rooms),
                }, function (e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        }).then(function () {
            resolve(false);
        }).catch(function (e) {
            reject(e);
        });
    });

    return result;
}

async function register($name, $password, $avatar) {
    let result;
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`INSERT INTO user (Name,Password,Rooms,Avatar) VALUES ($name,$password,$rooms,$avatar);`, {
                $name,
                $password,
                $rooms: `["god"]`,
                $avatar,
            }, function (e) {
                if (e) {
                    console.log(e);
                    resolve(e);
                } else {
                    resolve(false);
                }
            });
        });
    });
    return result;
}

export {
    register,
    getRoomsInfo,
    login,
    createRoom,
    joinRoom
}
