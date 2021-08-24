/**
 * websocket相关的请求
 */
var wsRequest = Class.extend({
    //初始化函数，自动调用，类似构造函数
    init: function(options) {
        this.webSocket = null;
        this.isNormal = false;
        this.promiseSeq = 0;             //每发送一条消息，自加1
        this.awaitingPromises = {};      //发送消息的回调函数的管理对象
        this.eventCallbackManager = {};  //事先上报回调函数管理对象
        this.options = options;
        this.connect(options);
    },
    connect: function(options) {
        (function(pointer, op) {
            var resCount = 0;
            var webObj;
            var that = pointer;
            //并发尝试连接5个端口，可以快速判断哪个端口可以用
            for (var port = op.ServerBeginPort, i = 0; port <= op.ServerEndPort && i < 5; port++, i++) {
                webObj = new WebSocket("ws://127.0.0.1:" + port);
                webObj.onopen = function (res) {
                    that.webSocket = res.target;
                    that.webSocket.onmessage = function (msg) {
                        that.wsMessage(msg);
                    };
                    that.webSocket.onerror = function (err) {
                        that.wsFail(err);
                    };
                    that.webSocket.onclose = function (msg) {
                        that.wsClose(msg);
                    };
                    op.cbConnectSuccess();
                };
                webObj.onerror = function (err) {
                    resCount++;
                    if(resCount > (op.ServerEndPort - op.ServerBeginPort)) {
                        op.cbConnectFail();
                    }
                };
            }
        })(this, options);
    },
    wsFail: function(err) {
        console.log(err);
    },
    wsClose: function(msg) {
        console.log(msg);
        if (this.isNormal) {

        } else {

        }
    },
    wsMessage: function(msg) {
        var res = JSON.parse(msg.data);
        if (res.seq in this.awaitingPromises) {
            this.awaitingPromises[res.seq].callback({code: res.code, errMsg: '', data: res.data});
            delete this.awaitingPromises[res.seq];
        } else { //上报事件
            //this.eventSource.emit('eventCallback', res);
            Index.eventCallback(res)
        }
    },
    sendMsg: function(cmd, msg, callback) {
        var that = this;
        if ((typeof msg !== 'object') ||
            this.webSocket === null) {
            return null;
        }
        var sendData = {
            seq: ++this.promiseSeq,
            cmd: cmd,
            timestamp: new Date().valueOf(),
            data: msg
        };
        if (that.webSocket && that.webSocket.send) {
            if(typeof callback === 'function') {
                that.awaitingPromises[that.promiseSeq] = {callback: callback};
            }
            that.webSocket.send(JSON.stringify(sendData));
        }
    },
    close: function() {
        if (this.webSocket) {
            this.isNormal = true;
            this.webSocket.close();
        }
    },
    // 页面注销,用于隐藏实况窗口,清除定时器,清空绑定在window的事件等
    release: function () {
        // TODO:
    }
});
