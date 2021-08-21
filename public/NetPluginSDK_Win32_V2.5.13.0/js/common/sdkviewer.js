var SDKControl = Class.extend({
    init: function(wsControl) {
        this.wsControl = wsControl || null;
    },
    JS_devLogin: function(data, callback) { //设备登录
        data.uuid = this.wsControl.uuid;
        //var dataMap = utils.objectClone(data);
        return this.wsControl.wsObj.sendMsg('NETDEV_Login_V30', data, callback);
    },
    JS_devLoginOut: function(DeviceHandle, callback) { //设备注销
        var dataMap = {
            uuid: this.wsControl.uuid,
            UserID: DeviceHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_Logout', dataMap, callback);
    },
    JS_chlList: function(DeviceHandle, callback) { //查询视频通道信息列表
        var dataMap = {
            uuid: this.wsControl.uuid,
            UserID: DeviceHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_QueryVideoChlDetailListEx', dataMap, callback);
    },
    JS_findDevChnList: function(DeviceHandle, callback) { //通过设备ID或通道类型 查询通道信息列表
        var dataMap = {
            uuid: this.wsControl.uuid,
            UserID: DeviceHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindDevChnList', dataMap, callback);
    },
    JS_stopRealPlay: function(resID, callback) { //停止实时预览
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_StopRealPlay', dataMap, callback);
    },
    JS_realPlay: function(data, callback) { //启动实时预览
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_RealPlay', data, callback);
    },
    JS_setLogPath: function(LogPath, callback) { //设置日志路径业务
        var dataMap = {
            uuid: this.wsControl.uuid,
            szLogPath: LogPath
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_SetLogPath', dataMap, callback);
    },
    JS_setWriteLogFlag: function(flag, callback) { //设置写入日志的标记
        var dataMap = {
            uuid: this.wsControl.uuid,
            bWriteFlag: flag
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_SetWriteLogFlag', dataMap, callback);
    },
    JS_loginCloud: function(data, callback) { //用户登录云账户
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_LoginCloud', data, callback);
    },
    JS_loginCloudDevice: function(data, callback) { //云端设备登录
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_LoginCloudDevice_V30', data, callback);
    },
    JS_findCloudDevListEx: function(UserID, callback) { //查询云端账户设备列表
        var dataMap = {
            uuid: this.wsControl.uuid,
            UserID: UserID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindCloudDevList', dataMap, callback);
    },
    JS_findNextCloudDevInfoEx: function(findHandle, callback) { //逐个获取查找到的设备信息
        var dataMap = {
            uuid: this.wsControl.uuid,
            findHandle: findHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindNextCloudDevInfo', dataMap, callback);
    },
    JS_findCloseCloudDevListEx: function(findHandle, callback) { //关闭查找 云端设备列表,释放资源
        var dataMap = {
            uuid: this.wsControl.uuid,
            findHandle: findHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindCloseCloudDevList', dataMap, callback);
    },
    JS_findNextDevChn: function(findHandle, callback) { //逐个获取查找到的 设备通道 信息
        var dataMap = {
            uuid: this.wsControl.uuid,
            findHandle: findHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindNextDevChn', dataMap, callback);
    },
    JS_findCloseDevChn: function(findHandle, callback) { //关闭查找 设备通道信息，释放资源
        var dataMap = {
            uuid: this.wsControl.uuid,
            findHandle: findHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindCloseDevChn', dataMap, callback);
    },
    JS_saveRealData: function(data, callback) { //本地录像
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_SaveRealData', data, callback);
    },
    JS_stopSavaRealData: function(resID, callback) { //停止本地录像
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_StopSavaRealData', dataMap, callback);
    },
    JS_capturePicture: function(data, callback) { //实况抓拍
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_CapturePicture', data, callback);
    },
    JS_openSound: function(resID, callback) { //开启声音
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_OpenSound', dataMap, callback);
    },
    JS_closeSound: function(resID, callback) { //关闭声音
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_CloseSound', dataMap, callback);
    },
    JS_setSoundVolume: function(data, callback) { //调节扬声器音量
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_SetSoundVolume', data, callback);
    },
    JS_getSoundVolume: function(resID, callback) { //获取扬声器音量
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_GetSoundVolume', dataMap, callback);
    },
    JS_pTZControl: function(data, callback) { //云台控制操作
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_PTZControl', data, callback);
    },
    JS_stopPlayback: function(resID, callback) { //停止回放业务
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_StopPlayback', dataMap, callback);
    },
    JS_findFile: function(data, callback) { //查找设备录像文件列表
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_FindFile', data, callback);
    },
    JS_findNextFile: function(findHandle, callback) { //逐个获取查找到的文件信息
        var dataMap = {
            uuid: this.wsControl.uuid,
            findHandle: findHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindNextFile', dataMap, callback);
    },
    JS_findClose: function(findHandle, callback) { //关闭文件查找,释放资源
        var dataMap = {
            uuid: this.wsControl.uuid,
            findHandle: findHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_FindClose', dataMap, callback);
    },
    JS_playBack: function(data, callback) { //按时间回放录像文件,释放资源
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_PlayBack', data, callback);
    },
    JS_getFileByTime: function(data, callback) { //按时间下载录像文件
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_GetFileByTime', data, callback);
    },
    JS_stopDownload: function(downloadHandle, callback) { //停止下载录像文件
        var dataMap = {
            uuid: this.wsControl.uuid,
            downloadHandle: downloadHandle
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_StopDownload', dataMap, callback);
    },
    JS_playBackControl: function(data, callback) { //控制录像回放的状态
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_PlayBackControl', data, callback);
    },
    JS_getPTZPresetList: function(UserID, dwChannelID, callback) { //获取云台预置位列表
        var dataMap = {
            uuid: this.wsControl.uuid,
            dwChannelID: dwChannelID,
            UserID: UserID
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_GetPTZPresetList', dataMap, callback);
    },
    JS_pTZPreset: function(data, callback) { //云台预置位操作
        data.uuid = this.wsControl.uuid;
        return this.wsControl.wsObj.sendMsg('NETDEV_PTZPreset', data, callback);
    },
    JS_enable3DPosition: function(resID, bEnabled, callback) { //设置3D定位开关
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID,
            bEnabled: bEnabled
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_Enable3DPosition', dataMap, callback);
    },
    JS_enablePtzCtrl: function(resID, bEnabled, callback) { //设置PTZ开关
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID,
            bEnabled: bEnabled
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_EnablePtzCtrl', dataMap, callback);
    },
    JS_enableDigitalZoom: function(resID, bEnabled, callback) { //设置数字放大开关
        var dataMap = {
            uuid: this.wsControl.uuid,
            resID: resID,
            bEnabled: bEnabled
        };
        return this.wsControl.wsObj.sendMsg('NETDEV_EnableDigitalZoom', dataMap, callback);
    }

});
