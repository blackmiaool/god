const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.cached.Database('db');
const config = require("../config.js");

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
    `, function (e, data) {
        console.log(data)
    });
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
    rooms = JSON.parse(JSON.stringify(rooms));
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
async function register($name, $password) {
    let result;
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`INSERT INTO user (Name,Password,Rooms) VALUES ($name,$password,$rooms);`, {
                $name,
                $password,
                $rooms: `["god"]`
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
    login
}