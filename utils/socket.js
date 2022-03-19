/***********************************************************************
 * common socket js file, to build connection with server and send data.
 *
 *
 * Call example:
 * To build connection: RequestManager.init();
 * To send data: RequestManager.sendData("getData1", params, getData1Handler, 0);
 *
 * @author: seaK.
 */

// To include common package.
var io = require('socket.io-client');
import { notification } from 'antd';
import Storage from './storage';

// Server url to be connected.
var hname = location.hostname;
var port = [ 'localhost' ].indexOf(hname) !== -1 ? '8000' : '443';
window.socketUrl = `${location.protocol}//${hname}:${port}`;

var Event = function (type, data, cancelable) {
    this.cancelable = cancelable; //是否取消传递
    this.type = type; //类型
    this.data = data; // 数据

    this.clone = function() {
        var that = new Event();
        that.cancelable = this.cancelable;
        that.type = this.type;
        that.data = this.data;
        return that;
    };

    this.toString = function() {
        return "Event( type: " + this.type + ", cancelable: " + this.cancelable + this.eventPhase + ")";
    };
};

var EventListener = function (listener, priority) {
    if (typeof(arguments[0]) != "function") {
        throw new Error("Listener can not be empty.");
    }
    this.listener = listener;
    this.priority = priority?priority:0;
};

var EventManager = {
    eventListeners : [],

    /*************************************************
     * To add event listener.
     *
     * @params: type, type of event to be listened.
     * @params: listener, callback handler.
     * @params: priority: priority of callback handler.
     */
    addEventListener : function (type, listener, priority) {
        if (typeof (arguments[1]) != "function") {
            throw new Error("Type and listener can not be empty");
        }

        //Each event listener should have only one callback.
        this.eventListeners[type] = [];
        var index = this.eventListeners[type].length;
        //To remove same callback handler.
        for (var i = 0; i < index; i++) {
            var temp = this.eventListeners[type][i];
            if (temp.listener == listener) {
                return;
            }
        }
        var eventListener = new EventListener(listener, priority);
        this.eventListeners[type].push(eventListener);
        //To set priority of callback handler.
        this.eventListeners[type].sort(function (a, b) { return a.priority - b.priority; });
    },
    /*************************************************
     * To remove event listener.
     *
     * @params: type, type of event to be listened.
     * @params: listener, callback handler.
     */
    removeEventListener : function (type, listener) {
        var len = arguments.length;
        if (len < 2) {
            throw new Error("必须指定type 与 listener");
        }
        if (!this.eventListeners[type]) {
            return;
        }
        var index = this.eventListeners[type].length;
        //callbacks are more than one.
        if (index == 0) {
            var lisIndex = this.eventListeners.length;
            for (var i = 0; i < lisIndex; i++) {
                if (type == this.eventListeners[i]) {
                    this.eventListeners.splice(i, 1);
                }
            }
        } else {
            for (var j = 0; j < index; j++) {
                var temp = this.eventListeners[type][j];
                if (temp.listener == listener) {
                    this.eventListeners[type].splice(j, 1);
                }
            }
        }
    },
    /**************************************************************************
     * To dispatch event listener.
     *
     * @params: event, event to be dispatched, can be string or event object.
     */
    dispatchEvent : function (event) {
        event = (typeof (event) == "string") ? new Event(event) : event;
        if (!this.eventListeners[event.type]) {
            return;
        }
        var index = this.eventListeners[event.type].length;
        for (var k = 0; k < index; k++) {
            var temp = this.eventListeners[event.type][k];
            if (temp.listener) {
                if (!event.cancelable) {
                    temp.listener(event.data);
                } else {
                    continue;
                }
            }
        }
    },
    /**********************************************
     * To verify whether has type of event listener.
     *
     * @params: type, type of event.
     */
    hasEventListener : function (type) {
        return this.eventListeners[type] && this.eventListeners[type].length > 0;
    }
};

var RequestManager = {
    init:function(){
        SocketManager.connect();
    },
    getSocketInstance: function(){
        return SocketManager._instance;
    },
    sendData: function (eventType, params, listener, priority) {
        let token = Storage.getLocal('token');
        params.token = token;
        EventManager.addEventListener(eventType, listener, priority);
        var json = {
            eventType: eventType,
            parameters: params
        };
        SocketManager._instance.json.send(json);
    },

    //挂载不需要后台返回的监听事件
    addEvent: function (eventType,cb) {
        SocketManager._instance.on(eventType,function (data) {
            cb && cb(data);
        })
    },
    readData: function (data) {
        var evt = new Event();
        evt.type = data.eventType;
        evt.data = data;
        if (data.token) {
            Storage.setLocal('token', data.token);
        }
        EventManager.dispatchEvent(evt);
    },
    // 登陆订阅服务器推送
    subscribeServerPush: function() {
        SocketManager._instance.emit('subscribePush', {});

        // SocketManager._instance.on('subscribePush', (data) => {
        //     console.log('获取服务端推送数据');
        //     console.log(data);
        // });
    }
};

var SocketManager = {
    _instance: null,
    connect: function () {
        if (this._instance) {
            return;
        }
        if( !window.WebSocket ) {
            // 如果当前浏览器不支持 WebSocket, 则跳转至 Chrome 下载页
            return false;
        }
        this._instance = io.connect(window.socketUrl, {transports: ['websocket'], upgrade: false});
        this._instance.on("connect", function (data) {
            console.log("Connected to Server");
        });
        this._instance.on("message", function (data) {
            RequestManager.readData(data);
        });
        this._instance.on('reconnect', function () {
            // 为重新获取最新的socketId，服务端重启后重载页面
            window.location.reload();
            console.log("reconnect to Server");
        });

        // handle different server error, level-0: most important error, level-1: less important...
        this._instance.on('sysError', function(data){
            let { message, description, level } = data;
            switch(level) {
                case 0:
                    // logout and unlock task, then redirect to login page.
                    if( Storage.getLocal('token') ){
                        RequestManager.sendData( 'logout', {
                            token: Storage.getLocal('token'),
                            model: 'user'
                        }, res => {
                            if ( window.wid ) {
                                RequestManager.sendData('unlockAndAutoSave', {
                                    wid: window.wid,
                                    type: 'unlock',
                                    model: 'entry'
                                }, ()=>{
                                    Storage.delLocal('token');
                                    window.location.href = '/#/login';
                                });
                            } else {
                                Storage.delLocal('token');
                                window.location.href = '/#/login';
                            }
                        });
                    } else {
                        window.location.href = '/#/login';
                    }
                    notification['error']({
                        duration: 0,            // don't close automatically
                        message: message,
                        description: description
                    });
                    break;
                default:
                    notification['error']({
                        duration: 0,            // don't close automatically
                        message: message,
                        description: description
                    });
                    break;
            }
        });
    }
};

module.exports = RequestManager;
