/********************************************
 * Global config file
 * ******************************************
 * @author: seaK.
 */

module.exports = {

    // 接口签名校验key
    'apiKey': '',

    // Mongo 数据库
    'dbUser': '',
    'dbPwd': '',
    'dbAddr': '',
    'dbPort': 27017,
    'dbName': '',

    // Node 监听端口
    'httpPort': 8000,

    

    // 日志配置
    'appenders': [ {
        'type': 'dateFile',
        'filename': './log/server',
        'pattern': '-yyyy-MM-dd.log',
        'expire': 30,
        'category': 'server'
    }, {
        'type': 'dateFile',
        'filename': './log/mongo',
        'pattern': '-yyyy-MM-dd.log',
        'expire': 30,
        'category': 'mongo'
    }, {
        'type': 'dateFile',
        'filename': './log/http',
        'pattern': '-yyyy-MM-dd.log',
        'expire': 30,
        'category': 'http',
        'level': 'info'
    } ],

    // memcache 服务器
    'memhost': '',

    // redis 服务器
    'redisUrl': '',
    'redisPort': 6379,

    // 默认超时时长
    'timeout': 30000,

    // 配置中心
    'sqlAddr': '',
    'sqlPort': 3306,
    'sqlUser': '',
    'sqlPwd': '',
    'sqlName': '',
};
