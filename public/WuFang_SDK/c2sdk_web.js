import connection from './connection.js'
import playback from './playback.js'
import preview from './preview.js'
import ptzCtrl from './ptzctrl.js'



/*
 * 功能:提供给外部访问的接口
 *
 */

/*
 * 功能:登录状态回调函数
 *
 */
function connState(event) {

}

/*
 * 功能:告警回调函数
 *
 */
function alarmcb(data) {

}

/*
 * 功能:登录参数
 */
var loginParam = {
    ip  : "",
    port : 0,
    user : "",
    password : "",
    state : connState,
	alarmcallback: alarmcb
}

/*
 *功能:创建登录句柄
 *参数1:loginParam 登录参数
 *参数2:userParam_ 用户自定义数据
 *
 * 返回值:
 */
export function createConn(loginParam_, userParam_) {
    var hConn = new connection(loginParam_, userParam_);
    if (null != hConn) {
        hConn.start();
    }
    return hConn;
}

function pfnGetConfigCb(data)
{
	
}

export function queryConfig(hConn_, json, pfnGetConfigCb) {
	  if (null != hConn_) {
	     hConn_.queryConfig(json, pfnGetConfigCb);
	  }
}
/*
 * 功能:退出登录
 *参数1:hConn_ 登录句柄 createConn返回值
 *
 */
export function destroyConn(hConn_) {
    if (null != hConn_) {
        hConn_.stop();
        hConn_ = null;
    }
}
/*
 * 功能:预览参数
 */
var previewParam = {
    devip : "",
    port  : 0,
    chn   : 0,
    type  : 0,   //大小码流
    hwnd  : null
}

/*
 * 功能:开始预览
 * 参数1:登录句柄 createConn返回值
 * 参数2:previewParam_ 预览参数
 *
 * 返回值:预览对象句柄
 */
export function startPreview(hConn_, previewParam_) {
    var hPreview = new preview(hConn_, previewParam_);
    if (null != hPreview) {
        hPreview.start();
    }
    return hPreview;
}

/*
 *功能:停止预览
 *参数1:预览句柄 startPreview返回值
 *
 */
export function stopPreview(hPreview_) {
   if (null != hPreview_) {
       hPreview_.stop();
       hPreview_ = null;
   }
}

/*
 * 功能:云台参数
 */
var ptzParam = {
    devip :"",
    devport: 0,
    chn : 0,
    cmd : 0,
    stop : 0,
    speed : 5,
    preset : 1,
}

/*
 *功能:云台控制
 *
 */
export function ptzControl(hConn_, ptzParam_) {
   var doPtz = new ptzCtrl(hConn_, ptzParam_);
   doPtz.sendRequest();
}

/*
 *功能:录像列表
 *
 */
function recordList(data, userParam) {

}
/*
 *功能:录像查询参数
 *
 */
var recordParam = {
    devip :"",
    devport: 0,
    chn : 0,
    beginTime: "",
    endTime: "",
    result: recordList
}

/*
 *功能:录像查询
 *
 */
export function queryRecord(hConn_, recordParam_, userParam_) {
     if (null != hConn_) {
         hConn_.queryRecord(recordParam_, userParam_);
     }
}

/*
 *功能:回放参数
 *
 */
function playtime(time, userParam) {

}

function downloadstatus(time, userParam) {

}

var playbackParam = {
    devip :"",
    devport: 0,
    chn : 0,
    mode : 0,   //0:文件  1:时间
    filename : "",
    beginTime : "",
    endTime : "",
    playtimecb: playtime,
    downloadcb:downloadstatus
}

/*
 *功能:开始录像回放
 * 参数1:
 *
 */
export function startPlayback(hConn_, playbackParam_) {
   var hPlayback = new playback(hConn_, playbackParam_);
   if (null != hPlayback) {
       hPlayback.start();
   }
   return hPlayback;
}

/*
 *功能:录像控制参数
 *
 */
var playbackCtrlParam = {
    cmd : 0,
    pos : 0
}

/*
 *功能:录像回放控制
 * 参数1:
 *
 */
export function playbackCtrl(hPlayback_, playbackCtrlParam_) {
    if (null != hPlayback_) {
        hPlayback_.playctrl(playbackCtrlParam_);
    }
}

/*
 *功能:停止录像回放
 * 参数1:hPlayback_ startPlayback的返回值
 *
 */
export function stopPlayback(hPlayback_) {
    if (null != hPlayback_) {
        hPlayback_.stop();
        hPlayback_ = null;
    }
}


/*
 *功能:开始对讲
 * 参数1:hPreview_ startPreview的返回值
 *
 */
export function startTalk(hPreview_) {
  if (null != hPreview_){
     hPreview_.record();
  }
}

/*
 *功能:停止对讲
 * 参数1:hPreview_ startPreview的返回值
 *
 */
 export function stopTalk(hPreview_) {
  if (null != hPreview_){
     hPreview_.release();
  }
}