/**
 * 缓存工具包
 * @author: seaK.
 */


var Storage = {
    set: function(key, val) {
        try {
            var val_str = JSON.stringify(val || {});
            window.sessionStorage.setItem('$' + key, val_str);
        }
        catch (ex) {
            console.error(ex);
        }
    },
    get: function(key) {
        try {
            var val = window.sessionStorage.getItem('$' + key) || '{}';
            return JSON.parse(val);
        }
        catch (ex) {
            console.error(ex);
        }
    },
    setLocal: function(key, val) {
        try {
            var val_str = JSON.stringify(val || {});
            window.localStorage.setItem('$' + key, val_str);
        }
        catch (ex) {
            console.error(ex);
        }
    },
    getLocal: function(key) {
        try {
            var val = window.localStorage.getItem('$' + key);
            return val?JSON.parse(val):'';
        }
        catch (ex) {
            console.error(ex);
        }
    },
    delLocal:function(key){
        try {
            window.localStorage.removeItem('$' + key);
            return;
        }
        catch (ex) {
            console.error(ex);
        }
    }
};

module.exports = Storage;
