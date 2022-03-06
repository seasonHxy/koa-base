/***
 * @author: seaK
 */
ENUMS = requireModule("../enum");       //加载整个枚举目录
ENUMS_MAP = {};
ENUMS_LIST = {};
/**
 * 枚举管理器
 *
 * 将枚举配置信息进行初始化,确保能快速访问枚举信息,如ENUM.STATE.DISABLE
 *
 * 基本规则是:读取enum目录下所有枚举对象,以ENUM.[文件名全大写].[枚举名称]进行访问
 *
 * 每一个枚举记录中必定含有key[枚举名称],value[枚举值]信息,其他信息亦可存在
 *
 * 获取其他信息时需要使用枚举管理器提供的其他配套方法
 */


const ENUM = {


    init () {
        return new Promise(function (resolve, reject) {
            let _this = this;
            requireModule.each(ENUMS, function ( obj, sname, fname ){
                let item, key, len, val;
                let data = {};
                let list = [];
                for (let i = 0, len = obj.length; i < len; i++){
                    item = obj[i];
                    key = item.key;
                    val = item.value;
                    data[key] = val;
                    list.push(val);
                }
                Utils.util.set(sname.toUpperCase(), ENUMS_MAP, obj);
                Utils.util.set(sname.toUpperCase(), ENUMS_LIST, list);
                Utils.util.set(sname.toUpperCase(), _this, data);
            resolve(_this);
            });
        })
    },

     _getVal (ename, ekey, vkey, val) {
        let map = ENUMS_MAP[ename.toUpperCase()];
        if (!map) 
            return null;
        let desc = null;
        for ( let item in map ) {
            if ( item[ekey] != val )
                continue;
            desc = item[vkey];
            break;
        }
        return desc;
     },
     //# {key: "WECHAT", value: 0, desc: "微信"}
     _getObj (ename, ekey, val) {
        let map = ENUMS_MAP[ename.toUpperCase()];
        if ( !map )
            return null;
        let obj = null;
        for ( let item in map ) {
            if ( item[ekey] != val ) 
                continue;
            obj = item
            break;
        }
        return obj;
     },
     getKey (ename, val) {
        return _getVal(ename, 'value', 'key', val);
     },
     getDesc (ename, val) {
        return _getVal(ename, 'value', 'desc', val);
     },
     getVal (ename, val, vkey = 'value') {
        let v = _getVal(ename, 'key', vkey, val);
        return v;
     }
}
module.exports = ENUM