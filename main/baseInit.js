
/***
 * @author: seaK
 */
const Config = require('../config.js');
const requireModule = require('./requireModule.js');    // 加载目录下的所有模块
requireModule.config({base_path: Config.base_path});    
global.requireModule = requireModule;

const Utils = requireModule('../utils');                
global.Utils = Utils;
const logger  = Utils.loghelper('server');
const hLogger  = Utils.loghelper('http');
global.logger = logger;
global.hLogger = hLogger;
const Mongo = require('./mongo.js');
const ENUM = require('./enum.js');                      
global.ENUM = ENUM;
const Service = require('./service.js');                
global.Service = Service;


/**
 * 项目启动初始化对象
 * 
 * 定义项目启动初始化基本流程: 
 * 
 * 1.初始化数据连接
 * 2.初始化枚举管理器
 * 3.初始化服务
 */

let baseInit = {
    init () {
        return new Promise(function (resolve, reject) {

            const _this = this;
            return Mongo.init().then(function(db) {
                global.db = db;
                console.log('db init success');
                logger.info('db init success');
                return ENUM.init();
            }).then(function() {
                console.log('enum init success');
                logger.info('enum init success');
                return Service.init();
            }).then(function(){
                console.log('service init success');
                logger.info('service init success');
                return resolve(_this);
            }).catch(function(error){
                logger.error("server start fail", error);
                return reject(error);
            });
        });
    }
}
module.exports = baseInit;


