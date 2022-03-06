/*********************************************************************
 * Server app, build with koa2, interact with client via socket.io
 * *******************************************************************
 * @author: seaK.
 */

'use strict';

const conf    = require( '../config' );
const logger  = require('../utils/loghelper')('server');
const hLogger  = require('../utils/loghelper')('http');
const httpLogMiddleware = require('../middleware/httpLogMiddleware');
const signatureMiddleware = require('../middleware/signatureMiddleware'); 
const bodyparser = require('koa-bodyparser')();
const router  = require('koa-router')();
const convert = require( 'koa-convert' );
const serve   = require( 'koa-static' );

const request = require( 'request' );
const URL     = require('../utils/url');
const api     = require('../routes/api');
const Token   = require('../utils/token');

module.exports = function(app) {
    app.use( convert( serve( '../public' ) ) );
    app.use(convert(bodyparser));
    // http request log middleware
    app.use(httpLogMiddleware(hLogger, {level: 'auto'}));

    app.on('error',function(err,ctx){  
        logger.error('server error',err,ctx);  
    });

    app.use(async (ctx, next) => {
        if( /^\/image\/.*/.test( ctx.url ) ) {
            let t = ctx.cookies.get('token');
            let decoded = await Token.decode(t);
            if (decoded.code === '000000') {
                let id = ctx.url.replace('/image/', '');
                let operator = decoded.payload.userID;
                let path = `${URL.IMG_DOWNLOAD}?id=${id}&operator=${operator}`;
                ctx.body = request.get({ url: path, });
            }
        }
        await next();
    });

    // Http api route middleware

    router.use('/api', signatureMiddleware, api.routes(), api.allowedMethods());
    app.use(router.routes(), router.allowedMethods());
    //To catch uncaught exception.
    process.on('uncaughtException', err => {
        logger.error(err);
    });

    //To catch unhandled rejection
    process.on('unhandledRejection', err => {
        logger.error(err);
    });
};


