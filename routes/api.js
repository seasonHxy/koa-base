/****************************************************************
 * Purpose: http api router handle.
 *
 * @author: Seas.
 */
 'use strict';

 const _ = require('lodash');
 const logger   = require('../utils/loghelper')('server');
 const router   = require('koa-router')();
 
 // 推送数据接口
 router.post('/outer/syncInfo', async (ctx, next) => {
     let params = ctx.request.body;
 
     if (!params.client || !_.isObject(params.client)) {
         return ctx.body = { retCode: '000002', retMsg: 'Missing or invalid parameter: client.' };
     }
     if (!params.client.identityId || !_.isString(params.client.identityId) || params.client.identityId.trim() == '') {
         return ctx.body = { retCode: '000002', retMsg: 'Missing or invalid parameter: client.identityId.' };
     }
     if (!params.client.name || !_.isString(params.client.name) || params.client.name.trim() == '') {
         return ctx.body = { retCode: '000002', retMsg: 'Missing or invalid parameter: client.name.' };
     }
     if (!params.client.sex || !_.isString(params.client.sex) || params.client.sex.trim() == '') {
         return ctx.body = { retCode: '000002', retMsg: 'Missing or invalid parameter: client.sex.' };
     }
     if (!params.client.nation || !_.isString(params.client.nation) || params.client.nation.trim() == '') {
         return ctx.body = { retCode: '000002', retMsg: 'Missing or invalid parameter: client.nation.' };
     }
 
 
     const reqParams = _.pick(params, [ 'client' ]);
 
     try {
         // request start
         // request end

         ctx.body = { retCode: '000000', rstMsg: 'success' };
     } catch (e) {
         logger.error('API -- Post sync info error. ', e);
         ctx.body = { retCode: '000001', rstMsg: 'System error.' };
     }
 });
 
 
 
 module.exports = router;
 