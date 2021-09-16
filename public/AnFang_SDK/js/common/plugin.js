var webPlugin = {
    wsObj: null,
    wndMaganerList: {},    //窗体管理对象，支持多窗体模式。 key: id(div), value
    JS_CreateWebControl: function(option) {
        var that = this;
        var options = option;
        if(that.wsObj !== null) {
            options.cbConnectSuccess({code: 0, errMsg: 'connect success!'});
            return;
        }
        this.wsObj = new wsRequest({
            ServerBeginPort: options.ServerBeginPort,
            ServerEndPort: options.ServerEndPort,
            cbConnectSuccess: function(res){
                options.cbConnectSuccess({code: 0, errMsg: res});
            },cbConnectFail: function(err) {
                that.wsObj = null;
                options.cbConnectFail({code: 1, errMsg: err});
            },cbConnnectClose: function(msg) {
                that.wsObj = null;
                options.cbConnnectClose({code: 1, errMsg: msg});
            }
        });
    },
    JS_CreateWnd: function(tabID, callback) {
        var that = this;
        if (that.wsObj === null) {
            callback({code: 1, errMsg: 'websocket连接异常！'});
            return;
        }
        that.wsObj.sendMsg('NETDEV_DlgInit', {"strServerIP" : ""}, function(msg) {
            if(msg.code === 0) {
                var wndObj = that.wndMaganerList[tabID] = {wsObj: null, uuid: msg.data.uuid, startTime: -1, endTime: -1,  updatePTimer: -1, visibilityChange: null, wndSizeChange: null
                };
                var controlObj = {
                    isInstalled: true,
                    wndControl: new wndControl(wndObj),
                    SDKControl: new SDKControl(wndObj)
                };
                wndObj.visibilityChange = function() {
                    if (utils.BROWER.isMacOS()) {
                        document.hidden ? controlObj.wndControl.JS_ShowWnd(false) : controlObj.wndControl.JS_ShowWnd(true);
                    } else if (document.hidden) {
                        wndObj.startTime = (new Date).getTime();
                        controlObj.wndControl.JS_ShowWnd(false);
                    } else {
                        if(wndObj.wsObj !== null) {
                            var brower = utils.BROWER.browserType();
                            wndObj.endTime = (new Date).getTime();
                            console.log((wndObj.endTime - wndObj.startTime));
                            if(brower.ClassSpace === 'chrome' || brower.ClassSpace === 'mozilla') {
                                (wndObj.updatePTimer > 0 && (clearTimeout(wndObj.updatePTimer), wndObj.updatePTimer = -1), wndObj.endTime - wndObj.startTime < 100 ? wndObj.updatePTimer = setTimeout(function () {
                                    controlObj.wndControl.JS_UpdateWnd();
                                }, 0) : controlObj.wndControl.JS_ShowWnd(true));
                            } else {
                                controlObj.wndControl.JS_ShowWnd(true)
                            }
                        } else {
                            _createDlg();
                        }
                    }
                };
                document.addEventListener("visibilitychange", wndObj.visibilityChange, false);
                window.parent.document.addEventListener("visibilitychange", wndObj.visibilityChange, false);
                //创建web窗体，可能会失败
                function _createDlg() {
                    var oldTitle = window.parent.document.title;
                    window.parent.document.title = msg.data.uuid;
                    setTimeout(function() {
                        var pos = utils.BROWER.getWndPostion(tabID, utils.BROWER.getCreateWndMode());
                        var browser = utils.BROWER.browserType();
                        var sendMsg = {
                            uuid: msg.data.uuid,
                            strClassSpace: browser.ClassSpace,
                            strVersion: browser.Version,
                            lLeft: pos.x,
                            lTop: pos.y,
                            lWidth: pos.width,
                            lHeight: pos.height,
                            lFocusColor: 0x3399ff,
                            lUnfocusColor: 0x646464,
                            lBackground: 0x000000,
                            lMaxPlays: 30
                        };
                        that.wsObj.sendMsg('NETDEV_CreateDlg', sendMsg, function(res) {
                            if(res.code === 0) {
                                wndObj.wsObj = that.wsObj;
                                wndObj.wndSizeChange = function() {
                                    var brower = utils.BROWER.browserType();

                                    if(brower.ClassSpace === 'mozilla') {//火狐页签拖出未触发visibilityChange做的兼容
                                        controlObj.wndControl.JS_ShowWnd(false);
                                        if (!document.hidden) {
                                            controlObj.wndControl.JS_UpdateWnd(oldTitle);
                                        }
                                    }
                                    controlObj.wndControl.JS_ResizeWnd(tabID, function(res) {
                                        controlObj.wndControl.JS_MoidfyPartWnd(tabID);
                                    });
                                };
                                //controlObj.wndControl.JS_MoidfyPartWnd(tabID);
                                //window.addEventListener('resize', that.wndMaganerList[tabID].wndSizeChange, false);
                                //window.addEventListener('scroll', that.wndMaganerList[tabID].wndSizeChange, false);
                                window.parent.addEventListener('resize', that.wndMaganerList[tabID].wndSizeChange, false);
                                window.parent.addEventListener('scroll', that.wndMaganerList[tabID].wndSizeChange, false);
                                callback({code: res.code, errMsg: '窗体创建成功', data: controlObj});
                            } else {
                                callback({code: res.code, errMsg: '窗体创建失败', data: {isInstalled: false}});
                            }
                            window.parent.document.title = oldTitle;
                        });
                    }, 300)
                }
                _createDlg();
            } else {
                callback({code: msg.code, errMsg: '窗体创建失败', data: {isInstalled: false}});
            }
        });
    },
    JS_DestroyWnd: function(tabID, callback) {
        if(this.wsObj === null) {
            callback({code: 1, errMsg: 'websocket连接异常！'});
            return;
        }
        var that = this;
        if(tabID in that.wndMaganerList) {
            this.wsObj.sendMsg('NETDEV_DestroyDlg', {uuid: that.wndMaganerList[tabID].uuid}, function(msg) {
                if(msg.code === 0) {
                    document.removeEventListener("visibilitychange", that.wndMaganerList[tabID].visibilityChange, false);
                    window.parent.document.removeEventListener("visibilitychange", that.wndMaganerList[tabID].visibilityChange, false);
                    //window.removeEventListener('resize', that.wndMaganerList[tabID].wndSizeChange, false);
                    //window.removeEventListener('scroll', that.wndMaganerList[tabID].wndSizeChange, false);
                    window.parent.removeEventListener('resize', that.wndMaganerList[tabID].wndSizeChange, false);
                    window.parent.removeEventListener('scroll', that.wndMaganerList[tabID].wndSizeChange, false);
                    delete that.wndMaganerList[tabID];
                    callback({code: msg.code, errMsg: '窗体销毁成功'});
                } else {
                    callback({code: msg.code, errMsg: '窗体销毁失败'});
                }
            });
        } else {
            callback({code: 1, errMsg: '窗体不存在！'});
        }
    },
    JS_CheckVersion: function(currentVersion, callback) {
        if(this.wsObj === null) {
            callback({code: 1, errMsg: 'websocket连接异常！'});
            return;
        }
        var that =  this;
        that.wsObj.sendMsg('NETDEV_GetVersion', {}, function(res) {
            if(res.code === 0) {
                var flag = currentVersion >= res.data.version? 1 : 0;
                callback({code: 0, flag: flag});
            } else {
                callback({code: -1, flag: null});
            }
        });
    }
};
var exportObj = "undefined" !== typeof window ?
    window : "undefined" !== typeof global ?
        global : "undefined" !== typeof self ? self : this;
exportObj.webPlugin = webPlugin;
