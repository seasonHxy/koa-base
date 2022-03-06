/***
 * @author: seaK
 */
const interfaces = require('os').networkInterfaces();
const SERIAL_NUMBER = 'I00002';

const util = {
    getClientIP: socket => socket.handshake.address,    // socket.request.connection.remoteAddress

    set: function (alias, ori, obj) {
        let j, len1, name, nm, nms, temp;
        if (!alias)
            return;
        if (!ori)
            return ori;
        nms = alias.split(".");
        name = nms.pop();
        temp = ori;
        for (j = 0, len1 = nms.length; j < len1; j++) {
            nm = nms[j];
            if (!temp[nm]) {
                temp[nm] = {};
            }
            temp = temp[nm];
        }
        temp[name] = obj;
        return obj;
    },
    get: function (alias, ori) {
        let j, len1, nm, nms, obj;
        if (!alias)
            return;
        if (!ori)
            return ori;
        nms = alias.split(".");
        obj = ori;
        for (j = 0, len1 = nms.length; j < len1; j++) {
            nm = nms[j];
            obj = obj[nm];
            if (obj) {
                continue;
            }
            return obj;
        }
        return obj;
    },
    isFunction: function (value) {
        return Object.prototype.toString.call(value) === "[object Function]";
    },
    // ?1=one&2=two
    urlParams: function (params) {
        let str = '';
        if (params && Object.keys(params).length > 0) {
            str += '?'
            for (let i in params) {
                str += `${i}=${params[i]}&`;
            }
        }
        return str.substring(0, str.length - 1)
    },

    generateSerial() {
        var Rand = Math.random();
        var numb = 10000 + Math.round(Rand * 100000);
        var str = SERIAL_NUMBER + new Date().toLocaleDateString().replace(/-/g, '').replace(/\//g, '') + numb;
        return str;
    },

    // 获取服务器ip
    getIPAdress() {
        for (let devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    },
}

module.exports = util;