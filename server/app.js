const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const views = require('koa-views');
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');

const index = require('./routes/index');
const users = require('./routes/users');
const db = require('./db.js');
const router = new Router();
const socket = require("./socket");
const config = require("../config.js");

import {
    registerCheck
} from "../common/check.js";
// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(convert(require('koa-static')(__dirname + '/public')));


app.use(convert(views(__dirname + '/views', {
    extension: 'jade'
})));



router.post('/login', async(ctx, next) => {
    const name = ctx.request.body.name;
    const password = ctx.request.body.password;
    const checkResult = registerCheck("server", name, password);
    if (checkResult) {
        checkResult.code = 1;
        ctx.body = checkResult;
    } else {
        const result = await db.login(name, password);
        if (!result) {
            ctx.body = {
                code: 0,
                msg: "ok",
                data: {
                    name: name,
                    avatar: "/static/img/avatar.gif",
                    rooms: []
                }
            }
        } else if (result === true) {
            ctx.body = {
                code: 3,
                msg: "Wrong password",
            }
        } else {
            ctx.body = {
                code: 2,
                msg: "Fail to access db",
            }

        }
    }

    ctx.status = 200;
});
router.post('/register', async(ctx, next) => {
    const name = ctx.request.body.name;
    const password = ctx.request.body.password;
    const checkResult = registerCheck("server", name, password);
    if (checkResult) {
        checkResult.code = 1;
        ctx.body = checkResult;
    } else {
        const result = await db.register(name, password);
        if (!result) {
            ctx.body = {
                code: 0,
                msg: "ok",
            }
        } else {
            if (result.code === 'SQLITE_CONSTRAINT') {
                ctx.body = {
                    code: 3,
                    key: "name",
                    msg: "Username exists",
                }
            } else {
                ctx.body = {
                    code: 2,
                    msg: "Fail to write into db",
                }
            }

        }
    }

    ctx.status = 200;
});
app.use(async(ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    await next();
});

app.use(router.routes())
    .use(router.allowedMethods());
// response

app.on('error', function (err, ctx) {
    console.log(err)
    logger.error('server error', err, ctx);
});


console.log((new Date()).toLocaleTimeString());
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
socket.init(io);
server.listen(config.serverPort);
module.exports = app;