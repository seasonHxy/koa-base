module.exports = {
  
  "extends": [
    "yylint"
  ],
  "parserOptions": {
    "sourceType": "module"
  },
  "env": {
    "es6": true,
    "node": true
  },

  "rules"  : {
    // 以下配置检查
    "array-bracket-spacing": ["error", "always"],   // 强制在[]内使用空格
    "object-curly-spacing" : ["error", "always"],   // 强制在{}使用一致的空格
    "quotes"               : ["error","single"],    // 强制使用一致的单引号
    "semi"                 : ["error","always"],    // 要求使用分号
  }
  
};

