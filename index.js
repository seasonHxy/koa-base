'use strict';
// require('babel-core/register');

let App = require('./appStart.js')
const conf    = require( './config.js' );
const logger  = require('./utils/loghelper')('server');
const socketConnect     = require('./routes/socketConnect').ioInstance;
const domain  = require('domain');

let httpServer = function(app) {
    const server = require('http').Server(app.callback());
    //To catch sync error.
    try{
        socketConnect.init(server);
    }
    catch(ex){
        logger.error(ex);
    };

    //To catch async error.
    if(process.env.NODE_ENV == 'production'){
        var dm = domain.create();
        dm.add(server);
        dm.on('error', function(er){
            logger.error('System error, reason is ' + er + ', query is ' + req.url);
            try {
                res.writeHead(500);
                res.end('System Error');
            } catch (er) {
                logger.error('Error sending 500, reason is' + er);
            }
        });
    }
    console.log(process.env.PORT || conf.httpPort || 3000);
    server.listen(process.env.PORT || conf.httpPort || 3000);

};
App.init().then(function(app) {     
    httpServer(app);
});
