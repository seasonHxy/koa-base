const Koa = require('koa');
let baseInit = require('./main/baseInit.js');
exports.init = function() {
    return baseInit.init().then(function(){

        const App = new Koa();
        let koaInit = require('./main/koaInit.js');
        koaInit(App);
        return Promise.resolve(App);
    });
}