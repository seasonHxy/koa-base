/***********************************************
 * Purpose: Middleware for http log.
 *
 * @author: Tower.
 * @time: 2017-5-26.
 */

"use strict";
const log4js = require('log4js');
const DEFAULT_FORMAT = ':remote-addr -- :method :url :protocol/:http-version :status :response-time';

/*
    Purpose: Log requests with the given `options`
    @param {Object} logger
    @param {Object} options {level:'auto', nolog:['.image']}
    @return {Function}
    @example
        const app = new Koa();
        const hLogger = require('loghelper')('yourCategory');
        const httpLogMiddleware = require('xx/middleware/httpLogMiddleware');
        app.use(httpLogMiddleware(hLogger, options);

    logger tokens
        - `:remote-addr`
        - `:method`
        - `:url`
        - `:http-version`
        - `:status`
        - `:response-time`
    logger params
        request: {
            :method
            :user-agent
            :body or :query
        }
        response: {
            :status
            :Content-Length
            :return
        }
*/
function httpLogger(logger, options) {
    if (typeof options === 'object') {
        options = options || {}
    } else {
        options = {}
    }

    let nolog = options.nolog ? createNoLogCondition(options.nolog) : null
    // default level if INFO
    let level = log4js.levels.toLevel(options.level, log4js.levels.INFO);
    let fmt = options.format || DEFAULT_FORMAT;
    
    return async (ctx, next) => {
        if (nolog && nolog.test(ctx.originalUrl)) await next();

        // Make sure the level can be logger
        if (logger.isLevelEnabled(level) || options.level === 'auto') {
            let startTime = new Date();
            let writeHead = ctx.response.writeHead;

            await next();
            
            ctx.response.responseTime = new Date() - startTime;
            // status code response level handling
            let a = ctx;
            if (ctx.res.statusCode && options.level === 'auto') {
                if (ctx.res.statusCode >= 300) level = log4js.levels.WARN
                if (ctx.res.statusCode >= 400) level = log4js.levels.ERROR
            }
            if (logger.isLevelEnabled(level)) {
                // TODO arg2 extension customer log content
                let combinedData = formatData(ctx, []);
                let combinedTokens = combinedData['tokens'] ? combinedData['tokens'] : []
                let combinedReq = combinedData['request'] ? combinedData['request'] : {}
                let combinedRes = combinedData['response'] ? combinedData['response'] : {}
                logger.log(level, 
                    `${formatLogLine(fmt, combinedTokens)}\n`,
                    `${formatObjectLine('request', combinedReq)}\n`,
                    `${formatObjectLine('response', combinedRes)}`
                    );
            }
        } else {
            await next(); 
        }
    }
}

/*
    Purpose: format logs token
    @param {Object} ctx
    @return {Array}
*/
function formatData(ctx) {
    let defaultTokens = [];
    let defaultRequest = {};
    let defaultResponse = {};

    // tokens
    defaultTokens.push({token: ':url', value: ctx.originalUrl});
    defaultTokens.push({token: ':protocol', value: ctx.protocol});
    defaultTokens.push({token: ':hostname', value: ctx.hostname});
    defaultTokens.push({token: ':method', value: ctx.method});
    defaultTokens.push({token: ':status', value: ctx.response.status});
    defaultTokens.push({token: ':response-time', value: `${ctx.response.responseTime}ms`});
    defaultTokens.push({token: ':date', value: new Date().toUTCString()});
    defaultTokens.push({token: ':http-version', value: ctx.req.httpVersionMajor + '.' + ctx.req.httpVersionMinor});
    defaultTokens.push({
        token: ':remote-addr',
        value: ctx.headers['x-forwarded-for'] ||
        ctx.ip || ctx.ips ||
        (ctx.socket && (ctx.socket.remoteAddress ||
        (ctx.socket.socket && ctx.socket.socket.remoteAddress)))
    });
    // request
    defaultRequest['method'] = ctx.method;
    defaultRequest['user-agent'] = ctx.headers['user-agent'];
    if (defaultRequest['method'] == 'GET' || defaultRequest['method'] == 'PUT') {
        defaultRequest['query'] = ctx.query;
    }
    if (defaultRequest['method'] == 'POST') {
        defaultRequest['body'] = ctx.request.body;
    }
    // response
    defaultResponse['status'] = ctx.response.status;
    defaultResponse['Content-Length'] = (ctx.response._headers && ctx.response._headers['content-length']) ||
        ctx.response.length || '-'
    defaultResponse['return'] = ctx.body || null

    return {
        tokens: defaultTokens,
        request: defaultRequest,
        response: defaultResponse
    }
}

/*
    Purpose: return formatted log line
    @param  {String} str
    @return {String}
*/
function formatLogLine(str, tokens) {
    for (let i = 0; i < tokens.length; i++) {
        str = str.replace(tokens[i].token, tokens[i].value)
    }
    return str;
}

/*
    Purpose: return formatted Object line
    @param  {String} tag
    @param  {Object} obj
    @return {String}
*/
function formatObjectLine(tag, obj) {
    let str = '';
    str += `${tag}: {\n`
    for (let i in obj) {
        str += `    ${JSON.stringify(i)}: ${JSON.stringify(obj[i])},\n`
    }
    str += '}'
    return str;
}

/*
    Purpose: return RegExp Object about nolog
    @param {String} nolog
    @return {RegExp}

    syntax
    1.String
        ".image" or ".image|.jpg" or ".(image|jpg|png)"
    2.RegExp
        /\.(gif|jpe?g|png)$/
    3.Array
        [".jpg$", ".png", ".gif"]

*/
function createNoLogCondition(nolog) {
    let regexp = null;
    if (nolog) {
        if (nolog instanceof RegExp) {
            regexp = nolog;
        }
        if (typeof nolog === 'string' && nolog.trim() !== '') {
            regexp = new RegExp(nolog);
        }
        if (Array.isArray(nolog) && nolog.length>0) {
            let regexpsStrings = nolog.map(n=>n);
            regexp = new RegExp(regexpsStrings.join('|'));
        }
    }
    return regexp;
}

module.exports = httpLogger;
