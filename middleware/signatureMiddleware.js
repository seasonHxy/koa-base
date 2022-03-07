/***********************************************
 * Purpose: Middleware for api signature verification.
 *
 * @author: SeaK.
 */
"use strict";

/********签名加密规则*********
 * @param：公匙key生产过程 crypto.createHash('md5').update(appId, 'utf-8').digest('hex')
 * @param: SerialNo 16位随机字符串
 * @param：Timestamp 10位时间戳
 * @param：AppID appId (开发环境：WPT-dev, 测试环境：WPT-test, 生产环境：WPT-production)
 * @param: Signature 签名结果   签名生产过程 crypto.createHmac('sha1', key).update(AppID+SerialNo+Timestamp, 'utf-8').digest('hex')
 */

const crypto = require('crypto');
const logger = require('../utils/loghelper')('server');
const apiKey = require('../config').apiKey;

module.exports = async (context, next) => {

    function handleErr(errParam) {
        context.body = { retCode: '000900', retMsg: `Missing or invalid signature param: ${errParam}.` };
    }

    let method = context.method;
    let params = null;
    let calculateSignature = null;
    if (method == 'GET' || method == 'PUT') {
        params = context.query;
    }
    if (method == 'POST') {
        params = context.request.body;
    }

    let appId = params.AppID;
    if (!appId || appId.trim() == '') {
        return handleErr('AppID');
    }
    if ('WPT-dev' == appId) {
        return await next();
    }

    let timestamp = params.Timestamp;
    if (!timestamp || timestamp.trim() == '') {
        return handleErr('Timestamp');
    }

    let serialNo = params.SerialNo;
    if (!serialNo || serialNo.trim() == '') {
        return handleErr('SerialNo');
    }

    let signature = params.Signature;
    if (!signature || signature.trim() == '') {
        return handleErr('Signature');
    }

    try {
        if (!apiKey || apiKey.trim() == '') {
            throw new Error('Invalid config param apiKey.');
        }
        let sourceStr = appId + serialNo + timestamp;
        calculateSignature = crypto.createHmac('sha1', apiKey).update(sourceStr, 'utf-8').digest().toString('base64');
        // 将传输过程中转移的'+'复原 (传输中会将 + 转译成 空格)
        signature = signature.replace(/\s+/g, '+');
    } catch(e) {
        logger.error('Server calculate signature error.', e);
        return context.body = { retCode: '000902', retMsg: 'Server calculate signature error.'}
    }

    if (calculateSignature == signature) {
        await next();
    } else {
        context.body = { retCode: '000901', retMsg: 'Invalid signature.' };
    }

}