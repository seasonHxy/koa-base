let path = require('path');
let Util = require('../utils/util.js');
const SERVICES = {};
const SERVICE_MAP = {};

const Service = {
    init () {
        return new Promise(function (resolve, reject) {
            resolve(this);
        })
    },
    regService (name, obj) {
        let service;
        if ( Util.isFunction() ) {
            if ( obj.prototype.MODEL_NAME == null ) {
                obj.prototype.MODEL_NAME = name.split('.').pop.toLowerCase();
            }
            service = new obj({});
            service.__isModule = true;
        }
        else 
            service = obj;
        Util.set(name, SERVICES, obj);
        Util.set(name, SERVICE_MAP, service);
        Util.set(name, this, service);
        return service;
    },
    load (name) {
        let service;
        let serviceName = name.replace('/\./g', '/');
        try {
            service = require(path.join(__dirname,'../service/'+serviceName));
        } catch (error) {
            console.log(`require service error:${error}`);
            console.trace(error);
            throw(error);
        }
        service = regService(name, service);
        return this;
    },
    getClass (name) {
        let obj = Util.get(name, SERVICES);
        if (!obj) {
            load(name);
            obj = Util.get(name, SERVICES); 
        }
        return obj;
    },
    get (name) {
        let service = Util.get(name, SERVICE_MAP);
        if (!service) {
            load(service);
            service = Util.get(name, SERVICE_MAP);
        }
        return service;
    },
    exec (name) {
        const args = Array.prototype.slice.call(arguments, 1);
        let arr = name.split('.');
        if (arr.length <= 1)
            return;
        const fname = arr.pop();
        const sname = arr.join('.');
        let obj = get(sname);
        let fn = obj[fname];
        if (!fn) {
            return false;
        }
        return fn.apply(obj, args);
    }

}
module.exports = Service;
