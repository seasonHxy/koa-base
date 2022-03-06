/***
 * @author: seaK
 */

let path = require('path');
let fs = require('fs');

/**
*load all the modules in the directory
*/
let config = {
        base_path : null,
        exts: ['.js'],
        defaultExt: '.js'
    }

let CACHE = {}
let requireModule = {}

    
loadFile = function (filePath) {
    let obj = {};
    try {
        obj = require(filePath);
    } catch (error) {
        console.log(`require module error:${error}`);
        console.trace(error);
        throw(error);
    }
    return obj;
},
readFiles = function (folderPath, map={}) {
    
    let files = fs.readdirSync(folderPath);
    let idx, fileName, fileExt, filePath, stats;
    for ( let file of files){
        idx = file.lastIndexOf('.');
        fileName = file.substring(0, idx);
        fileExt = file.substring(idx);
        filePath = path.join(folderPath, file);
        //console.log('filePath:',filePath);
        //return;
        stats = fs.lstatSync(filePath);
        if ( stats.isDirectory() ) {
            obj = map[file] = {};
            readFiles(filePath, obj);
        }

        if ( stats.isFile() && (config.exts.includes(fileExt)) ) {
            let obj = loadFile(filePath);
            obj.__isModule = true;
            map[fileName] = obj;
            continue;
        }
    }
    //console.log('map5:',map);
    return map;
},
getStats = function (filePath) {
    let result;
    try {
        result = fs.lstatSync(filePath);
    } catch(e) {
        result = e;
    }
    return result;
},

//requireModule('../utils');
//require('../utils/token.js');
requireModule = function (src) {
    if ( !src ) {
        return null;
    }
    let folderPath;
    if (src.indexOf('.') == 0) {
        folderPath = path.join(__dirname, src);
    } else if (config.base_path) {
        folderPath = path.join(config.base_path, src);
    } else {
        folderPath = src;
    }
    if ( CACHE[folderPath] ) {
        return CACHE[folderPath];
    }
    let stats = getStats(folderPath);
    let map = {};
    //console.log('folderPath:',folderPath);
    if ( !stats ) {
        map = loadFile(folderPath + config.defaultExt);
    } else if (stats.isFile()){
        map = loadFile(folderPath);
    } else {
        map = readFiles(folderPath, {});
    }
    //console.log('map2:',map);
    CACHE[folderPath] = map;
    return map;
},
requireModule.config = function (cfg) {
    //console.log('cfg:',cfg);
    let key, val;
    for (key in cfg) {
      val = cfg[key];
      config[key] = val;
    }
    // for (let key of Object.keys(cfg)) {
    //     //console.log('key:',key);
    // }
    //console.log('config:',config);
    return requireModule;
},
/**
*read all modules in package
*
*@param {Object}    [obj]   package对象
*@param {Function}  [fn]    处理函数
*@param {String}    [sname] 短名称,如user.login,则为login
*@param {String}    [fname] 完整标识,如user.login
*/
requireModule.each = function (obj, fn, sname, fname) {
    if ( !obj.__isModule ) {
        //for (let k, item of obj) {
        let k,item;
        for (k in obj) {
            item = obj[k];
            if (fname) {
                let newfname = `${fname}.${k}`
            } else {
                newfname = k
            }
            requireModule.each(item, fn, k, newfname)
        }
    }
    fn.call(this, obj, sname, fname);
}




module.exports = requireModule;