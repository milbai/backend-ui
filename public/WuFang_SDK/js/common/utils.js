// import axios from 'axios';
// import md5 from 'js-md5';

// JavaScript Document
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
/* eslint-disable guard-for-in, eqeqeq */

(function classExtend() {
    var initializing = false;
    var fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    window.Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        /* eslint-disable-next-line */
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" &&
            fnTest.test(prop[name]) ? (function (name, fn) { // eslint-disable-line no-shadow
                return function () {
                    var tmp = this._super;
                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];
                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, prop[name]) : prop[name];
        }

        // The dummy class constructor

        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) { this.init.apply(this, arguments); }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = classExtend;  // eslint-disable-line

        return Class;
    };
})();

var utils = {
    MSG: {
        videoMsg: function(msg, domId) {
            var domId = typeof domId === 'undefined'? 'live-status': domId;
            var liveDom = document.getElementById(domId);
            if (liveDom) {
                liveDom.value = liveDom.value + msg + "\r\n";
            }
        },
        globalMsg: function(msg, domId) {
            var domId = typeof domId === 'undefined'? 'global-status': domId;
            var liveDom = document.getElementById(domId);
            if (liveDom) {
                liveDom.innerText = msg;
            }
        }
    },
    /**
     * 比较2个对象的内容是否一样
     *
     * @param {Object} obj1 必需。需要比较的数据对象。
     * @param {Object} obj2 必需。需要比较的数据对象。
     * @return {boolean} boolean
     */
    isObjectEquals: function(obj1, obj2) {
        var bool = true;

        if (typeof (obj1) != typeof (obj2)) {
            bool = false;
        } else if (typeof (obj1) != "object") {
            bool = (obj1 == obj2);
        } else {
            for (var i in obj1) {
                if (!this.isObjectEquals(obj1[i], obj2[i])) {
                    bool = false;
                    break;
                }
            }
        }
        return bool;
    },
    objectClone: function (sObj) {
        if (typeof (sObj) !== "object") {
            return sObj;
        }

        var s = {};
        if (Object.prototype.toString.call(sObj) === '[object Array]') {
            s = [];
        }
        for (var i in sObj) {
            s[i] = this.objectClone(sObj[i]);
        }
        return s;
    },
    BROWER: {
        docOffset: {left: 0, top: 0},
        windosAttr: {
            outerWidth: 0,
            innerWidth: 0,
            outerHeight: 0,
            innerHeight: 0,
            screenTop: 0,
            screenLeft: 0,
            screenX: 0,
            screenY: 0
        },
        setDocOffset: function(offset){
            this.docOffset = Object.assign({}, offset);
        },
        setWindowsAttr: function(winAttr) {
            this.windosAttr = Object.assign({}, winAttr);
        },
        weakUp: function(path) {
            var link = document.createElement("iframe");
            link.style.display = "none";
            link.src = path;

            if (!/*@cc_on!@*/0) { //if not IE
                link.onload = function(){
                    alert("框架加载完毕.");
                };
            } else {
                link.onreadystatechange = function(){
                    if (link.readyState == "complete"){
                        alert("框架加载完毕.");
                    }
                };
            }
            document.body.appendChild(link);
            setTimeout(function () {
                document.body.removeChild(link)
            }, 30000)
        },
        browserType: function() {
            var e = /(edge)[\/]([\w.]+)/, f = /(edg)[\/]([\w.]+)/, t = /(chrome)[\/]([\w.]+)/, n = /(safari)[\/]([\w.]+)/,
                r = /(opera)(?:.*version)?[\/]([\w.]+)/, i = /(msie) ([\w.]+)/, o = /(trident.*rv:)([\w.]+)/,
                s = /(mozilla)(?:.*? rv:([\w.]+))?/, a = navigator.userAgent.toLowerCase(),
                u = e.exec(a) || f.exec(a)|| t.exec(a) || n.exec(a) || r.exec(a) || i.exec(a) || o.exec(a) || a.indexOf("compatible") < 0 && s.exec(a) || ["unknow", "0"];
            u.length > 0 && u[1].indexOf("trident") > -1 && (u[1] = "msie");
            var c = {};
            return c.ClassSpace = u[1], c.Version = u[2], c
        },
        isMacOS: function() {
            var plat = navigator.platform;
            return "MacIntel" === plat
        },
        isFullScreen: function() {
            return (window.outerHeight === screen.availHeight && window.outerWidth === screen.availWidth);
        },
        getCreateWndMode: function() {
            var e = navigator.userAgent, t = navigator.platform,
                n = "Win64" === t || "Win32" === t || "Windows" === t, r = this.browserType(), i = !0;
            return window.top !== window ? i = !1 : n ? (e.indexOf("Windows NT 10.0") > -1 && r.ClassSpace === 'chrome' && (i = !1), r.ClassSpace === 'edge' && (i = !1)) : i = !1, i
        },
        getDevicePixelRatio: function() {
            var e = this, t = 1;
            return e.isMacOS() || (t = window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI), t
        },
        getRollbarSize: function() {
            var divDom = document.createElement('div');
            divDom.style.position = 'fixed';
            divDom.style.width = '100%';
            divDom.style.height = '100%';
            divDom.style.visibility = 'hidden';
            document.body.appendChild(divDom);
            var res = {rollWidth: window.innerWidth - divDom.clientWidth, rollHeight: window.innerHeight - divDom.clientHeight};
            document.body.removeChild(divDom);
            return res;
        },
        getWndPostion: function(tagId, bEmbed) {
            //var tabDom = document.getElementById(tagId);
            var tabDom = window.parent.document.getElementById(tagId);
            var tabRect = tabDom.getBoundingClientRect();
            var browser = this.browserType();
            var r = 0, i = 0, l = 0, o = tabRect, f = 0;
            var realLeft = 0, realTop = 0, offsetDom = {left: tabRect.left, top: tabRect.top},
                pRatio = this.getDevicePixelRatio(),
                borderWidth = tabDom.clientLeft, borderHeight = tabDom.clientTop,
                d = Math.round((window.outerWidth - window.innerWidth) / 2),
                winAttr = this.windosAttr;
            var versionWin7 = navigator.userAgent.indexOf("Windows NT 7") > -1 || navigator.userAgent.indexOf("Windows NT 6.1") > -1;

            realLeft = offsetDom.left + borderWidth;

            if (window.screen.availHeight === window.outerHeight) {
                f = 8;
            }


            if (browser.ClassSpace === 'msie') {
                realTop = offsetDom.top + borderHeight;
            } else {
                if ((browser.ClassSpace === 'chrome' || browser.ClassSpace === 'edg')) {
                    if (versionWin7) { //win7不需要偏移
                        f = 0;
                    }
                    d = Math.round((window.outerWidth / pRatio - window.innerWidth) / 2);
                    realTop = offsetDom.top + (window.outerHeight / pRatio - window.innerHeight - d) + borderHeight + f / pRatio;
                } else if (browser.ClassSpace === 'mozilla') {
                    realTop = offsetDom.top + (window.outerHeight - window.innerHeight - d) + borderHeight;
                }

            }
            if (navigator.userAgent.toLowerCase().indexOf('se') > -1) { //搜狗浏览器布局
                realTop = realTop + window.screenTop;
            }
            if (navigator.userAgent.toLowerCase().indexOf('opr') > -1) { //opera浏览器窗口布局特殊处理
                realLeft = realLeft + Math.round((window.outerWidth - window.innerWidth) / 2) + d;
                realTop = realTop + Math.round((window.outerWidth - window.innerWidth) / 2) - f;
            }


            (browser.ClassSpace === 'safari') && (realLeft = offsetDom.left + borderWidth, realTop = offsetDom.top + borderHeight);
            var w = 0, _ = 0;
            return (!browser.ClassSpace === 'msie' || browser.ClassSpace === 'msie' && "11.0" === browser.version) && (w = window.scrollX || window.pageXOffset, _ = window.scrollY || window.pageYOffset), realLeft = Math.round((realLeft - w) * pRatio), realTop = Math.round((realTop - _) * pRatio), {
                x: realLeft,
                y: realTop,
                //y: 276,
                width: tabDom.clientWidth * pRatio,
                height: tabDom.clientHeight * pRatio
            }
        }
    }
};

var exportObj = "undefined" !== typeof window ?
    window : "undefined" !== typeof global ?
        global : "undefined" !== typeof self ? self : this;

exportObj.utils = utils;
