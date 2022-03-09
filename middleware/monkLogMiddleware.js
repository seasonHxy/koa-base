/***********************************************
 * Purpose: Middleware for monk(mongodb) log.
 *
 * @author: SeaK.
 */
'use strict';

const logger  = require('../utils/loghelper')('mongo');

let getArgs = function(args, context) {
    let ret = {};
    // table
    if (context.collection.name) {
        ret.collection = context.collection.name;
    }
    // query
    if (args.query) {
        ret.query = args.query;
    }
    // options
    if (args.options) {
        ret.options = args.options;
    }
    return ret;
};

module.exports = function(context) {
    return function(next) {
        return function(args, method) {
            return next(args, method).then((res) => {
                let result = res.result || res;
                // logger.info(method + '\nargs:\n', getArgs(args, context), '\nresult:\n', result);
                return res;
            });
        };
    }; 
};

