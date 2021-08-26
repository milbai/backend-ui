/** 窗口控制
 * JS_SetFocus
 * JS_GetFocus
 * JS_ActiveWnd
 * JS_GetOnHoverWnd
 * JS_FullScreen
 * JS_EnableWndCallBack    暂不实现
 * JS_ResizeWnd
 * JS_MoidfyPartWnd
 * JS_ShowWnd
 * JS_FreshWnd
 * JS_UpdateWnd
 * JS_SetWndPos
 * JS_SetDblClkMode 暂不实现
 */
var wndControl = Class.extend({
    init: function(wsControl) {
        this.wsControl = wsControl || null;
        this.oldPosition = {};
    },
    JS_SetFocus: function(lResId, callback) {
        var msg = {
            uuid: this.wsControl.uuid,
            lResId: lResId
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_SetFocus', msg, callback);
    },
    JS_GetFocus: function(callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_GetFocusWnd', {uuid: this.wsControl.uuid}, callback);
    },
    JS_ActiveWnd: function(callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_ActiveWnd', {uuid: this.wsControl.uuid}, callback);
    },
    JS_GetOnHoverWnd: function(callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_GetOnHoverWnd', {uuid: this.wsControl.uuid}, callback);
    },
    JS_UpdateWnd: function(wndTitle, callback) {
        var that = this;
        var oldTitle = typeof wndTitle === "undefined" ? window.top.document.title : wndTitle;
        window.top.document.title = that.wsControl.uuid;
        setTimeout(function() {
            return that.wsControl.wsObj.sendMsg('NETDEV_UpdateDlgParentWnd', {uuid: that.wsControl.uuid}, function (res) {
                if(res.code === 0) {
                    that.JS_ShowWnd(true);
                } else {
                    // that.JS_ShowWnd(false);
                }
                window.top.document.title = oldTitle;
            });
        }, 300);
    },
    JS_FullScreen: function(lState, callback) {
        var msg = {
            uuid: this.wsControl.uuid,
            lState: lState
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FullScreen', msg, callback);
    },
    JS_ResizeWnd: function(tagId, isEmbed, callback) {
        var that = this;
        var pos = utils.BROWER.getWndPostion(tagId, isEmbed);
        var msg = {
            uuid: this.wsControl.uuid,
            lLeft: pos.x,
            lTop: pos.y,
            lWidth: pos.width,
            lHeight: pos.height
        };
        if(typeof that.oldPosition.uuid !== "undefined") { //移动浏览器窗口时更新坐标，若坐标不变则不下发
            if(utils.isObjectEquals(that.oldPosition,msg)){
                return;
            }
        }
        that.oldPosition = utils.objectClone(msg);
        return this.wsControl.wsObj.sendMsg('NETDEV_ResizeDlg', msg, callback);
    },
    JS_MoidfyPartWnd: function(tagId, callback) {
        var pRatio = utils.BROWER.getDevicePixelRatio();
        //var tagDom = document.getElementById(tagId);
        var tagDom = window.parent.document.getElementById(tagId);
        var tagWidth = tagDom.clientWidth;
        var tagHeight = tagDom.clientHeight;
        var rollSize = utils.BROWER.getRollbarSize();
        var iWidth = window.innerWidth - rollSize.rollWidth;
        var iHeight = window.innerHeight - rollSize.rollHeight;
        var oDivRect = tagDom.getBoundingClientRect();
        var iCoverLeft = (oDivRect.left < 0) ? Math.abs(oDivRect.left): 0;
        var iCoverTop = (oDivRect.top < 0) ? Math.abs(oDivRect.top): 0;
        var iCoverRight = (oDivRect.right - iWidth > 0) ? Math.round(oDivRect.right - iWidth) : 0;
        var iCoverBottom = (oDivRect.bottom - iHeight > 0) ? Math.round(oDivRect.bottom - iHeight) : 0;

        iCoverLeft = (iCoverLeft > tagWidth) ? tagWidth : iCoverLeft;
        iCoverTop = (iCoverTop > tagHeight) ? tagHeight : iCoverTop;
        iCoverRight = (iCoverRight > tagWidth) ? tagWidth : iCoverRight;
        iCoverBottom = (iCoverBottom > tagHeight) ? tagHeight : iCoverBottom;
        var msg = {
            uuid: this.wsControl.uuid,
            lLeft: iCoverLeft*pRatio,
            lTop: iCoverTop*pRatio,
            lWidth: (tagWidth - iCoverRight + 1)*pRatio,
            lHeight: (tagHeight - iCoverBottom  + 1)*pRatio
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_AdjustDlg', msg, callback);
    },
    JS_ClippingPartWnd: function(DialogId, PopId, flag, callback) {
        var posDialog = utils.BROWER.getWndPostion(DialogId, flag);
        var posPop = utils.BROWER.getWndPostion(PopId, flag);
        var lLeft = posPop.x - posDialog.x;
        var lTop = posPop.y - posDialog.y;
        var lWidth = compute(lLeft, posDialog.width, posPop.width);
        var lHeight = compute(lTop, posDialog.height, posPop.height);
        function compute(key, dialogLength, popLength) {
            var result;
            var tempLength;
            if (key > 0) {
                tempLength = popLength + key - dialogLength;
                if ((tempLength > 0 && tempLength > popLength)) {
                    return -1;
                } else if (tempLength > 0 && tempLength < popLength) {
                    result = popLength - tempLength;
                } else {
                    result = popLength;
                }
            } else if (key < 0) {
                tempLength = popLength + key;
                if (tempLength + popLength <= 0) {
                    return -1;
                } else if (tempLength < popLength) {
                    result = tempLength;
                } else {
                    result = popLength;
                }
            } else if (key === 0) {
                result = popLength;
            }
            return result;
        }
        if (lWidth < 0 || lHeight < 0) {
            return;
        }
        var msg = {
            uuid: this.wsControl.uuid,
            lLeft: lLeft > 0 ? lLeft : 0,
            lTop: lTop > 0 ? lTop : 0,
            lWidth: lWidth + 1,
            lHeight: lHeight + 1,
            lClip: flag
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_ClippingPartWnd', msg, callback);
    },
    JS_ShowWnd: function(lShow, callback) {
        var msg = {
            uuid: this.wsControl.uuid,
            lShow: lShow
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_ShowDlg', msg, callback);
    },
    JS_FreshWnd: function(callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_FreshDlg', {uuid: this.wsControl.uuid}, callback);
    },
    JS_SetWndPos: function(lPageMode, lWndNum, callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_SetWndMode', {
            uuid: this.wsControl.uuid,
            lWndMode : lPageMode,
            lWndNum : lWndNum
        }, callback);
    },
    // 使能双击全屏 IPC使用
    JS_SetDblClkMode: function(callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_SetDblClkMode', {}, callback);
    },
    JS_EnableWndCallBack: function(callback) {
        return this.wsControl.wsObj.sendMsg('NETDEV_EnableWndCallBack', {uuid: this.wsControl.uuid}, callback);
    }
});
