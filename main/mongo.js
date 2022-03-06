/***
 * @author: seaK
 */
const conf    = require( '../config' );
const logger  = require( '../utils/loghelper' )( 'mongo' );
const dbUrl   = process.env.NODE_ENV === 'production' ?
                `mongodb://${conf.dbUser}:${conf.dbPwd}@${conf.dbAddr}:${conf.dbPort}/${conf.dbName}` :
                `mongodb://${conf.dbAddr}:${conf.dbPort}/${conf.dbName}`;


const Mongo = {

    init () {
        let _this = this;
        const monk = require( 'monk' )( dbUrl, { poolSize: 10, auto_reconnect: true});
        return (monk);
    }
}
module.exports = Mongo;