
/**
 * 时间管理工具包
 */

'use strict';

const MM = require('moment');
const _ = require('lodash');

module.exports = {
    newDate: (format) => {
        return MM(new Date()).format(format || 'YYYY/MM/DD');
    },
    newTime: (format) => {
        return MM(new Date()).format(format || 'HH:mm:ss');
    },
    newAll: (format) => {
        return MM(new Date()).format(format || 'YYYY/MM/DD HH:mm:ss');
    },
    // 获取当天凌晨的时间戳 单位：毫秒
    dayTimestamp: () => {
        return new Date(new Date().setHours(0, 0, 0, 0)) / 1;
    },
    /**
     * 统一格式化查询时间 'YYYY/MM/DD'
     * @param {*时间} time
     */
    formatTimeToSlash(time) {
        if (!time) {
            return '';
        }
        // 时间格式有: 1528883675911, '1528883675911','2012/01/01'
        if (_.isNumber(time)) {
            return MM(time).format('YYYY/MM/DD');
        }
        if (!_.isNaN(Number(time))) {
            return MM(Number(time)).format('YYYY/MM/DD');
        }
        if (MM(time, 'YYYY-MM-DD').isValid()) {
            return MM(time, 'YYYY-MM-DD').format('YYYY/MM/DD');
        }
        return '';
    },
}