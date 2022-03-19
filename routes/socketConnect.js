/***
 * @author: seaK
 */
'use strict';

const socketIo = require('socket.io');
const Token = require('../utils/token');
const socketHandleService = require('../service/socketHandle');
const logger = require('../utils/loghelper')('server');

// Define global eventType which will be ignore by check the token.
const TOKEN_IGNORE_LIST = 
    [
       'login'
    ];

let socketConnect = {
    io: false
};

socketConnect.init = function (http) {
    try {
        this.io = socketIo(http);
        this.io.set('transports', [ 'websocket' ]);
        this.ioListen();
    } catch (e) {
        logger.info('>>>>>>>>>>>Socket.io INIT ERROR<<<<<<<<<<');
        logger.error(e);
    }
};

socketConnect.ioListen = function () {
    this.io.on('connection', (socket) => {
        socket.on('message', msgHandler.bind(socket));
        socket.on('error', errorHandler.bind(socket));

        // disconnect
        socket.on('disconnect', disconnectHandler.bind(this, socket));
    });
};

/**
 *
 * handle all the token emit by client
 * @author seaK
 * @param token
 * @param socket
 * @param callback
 * @return {Promise.<void>}
 */
async function handleToken(token, socket, callback) {
    let decoded = await Token.decode(token);
    if (decoded.code === '000000' && decoded.payload && decoded.payload.userID) {
        callback && callback(decoded.payload);
        socket.emit('resetToken', {
            retCode: '000000',
            token: Token.updateToken(decoded.payload)
        });
    } else {
        // console.log(decoded);
        logger.info(`Token error, reason： ${decoded}`);
        socket.emit('tokenError', { retCode: '000010', message: 'error token' });
    }
}

function msgHandler(data) {
    logger.info('Message from client: ', data.eventType === 'upload' ? 'upload file' : data);
    let { eventType, parameters } = data;
    let { model } = parameters;


    try {
        let Model = require('../model/' + model + '.js');
        if (Model[eventType]) {
            let socket = this;
            if (TOKEN_IGNORE_LIST.join('--').indexOf(eventType) < 0) {
                handleToken(parameters.token, this, function (result) {
                    Model[eventType](eventType, parameters, socket);
                });
            } else {
                Model[eventType](eventType, parameters, socket);
            }
        } else {
            this.emit('message', { eventType, data: 'Can\'t handle such event.' });
        }
    } catch (error) {
        logger.error('Handle require model error:' + error);
        this.emit('message', {
            eventType,
            data: {
                retCode: '000010',
                retMsg: 'error'
            }
        });
    }
}

function errorHandler(error) {
    logger.error('Socket on error.', error);
}

async function pushHandler(socket) {
    try {
        let token = socket.handshake.headers['cookie'] || '';


        let decoded = await Token.decode(token.substring(token.indexOf('token=') + 6));

        if (decoded.code == '000000' && decoded.payload.userID) {
            socketHandleService.onEnterSubscribePush(socket.id, decoded.payload.userID);
        } else {
            throw new Error('Parse token error.');
        }
    } catch (e) {
        logger.error('Socket.io subscribePush event handler error.', e);
    }
}

async function disconnectHandler(socket) {
    try {
        let token = socket.handshake.headers['cookie'] || '';
        let decoded = await Token.decode(token.substring(6));
        
        if (decoded.code == '000000' && decoded.payload.userID) {
            socketHandleService.disconnectUnsubscribe(socket.id, decoded.payload.userID);
        } else {
            throw new Error('Parse token error. Maybe token is expire.');
        }

    } catch (e) {
        logger.error('Socket.io disconnect event handler error.', e);
    }
}


exports.ioInstance = socketConnect;
