const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');

const index = require('./routes/index');
const users = require('./routes/users');

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(convert(require('koa-static')(__dirname + '/public')));


app.use(convert(views(__dirname + '/views', {
    extension: 'jade'
})));

// logger
app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

router.use('/', index.routes(), index.allowedMethods());
router.use('/users', users.routes(), users.allowedMethods());

app.use(router.routes(), router.allowedMethods());
// response

app.on('error', function (err, ctx) {
    console.log(err)
    logger.error('server error', err, ctx);
});



const IO = require('koa-socket')

const io = new IO()
io.attach(app)

io.on('join', (ctx, data) => {
    console.log('join event fired', data)
})
io.on('simple', function (ctx, data) {
    console.log("sim", arguments);
});
console.warn({
    a: 1
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
module.exports = app;
