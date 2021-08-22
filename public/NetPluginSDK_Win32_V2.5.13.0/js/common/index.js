var Index = function ($) {
    var mainClass = Class.extend({
        recordlivename: 0,
        videotypejsonMap: [],      //视频类型对象数组
        livevideojsonMap: [],      //实况流对象数组
        playbackvideojsonMap: [],  //回放流对象数组
        initOcxWindownum: 4,       //控件默认开启窗口个数
        ocxHeight: "400px",        //控件默认高度
        islocallogin: false,       //是否本地登录标志位
        iscloudlogin: false,       //是否云端登录标志位
        EVMSjsonMap: [],           //一体机下加载的所有设备集合
        cloudEVMSjsonMap: [],      //云端一体机下加载的所有设备集合
        CLOUDjsonMap: [],          //云端所有设备
        queryjsonMap: [],          //查询结果集合
        ip: null,
        port: null,
        username: null,
        password: null,
        protocol: null,
        devicetype: null,
        clouddevicetype: null,
        channelList: null,
        localchalisttable: null,     //局域网通道表格对象
        localquerytable: null,       //查询视频录像表格对象
        clouddevlisttable: null,     //云账号登录设备列表表格对象
        clouddevchllisttable: null,  //云账号登录设备通道列表表格对象
        DeviceHandle: null,          //登录设备的凭证ID
        cloudDeviceHadle: null,      //云账号设备handle
        CloudHandle: null,           //云登录账号凭证ID
        queryHandle: null,           //查询所需凭证ID
        PlayBackBeginTime: null,     //回放开始时间标志位
        PlayBackEndTime: null,       //回放结束时间标志位
        DownLoadHandle: null,        //文件下载时间标志位
        gVideoDiv: 'playerContainer',//播放容器
        gWebControl: null, //插件管理对象
        gInitCount: 0, //尝试启动插件次数
	gFullScreen: true,  //全屏标记
        base64encodechars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        base64decodechars:  [
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
            52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
            -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
            -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],

        base64encode: function(str) {
            var out;
            var i;
            var len;
            var c1;
            var c2;
            var c3;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i == len) {
                    out += this.base64encodechars.charAt(c1 >> 2);
                    out += this.base64encodechars.charAt((c1 & 0x3) << 4);
                    out += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i == len) {
                    out += this.base64encodechars.charAt(c1 >> 2);
                    out += this.base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    out += this.base64encodechars.charAt((c2 & 0xF) << 2);
                    out += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                out += this.base64encodechars.charAt(c1 >> 2);
                out += this.base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += this.base64encodechars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                out += this.base64encodechars.charAt(c3 & 0x3F);
            }
            return out;
        },
        init: function () {
            this.destory_activex();
            this.initPage();
            this.initData();
            this.initEvent();
        },
        initPlugin: function() {
            var that = this;
            webPlugin.JS_CreateWebControl({
                ServerBeginPort: 19000,
                ServerEndPort: 19004,
                cbConnectSuccess: function (res) {
                    //utils.MSG.globalMsg('插件，启动成功！');
                    console.log("websocket connect success!");
                    webPlugin.JS_CreateWnd('playerContainer', function (res) {
                        if (res.code === 0) {
                            that.gWebControl = res.data;
                            try{
                                 that.splitControl();
                            }catch(e){}
                            window.initFlag = true;
                        } else {
                            that.gWebControl = null;
                            window.initFlag = false;
                        }
                        //utils.MSG.videoMsg(res.errMsg, gTabPage + '-status');
                        setTimeout(() => { $("#locallogin").click(); }, 500);
                    });
                }, cbConnectFail: function (err) {
                    //utils.MSG.globalMsg('插件未启动，正在尝试启动中，请稍后...');
                    console.log("websocket connect fail!");
                    utils.BROWER.weakUp('NetDEVPluginSDK:\\');
                    that.gInitCount++;
                    if (that.gInitCount < 3) {
                        setTimeout(that.initPlugin.apply(that), 3000); //间隔3秒钟，尝试连接一次websocket，最多3次
                    } else {
                        //utils.MSG.globalMsg('插件启动失败，请检查插件是否安装?');
                        console.log("websocket connect fail!");
                    }
                }, cbConnnectClose: function (msg) {
                    console.log("websocket connect close!");
                }
            })
        },
        initPage: function () {
            this.initPlugin();
        },
        splitControl: function() {
            var that = this;
            if (this.gWebControl != null) {
                var msg, icon;
                this.gWebControl.wndControl.JS_SetWndPos(0, this.initOcxWindownum, function (res) {
                    if (res.code === 0) {
                        msg = $.lang.tip["tipinitOcxsuc"];
                        icon = TIPS_TYPE.SUCCEED;
                    } else {
                        msg = $.lang.tip["tipinitOcxfail"];
                        icon = TIPS_TYPE.FAIL;
                    }
                    that.initPagebtn();
                    that.msgtipshow(msg, icon);
                })
            }
        },
        initPagebtn: function () {
            // 本地登录按钮
            $("#locallogin").attr("disabled", false);
            $("#localloginout").attr("disabled", true);
            $("#getlocallist").attr("disabled", true);
            //云端登录按钮
            $("#getclouddevlist").attr("disabled", true);
            $("#cloudDevLogin").attr("disabled", true);
            $("#cloudDevLoginout").attr("disabled", true);
            $("#cloudloginout").attr("disabled", true);
            $("#getdevcloudlist").attr("disabled", true);

            //FUN相关按钮
            $("#funBtn input[type='button']").attr("disabled", true);

            //preset相关按钮
            $("#presetBtn input[type='button']").attr("disabled", true);

            //QUERY相关按钮
            $("#queryBtn input[type='button']").attr("disabled", true);
            //日志按钮
            $("#openLog").attr("disabled", true);
            $("#closeLog").attr("disabled", true);

        },

        initloginoutbtn: function () {
            //FUN相关按钮
            $("#funBtn input[type='button']").attr("disabled", true);

            //preset相关按钮
            $("#presetBtn input[type='button']").attr("disabled", true);

            //QUERY相关按钮
            $("#queryBtn input[type='button']").attr("disabled", true);
            //日志按钮
            $("#openLog").attr("disabled", true);
            $("#closeLog").attr("disabled", true);
        },

        initData: function () {
            var that = this;

            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_setWriteLogFlag(0, function (res) {
                    if (0 === res.code) {
                        $("#downloadpathurldiv").addClass("hidden");
                    }
                    that.msgtipshow(msg, icon);
                })
            }

        },

        initEvent: function () {
            var _this = this;
            //局域网登录
            $("#locallogin").on("click", function () {
              /*
                _this.ip = $("#cameraIp").val();
                _this.port = Number($("#port").val());
                _this.username = $("#localusername").val();
                _this.password = _this.base64encode($("#localpassword").val());
                _this.protocol = Number($("#localprotocol").val());
                _this.devicetype = $("#localdeviceType").val();
                */
              _this.ip = GetQueryString("cameraIp");
              _this.port = 80;
              _this.username = "admin";
              _this.password = _this.base64encode("ctg2020+");
              _this.protocol = 1;
              _this.devicetype = 501;
                var loginJsonMap = {
                    "szIPAddr": _this.ip,
                    "dwPort": _this.port,
                    "szUserName": _this.username,
                    "szPassword": _this.password,
                    "dwLoginProto": _this.protocol,
                    "dwDeviceType": _this.devicetype
                };
                console.log(loginJsonMap);
                //var loginJsonstring = JSON.stringify(loginJsonMap);
                console.log("start login");
                _this.login(loginJsonMap);
            });

            $("#getlocallist").on("click", function () {
                _this.getChannellist();
                _this.bodyScroll();
            });

            $("#localloginout").on("click", function () {
                _this.loginOut()
                _this.bodyScroll();
            });

            /***********************云平台相关*********************/
            $("#cloudLogin").on("click", function () {
                var url = $("#cloudUrl").val();
                var cloudUsername = $("#cloudUsername").val();
                var cloudPwd = $("#cloudPwd").val();
                _this.cloudlogin(url, cloudUsername, cloudPwd);
            });

            $("#cloudloginout").on("click", function () {
                _this.cloudloginout();
            });

            $("#getclouddevlist").on("click", function () {
                _this.GetCloudDevList();
            });

            $("#cloudDevLogin").on("click", function () {
                _this.cloudDevLogin();
            });

            $("#cloudDevLoginout").on("click", function () {
                _this.cloudDevLoginout();
            });

            $("#getdevcloudlist").on("click", function () {
                _this.getcloudChannellist()
            });

            /*******************视频相关事件*********************/
            $("#startvideo").on("click", function () {
                _this.startVideo();
            });

            $("#closevideo").on("click", function () {
                _this.stopVideo();
                //滚动条滑动，避免视频存留一帧
                _this.bodyScroll();
            });

            $("#startRecord").on("click", function () {
                _this.startRecord();
            });

            $("#stopRecord").on("click", function () {
                _this.stopRecord();
            });

            $("#opensound").on("click", function () {
                _this.opensound();
            });

            $("#closesound").on("click", function () {
                _this.closesound();
            });

            $("#getsound").on("click", function () {
                _this.getsound();
            });

            $("#setsound").on("click", function () {
                _this.setsound();
            });

            $("#snapshot").on("click", function () {
                _this.snapshot();
            });
            /*******************云台操作*********************/
            $("#presetul").bind("click", function (e) {
                var id = e.target.id;
                _this.presetOperation(id);
            });

            $("#getPreset").on("click", function () {
                _this.PTZ_GetPreset();
            });

            $("#setpreset").on("click", function () {
                _this.PTZ_SetPreset();
            });

            $("#gotpreset").on("click", function () {
                _this.PTZ_GotoPreset();
            });

            $("#deletepreset").on("click", function () {
                _this.PTZ_DeletePreset();
            });
            /********************查询************************/
            $("#commonquery").on("click", function () {
                _this.commonQuery();
            });

            $("#FindAll").on("click", function () {
                _this.queryjsonMap = [];
                _this.findall();
            });

            $("#findNextfile").on("click", function () {
                _this.findNextfile();
            });

            $("#closefind").on("click", function () {
                _this.closefind();
            });

            $("#byTime").on("click", function () {
                _this.playbackbytime();
            });

            $("#stopbytime").on("click", function () {
                _this.stopplayback();
                _this.bodyScroll();
            });

            $("#downloadbytime").on("click", function () {
                _this.downloadbytime();
            });

            $("#stopdownload").on("click", function () {
                _this.stopdownload();
            });

            $("#getprogress").on("click", function () {
                _this.GetProgress();
            });

            $("#setprogress").on("click", function () {
                _this.SetProgress();
            });

            $("#resumeprogress").on("click", function () {
                _this.resumeProgress();
            });

            $("#pauseprogress").on("click", function () {
                _this.Pauseprogress();
            });

            /********************日志************************/

            $("#setlogpath").on("click", function () {
                _this.setlogpath();

            });
            $("#closeLog").on("click", function () {
                _this.CloseLog();
            });
            $("#openLog").on("click", function () {
                _this.OpenLog();
            });
        },

        /*************************************** 本地登录 相关 **********************************/
        // 局域网登录
        login: function (data) {
            var msg;
            var icon;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_devLogin(data, function (res) {
                    if (0 !== res.code) {
                        msg = $.lang.tip["tiploginfail"];
                        icon = TIPS_TYPE.FAIL;
                    } else {
                        var result = res.data;
                        that.DeviceHandle = result.UserID;
                        msg = $.lang.tip["tiploginsuc"];
                        icon = TIPS_TYPE.SUCCEED;
                        //$("#playerContainer").css("height", that.ocxHeight);
                        //成功页面展现逻辑
                        that.locallognsucPage();
                        //屏蔽云登录
                        $("#cloudLogin").attr("disabled", true);
                      $("#startvideo").click();
                      console.log("login succesful");
                    }
                    //that.msgtipshow(msg, icon);
                })
            }
        },

        locallognsucPage: function () {
            $("#locallogin").attr("disabled", true);
            $("#localloginout").attr("disabled", false);
            $("#getlocallist").attr("disabled", false);
        },

        funprequebtnInit: function () {
            //FUN相关按钮
            $("#funBtn input[type='button']").attr("disabled", false);
            // $("#startvideo").attr("disabled", false);

            //preset相关按钮
            $("#presetBtn input[type='button']").attr("disabled", false);

            //QUERY相关按钮
            $("#queryBtn input[type='button']").attr("disabled", false);
        },
         initchlData: function(SDKRet) {
             var msg, icon;
             var tableHeight;
             if (SDKRet) {
                 var str = '<table id="girdTable"></table>';
                 $("#girdtableDiv").html(str);
                 var jsonMap = utils.objectClone(SDKRet);
                 var dataMap = utils.objectClone(jsonMap);
                 for (var i = 0; i < dataMap["VideoChlList"]; i++) {
                     // for (var key in dataMap["VideoChlList"][i]) {
                     //     if (key == "bPtzSupported") {
                     //
                     //     }
                     // }
                 }
                 var tableDatas;
                 var gridSetting;
                 var colmodelwidth = "80px";
                 if (this.devicetype == deviceTypestr.IPC || this.devicetype == deviceTypestr.NVR) {
                     tableDatas = jsonMap["VideoChlList"];
                     if (this.devicetype == deviceTypestr.IPC) {
                         tableHeight = 300;
                     } else if (this.devicetype == deviceTypestr.NVR) {
                         tableHeight = 300;
                     }
                     gridSetting = {
                         datatype: "local",
                         width: 1200,
                         height: tableHeight,
                         colNames: [
                             "是否支持云台",
                             "通道ID",
                             "设备类型",
                             "端口号",
                             "流个数",
                             // "IP地址类型",
                             // "通道类型",
                             "通道状态",
                             // "视频输入制式",
                             "通道名称",
                             "设备型号",
                             "IP地址"
                         ],
                         colModel: [
                             {name: "bPtzSupported", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwChannelID", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwDeviceType", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwPort", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwStreamNum", align: "center", width: colmodelwidth, sortable: false},
                             // {name: "enAddressType", align: "center", width: colmodelwidth, sortable: false},
                             // {name: "enChannelType", align: "center", width: colmodelwidth, sortable: false},
                             {name: "enStatus", align: "center", width: colmodelwidth, sortable: false},
                             // {name: "enVideoFormat", align: "center", width: colmodelwidth, sortable: false},
                             {name: "szChnName", align: "center", sortable: false},
                             {name: "szDeviceModel", align: "center", sortable: false},
                             {name: "szIPAddr", align: "center", sortable: false}
                         ]
                     };
                 } else {
                     tableDatas = this.EVMSjsonMap;
                     gridSetting = {
                         datatype: "local",
                         width: 1200,
                         height: 300,
                         colNames: [
                             "通道名称",
                             "是否支持云台",
                             "支持最大流个数",
                             "通道ID",
                             "通道状态"
                         ],
                         colModel: [
                             {name: "szChnName", align: "center", width: colmodelwidth, sortable: false},
                             {name: "bSupportPTZ", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwMaxStream", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwChannelID", align: "center", width: colmodelwidth, sortable: false},
                             {name: "dwChnStatus", align: "center", width: colmodelwidth, sortable: false}
                         ]
                     };
                 }
                 msg = $.lang.tip["getlocallistsuc"];
                 icon = TIPS_TYPE.SUCCEED;
             } else {
                 msg = $.lang.tip["getlocallistfail"];
                 icon = TIPS_TYPE.FAIL;
             }
             if (!tableDatas) {
                 return;
             }
             this.createTable(gridSetting, tableDatas, "girdTable");
             this.msgtipshow(msg, icon);
             //获取设备列表成功，按钮启用
             this.funprequebtnInit();
         },
        //获取通道列表
        getChannellist: function () {
            var SDKRet;
            var that = this;
            if (this.devicetype == deviceTypestr.IPC || this.devicetype == deviceTypestr.NVR) {
                if (this.gWebControl != null) {
                    this.gWebControl.SDKControl.JS_chlList(this.DeviceHandle, function (res) {
                        if (0 !== res.code) {
                            that.msgtipshow($.lang.tip["getlocallistfail"], TIPS_TYPE.FAIL);
                            return;
                        } else {
                            that.initchlData(res.data);
                        }
                    })
                }
            } else if (this.devicetype == deviceTypestr.EVMS) {
                if (this.gWebControl != null) {
                    this.gWebControl.SDKControl.JS_findDevChnList(this.DeviceHandle, function (res) {
                        if (0 !== res.code) {
                            that.msgtipshow($.lang.tip["getlocallistfail"], TIPS_TYPE.FAIL);
                            return;
                        } else {
                            that.EVMSjsonMap = [];
                            that.getevmsdevicelist(res.data.findHandle);
                        }
                    })
                }
            }

        },

        //一体机循环调用
        getevmsdevicelist: function (FindHandle) {
            var SDKRet;
            var msg;
            var icon;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findNextDevChn(FindHandle, function (res) {
                    if (0 !== res.code) {
                        that.gWebControl.SDKControl.JS_findCloseDevChn(FindHandle, function (res) {
                            if (res.code == 0) {
                                msg = $.lang.tip["getlocallistsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                that.initchlData(true);
                            } else {
                                msg = $.lang.tip["getlocallistfail"];
                                icon = TIPS_TYPE.FAIL;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    } else {
                        SDKRet = res.data;
                        var oneData = utils.objectClone(SDKRet);
                        oneData["szChnName"] = SDKRet["szChnName"];
                        oneData["dwChannelID"] = SDKRet["dwChannelID"];
                        oneData["dwChnType"] = SDKRet["dwChnType"];
                        oneData["dwChnStatus"] = SDKRet["dwChnStatus"];
                        that.EVMSjsonMap.push(oneData);
                        that.getevmsdevicelist(FindHandle);
                    }
                })
            }
        },

        //创建表格
        createTable: function (gridSetting, data, girdid) {
            var $grid = $("#" + girdid);
            if (girdid == "girdTable") {
                this.localchalisttable = $grid;
            }
            if (girdid == "querytable") {
                this.localquerytable = $grid;
            }
            if (girdid == "clouddevgirdTable") {
                this.clouddevlisttable = $grid;
            }

            if (girdid == "clouddevchllisttable") {
                this.clouddevchllisttable = $grid;
            }

            $grid.jqGrid(gridSetting);
            $grid.jqGrid(gridSetting);
            $grid.jqGrid("clearGridData");
            for (var i = 0; i < data.length; i++) {
                $grid.jqGrid('addRowData', i + 1, data[i]);
            }
        },

        loginOut: function () {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_devLoginOut(this.DeviceHandle, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow($.lang.tip["userlogoutFail"], TIPS_TYPE.FAIL);
                    } else {
                        that.DeviceHandle = -1;
                        that.msgtipshow($.lang.tip["userlogoutSuc"], TIPS_TYPE.SUCCEED);
                    }
                })

                that.loginoutbtnstyle();
                //退出之后登录操作input输入框值为空
                $("#cameraIp").val("");
                $("#port").val("");
                $("#localusername").val("");
                $("#localpassword").val("");

                //时间选择器输入框清空
                $("#startQuerytime").val("");
                $("#endQuerytime").val("");
                $("#getprogresstime").val("");
                $("#setprogresstime").val("");

                //录像、截图、下载回放路径隐藏
                $("#recordfiledispaly").addClass("hidden");
                $("#snapshoturldiv").addClass("hidden");
                $("#downloadpathurldiv").addClass("hidden");
                that.loginoutstopvideo();

                //放开云登录限制
                $("#cloudLogin").attr("disabled", false);
                that.initloginoutbtn();
                if (that.localchalisttable) {
                    that.destoryTable("girdTable");
                }
                if (that.localquerytable) {
                    that.destoryTable("querytable");
                }
            }
        },

        loginoutstopvideo: function () {
            for (var i = 0; i < this.videotypejsonMap.length; i++) {
                if (this.videotypejsonMap[i] == null) {
                    continue;
                } else {
                    if (this.videotypejsonMap[i]["streamtype"] == videostreamtype["live"]) {
                        this.livevideojsonMap.push(this.videotypejsonMap[i]["screenNum"]);
                    }
                    if (this.videotypejsonMap[i]["streamtype"] == videostreamtype["playback"]) {
                        this.playbackvideojsonMap.push(this.videotypejsonMap[i]["screenNum"]);
                    }
                }
            }
            if (this.livevideojsonMap.length != 0) {
                for (var j = 0; j < this.livevideojsonMap.length; j++) {
                    this.stoponevideo(this.livevideojsonMap[j]);
                }
            }

            if (this.playbackvideojsonMap.length != 0) {
                for (var k = 0; k < this.playbackvideojsonMap.length; k++) {
                    this.stoponeplaybackvideo(this.playbackvideojsonMap[k]);
                }
            }

        },
        loginoutbtnstyle: function () {
            $("#getlocallist").attr("disabled", true);
            $("#locallogin").attr("disabled", false);
            $("#localloginout").attr("disabled", true);
        },

        /********************************** 本地登录 End ************************************/

        /********************************** 云账号相关 Begin ************************************/
        // 宇视云登录
        cloudlogin: function (cloudUrl, cloudUser, cloudPwd) {
            var msg, icon;
            var that = this;
            var dataMap = {
                szCloudSrvUrl: cloudUrl,
                szUserName: cloudUser,
                szPassword: that.base64encode(cloudPwd)
            }
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_loginCloud(dataMap, function (res) {
                    if (0 !== res.code) {
                        msg = $.lang.tip["tipcloudloginfail"];
                        icon = TIPS_TYPE.FAIL;
                    } else {
                        that.CloudHandle = res.data.UserID;
                        msg = $.lang.tip["tipcloudloginsuc"];
                        icon = TIPS_TYPE.SUCCEED;
                        $("#playerContainer").css("height", "400px");
                        //云登录页面样式更改
                        that.cloudloginbtn();
                        //屏蔽本地登录按钮
                        $("#locallogin").attr("disabled", true);
                    }
                    that.msgtipshow(msg, icon);
                })
            }
        },

        cloudloginout: function () {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_devLoginOut(this.CloudHandle, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow($.lang.tip["userlogoutFail"], TIPS_TYPE.FAIL);
                        return;
                    } else {
                        that.CloudHandle = -1;
                        that.DeviceHandle = -1;
                        //恢复本地登录状态
                        $("#locallogin").attr("disabled", false);
                        //登出后按钮状态更改
                        that.cloudloginoutbtnstyle();
                        that.msgtipshow($.lang.tip["userlogoutSuc"], TIPS_TYPE.SUCCEED);
                        that.initloginoutbtn();

                        //时间选择器输入框清空
                        $("#startQuerytime").val("");
                        $("#endQuerytime").val("");
                        $("#getprogresstime").val("");
                        $("#setprogresstime").val("");

                        // //清空设备登录信息
                        // $("#cloudUrl").val("");
                        // $("#cloudUsername").val("");
                        // $("#cloudPwd").val("");

                        $("#cloudDevName").val("");
                        $("#cloudDevPwd").val("");

                        //录像、截图、下载回放路径隐藏
                        $("#recordfiledispaly").addClass("hidden");
                        $("#snapshoturldiv").addClass("hidden");
                        $("#downloadpathurldiv").addClass("hidden");
                        that.loginoutstopvideo();
                        //删除已创建表格
                        if (that.clouddevlisttable) {
                            that.destoryTable("clouddevgirdTable");
                        }
                        if (that.clouddevchllisttable) {
                            that.destoryTable("clouddevchllisttable");
                        }
                        if (that.localquerytable) {
                            that.destoryTable("querytable");
                        }
                    }
                })
            }
        },

        cloudloginoutbtnstyle: function () {
            $("#cloudLogin").attr("disabled", false);
            $("#cloudloginout").attr("disabled", true);
            $("#getclouddevlist").attr("disabled", true);
            $("#cloudDevLogin").attr("disabled", true);
            $("#cloudDevLoginout").attr("disabled", true);
            $("#getdevcloudlist").attr("disabled", true);
        },

        cloudloginbtn: function () {
            $("#cloudLogin").attr("disabled", true);
            $("#getclouddevlist").attr("disabled", false);
            $("#cloudloginout").attr("disabled", false);
        },

        initCloudGrid: function() {
            var colmodelwidth = "80px";
            var str = '<table id="clouddevgirdTable"></table>';
            $("#clouddevgirdTablediv").html(str);
            //创建云账号表格
            var cloudgridSetting = {
                datatype: "local",
                width: 1200,
                height: 300,
                colNames: [
                    "设备名称",
                    "设备用户名",
                    "设备型号",
                    "序列号",
                    "IP地址"
                ],
                colModel: [
                    {name: "szDevName", align: "center", width: colmodelwidth, sortable: false},
                    {name: "szDevUserName", align: "center", width: colmodelwidth, sortable: false},
                    {name: "szDevModel", align: "center", width: colmodelwidth, sortable: false},
                    {name: "szDevSerialNum", align: "center", width: colmodelwidth, sortable: false},
                    {name: "szIPAddr", align: "center", width: colmodelwidth, sortable: false}
                ]
            };
            this.createTable(cloudgridSetting, this.CLOUDjsonMap, "clouddevgirdTable");
            this.cloudDevsucpage();
        },
        //获取云登陆列表
        GetCloudDevList: function () {
            var that = this;
            this.CLOUDjsonMap = [];
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findCloudDevListEx(this.CloudHandle, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow($.lang.tip["tipcloudloginfail"], TIPS_TYPE.FAIL);
                        return;
                    } else {
                        that.msgtipshow($.lang.tip["tipcloudlistsuc"], TIPS_TYPE.SUCCEED);
                        that.getcloudlists(res.data.findHandle);
                    }
                })
            }
        },

        cloudDevsucpage: function () {
            $("#cloudDevLogin").attr("disabled", false);
        },

        // 获取云端设备列表
        getcloudlists: function (Findle) {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findNextCloudDevInfoEx(Findle, function (res) {
                    if (0 !== res.code) {
                        that.gWebControl.SDKControl.JS_findCloseCloudDevListEx(Findle, function (res) {
                            if (res.code == 0) {
                                msg = $.lang.tip["getlocallistsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                that.initCloudGrid();
                            } else {
                                msg = $.lang.tip["getlocallistfail"];
                                icon = TIPS_TYPE.FAIL;
                            }
                            that.msgtipshow(msg, icon);
                        })

                    } else {
                        that.CLOUDjsonMap.push(res.data);
                        that.getcloudlists(Findle);
                    }
                })
            }
        },

        cloudDevLogin: function () {
            var devName = $("#cloudDevName").val();
            this.clouddevicetype = $("#cloudDevType").val();
            var protocol = Number($("#cloudprotocol").val());
            var password = this.base64encode($("#cloudDevPwd").val());
            var that = this;
            var cloudSDKRet;
            var dataMap = {
                szDeviceName: devName,
                szDevicePassword: password,
                dwLoginProto: protocol,
                dwT2UTimeout: 0,
                UserID: this.CloudHandle
            };
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_loginCloudDevice(dataMap, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow($.lang.tip["tiploginfail"], TIPS_TYPE.FAIL);
                        return;
                    } else {
                        cloudSDKRet = res.data;
                        that.cloudDeviceHadle = cloudSDKRet["UserID"];
                        that.DeviceHandle = cloudSDKRet["UserID"];
                        //页面样式更改
                        $("#cloudDevLoginout").attr("disabled", false);
                        $("#cloudDevLogin").attr("disabled", true);
                        $("#getdevcloudlist").attr("disabled", false);
                        that.msgtipshow($.lang.tip["tiploginsuc"], TIPS_TYPE.SUCCEED);
                    }
                })
            }
        },


        cloudDevLoginout: function () {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_devLoginOut(this.DeviceHandle, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow($.lang.tip["userlogoutFail"], TIPS_TYPE.FAIL);
                        return;
                    } else {
                        that.DeviceHandle = -1;
                        that.msgtipshow($.lang.tip["userlogoutSuc"], TIPS_TYPE.SUCCEED);
                        $("#cloudDevLogin").attr("disabled", false);
                        $("#cloudDevLoginout").attr("disabled", true);
                        $("#getdevcloudlist").attr("disabled", true);
                        if (that.clouddevchllisttable) {
                            that.destoryTable("clouddevchllisttable");
                        }
                        if (that.localquerytable) {
                            that.destoryTable("querytable");
                        }
                    }
                })
            }
        },

        getcloudevmsdevicelist: function (FindHandle) {
            var SDKRet;
            var msg;
            var icon;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findNextDevChn(FindHandle, function (res) {
                    if (0 !== res.code) {
                        that.gWebControl.SDKControl.JS_findCloseDevChn(FindHandle, function (res) {
                            if (res.code == 0) {
                                msg = $.lang.tip["getlocallistsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                that.initCloudChlData(true);
                            } else {
                                msg = $.lang.tip["getlocallistfail"];
                                icon = TIPS_TYPE.FAIL;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    } else {
                        SDKRet = res.data;
                        var oneData = utils.objectClone(SDKRet);
                        oneData["szChnName"] = SDKRet["szChnName"];
                        oneData["dwChannelID"] = SDKRet["dwChannelID"];
                        oneData["dwChnType"] = SDKRet["dwChnType"];
                        oneData["dwChnStatus"] = SDKRet["dwChnStatus"];
                        that.cloudEVMSjsonMap.push(oneData);
                        that.getcloudevmsdevicelist(FindHandle);
                    }
                })
            }
        },
        initCloudChlData: function(SDKRet) {
            this.funprequebtnInit();
            var msg, icon;
            var tableHeight;
            if (SDKRet) {
                var str = '<table id="clouddevchllisttable"></table>';
                $("#clouddevlisttableDiv").html(str);
                var jsonMap = utils.objectClone(SDKRet);
                var tableDatas;
                var gridSetting;
                var colmodelwidth = "80px";
                if (this.clouddevicetype == deviceTypestr.IPC || this.clouddevicetype == deviceTypestr.NVR) {
                    tableDatas = jsonMap["VideoChlList"];
                    if (this.clouddevicetype == deviceTypestr.IPC) {
                        tableHeight = 300;
                    } else if (this.clouddevicetype == deviceTypestr.NVR) {
                        tableHeight = 300;
                    }
                    gridSetting = {
                        datatype: "local",
                        width: 1200,
                        height: tableHeight,
                        colNames: [
                            "是否支持云台",
                            "通道ID",
                            "设备类型",
                            "端口号",
                            "流个数",
                            // "IP地址类型",
                            // "通道类型",
                            "通道状态",
                            // "视频输入制式",
                            "通道名称",
                            "设备型号",
                            "IP地址"
                        ],
                        colModel: [
                            {name: "bPtzSupported", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwChannelID", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwDeviceType", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwPort", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwStreamNum", align: "center", width: colmodelwidth, sortable: false},
                            // {name: "enAddressType", align: "center", width: colmodelwidth, sortable: false},
                            // {name: "enChannelType", align: "center", width: colmodelwidth, sortable: false},
                            {name: "enStatus", align: "center", width: colmodelwidth, sortable: false},
                            // {name: "enVideoFormat", align: "center", width: colmodelwidth, sortable: false},
                            {name: "szChnName", align: "center", sortable: false},
                            {name: "szDeviceModel", align: "center", sortable: false},
                            {name: "szIPAddr", align: "center", sortable: false}
                        ]
                    };
                } else {
                    tableDatas = this.cloudEVMSjsonMap;
                    gridSetting = {
                        datatype: "local",
                        width: 1200,
                        height: 300,
                        colNames: [
                            "通道名称",
                            "是否支持云台",
                            "支持最大流个数",
                            "通道ID",
                            "通道状态"
                        ],
                        colModel: [
                            {name: "szChnName", align: "center", width: colmodelwidth, sortable: false},
                            {name: "bSupportPTZ", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwMaxStream", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwChannelID", align: "center", width: colmodelwidth, sortable: false},
                            {name: "dwChnStatus", align: "center", width: colmodelwidth, sortable: false}
                        ]
                    };
                }
                msg = $.lang.tip["getlocallistsuc"];
                icon = TIPS_TYPE.SUCCEED;
            } else {
                msg = $.lang.tip["getlocallistfail"];
                icon = TIPS_TYPE.FAIL;
            }
            if (!tableDatas) {
                return;
            }
            this.createTable(gridSetting, tableDatas, "clouddevchllisttable");
            this.msgtipshow(msg, icon);
            //获取设备列表成功，按钮启用
            this.funprequebtnInit();
        },

        getcloudChannellist: function () {
            var SDKRet;
            var that = this;
            if (this.clouddevicetype== deviceTypestr.IPC || this.clouddevicetype== deviceTypestr.NVR) {
                if (this.gWebControl != null) {
                    this.gWebControl.SDKControl.JS_chlList(this.cloudDeviceHadle, function (res) {
                        if (0 !== res.code) {
                            that.msgtipshow($.lang.tip["getlocallistfail"], TIPS_TYPE.FAIL);
                            return;
                        } else {
                            that.initCloudChlData(res.data);
                        }
                    })
                }
            } else if (this.clouddevicetype== deviceTypestr.EVMS) {
                if (this.gWebControl != null) {
                    this.gWebControl.SDKControl.JS_findDevChnList(this.DeviceHandle, function (res) {
                        if (0 !== res.code) {
                            that.msgtipshow($.lang.tip["getlocallistfail"], TIPS_TYPE.FAIL);
                            return;
                        } else {
                            that.cloudEVMSjsonMap= [];
                            that.getcloudevmsdevicelist(res.data.findHandle);
                            that.initCloudChlData(res.data);
                        }
                    })
                }
            }
        },
        /********************************** 云账号相关 end ************************************/
        //提示信息
        msgtipshow: function (msg, icon) {
            MSG.msgbox.show(msg, icon, 3000, 61, "errormsg");
        },

        /*************************************** 实况相关 Begin **********************************/
        //播放视频
        startVideo: function () {
            var msg;
            var icon;
            //var channelValue = Number($("#DevchannelID").val());
            var channelValue = Number(GetQueryString("DevchannelID"));
            console.log("channel id: " + channelValue);
            var ResourceId = 0;
            var that = this;
            if (channelValue == "") {

            }
            var dataMap = {
                dwChannelID: channelValue,
                dwStreamType: LiveStream.LIVE_STREAM_INDEX_MAIN,
                dwLinkMode: Protocal.TRANSPROTOCAL_RTPTCP,
                dwFluency: 0
            };

            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 !== res.code) {

                    } else {
                        ResourceId = res.data.lResId;
                        //将窗口与流保存下来
                        var obj = {
                            streamtype: videostreamtype.live,
                            screenNum: ResourceId
                        };
                        that.videotypejsonMap[ResourceId] = obj;
                        dataMap.resID = parseInt(ResourceId);
                        dataMap.UserID = that.DeviceHandle;
                        that.gWebControl.SDKControl.JS_stopRealPlay(parseInt(ResourceId),function (res) {
                            that.gWebControl.SDKControl.JS_realPlay(dataMap,function (res) {
                                if (0 != res.code) {
                                    msg = $.lang.tip["tipstartvideofail"];
                                    icon = TIPS_TYPE.FAIL;
                                } else {
                                    msg = $.lang.tip["tipstartvideosuc"];
                                    icon = TIPS_TYPE.SUCCEED;
                                }
                                if (that.gWebControl != null) {
                                    that.gWebControl.SDKControl.JS_enablePtzCtrl(parseInt(ResourceId), true);
                                    that.gWebControl.SDKControl.JS_enableDigitalZoom(parseInt(ResourceId), false);
                                    that.gWebControl.SDKControl.JS_enable3DPosition(parseInt(ResourceId), false);
                                }
                                that.msgtipshow(msg, icon);
                            })
                        })
                    }
                })
            }
        },

        // startvideofunbtn: function () {
        //     $("#closevideo").attr("disabled", false);
        //     $("#startRecord").attr("disabled", false);
        //     $("#stopRecord").attr("disabled", false);
        //     $("#opensound").attr("disabled", false);
        //     $("#closesound").attr("disabled", false);
        //     $("#getsound").attr("disabled", false);
        //     $("#setsound").attr("disabled", false);
        //     $("#snapshot").attr("disabled", false);
        // },

        //关闭视频
        stopVideo: function () {
            var msg;
            var icon;
            var that = this;
            var ResourceId = 0;

            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 !== res.code) {

                    } else {
                        ResourceId = res.data.lResId;
                        that.videotypejsonMap[ResourceId] = null;
                        that.gWebControl.SDKControl.JS_stopRealPlay(parseInt(ResourceId),function (res) {
                            if (0 != res.code) {
                                msg = $.lang.tip["tipstopvideofail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip ["tipstopvideosuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                if (that.gWebControl != null) {
                                    that.gWebControl.SDKControl.JS_enableDigitalZoom(parseInt(ResourceId), false);
                                    that.gWebControl.SDKControl.JS_enable3DPosition(parseInt(ResourceId), false);
                                }
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        /******************************* 实况相关 END ***************************/

        /*************************************录像相关********************************/
        //开启本地录像
        startRecord: function () {
            var msg, icon, ResourceId;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        var map = {
                            resID: parseInt(ResourceId),
                            szFileName: "C:\\NETDEV\\Record\\record" + + new Date().valueOf(),
                            dwFormat: MediaFileFormat.MEDIA_FILE_MP4

                        }
                        that.gWebControl.SDKControl.JS_saveRealData(map,function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipstartRecordfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipstartRecordsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        //关闭本地录像
        stopRecord: function () {
            var msg, icon, ResourceId;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        that.gWebControl.SDKControl.JS_stopSavaRealData(ResourceId,function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipstopRecordfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipstopRecordsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                $("#recordfiledispaly").removeClass("hidden");
                                $("#recordfileurl").html("C:\\NETDEV\\Record");
                                that.recordlivename++;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },
        /**************************音频相关******************************************/
        //开启音频
        opensound: function () {
            var msg, icon, ResourceId;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        that.gWebControl.SDKControl.JS_openSound(parseInt(ResourceId),function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipstartsoundfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipstartsoundsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        //关闭音频
        closesound: function () {
            var msg, icon, ResourceId;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        that.gWebControl.SDKControl.JS_closeSound(parseInt(ResourceId),function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipstopsoundfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipstopsoundsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        //获取音频大小
        getsound: function () {
            var msg, icon, ResourceId;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        that.gWebControl.SDKControl.JS_getSoundVolume(parseInt(ResourceId),function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipstartsoundfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipgetsoundsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                $("#soundvalue").val(res.data.dwVolume);
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        //设置音频大小
        setsound: function () {
            var msg, icon, ResourceId;
            var that = this;
            var soundValue = $("#soundvalue").val();
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        var dataMap = {
                            resID: parseInt(ResourceId),
                            dwVolume: soundValue
                        }
                        that.gWebControl.SDKControl.JS_setSoundVolume(dataMap,function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipsetsoundfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipsetsoundsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },
        /********************************截图相关********************************/
        snapshot: function () {
            var msg, icon, ResourceId;
            var that = this;
            var snapshoturl = "C:\\NETDEV\\Pic";
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        var map = {
                            resID: parseInt(ResourceId),
                            szFileName: "C:\\NETDEV\\Pic\\snap" + new Date().valueOf(),
                            dwFormat: PictureFormat.PICTURE_JPG
                        }
                        that.gWebControl.SDKControl.JS_capturePicture(map,function (res) {
                            if (0 !== res.code) {
                                // 失败
                                msg = $.lang.tip["tipsnapshotfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                $("#snapshoturldiv").removeClass("hidden");
                                msg = $.lang.tip["tipsnapshotsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                $("#snapshoturl").html(snapshoturl);
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        /*********************************云台相关********************************/
        presetOperation: function (id) {
            var ptzcontrolcmd;
            var that = this;
            switch (id) {
                case "turnNW":
                    ptzcontrolcmd = PtzCmd.LEFTUP;
                    break;
                case "turnUP":
                    ptzcontrolcmd = PtzCmd.TILTUP;
                    break;
                case "turnNE":
                    ptzcontrolcmd = PtzCmd.RIGHTUP;
                    break;
                case "turnL":
                    ptzcontrolcmd = PtzCmd.PANLEFT;
                    break;
                case "turnSTOP":
                    ptzcontrolcmd = PtzCmd.ALLSTOP;
                    break;
                case "turnR":
                    ptzcontrolcmd = PtzCmd.PANRIGHT;
                    break;
                case "turnSW":
                    ptzcontrolcmd = PtzCmd.LEFTDOWN;
                    break;
                case "turnDN":
                    ptzcontrolcmd = PtzCmd.TILTDOWN;
                    break;
                case "turnSE":
                    ptzcontrolcmd = PtzCmd.RIGHTDOWN;
                    break;
            }

            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        var ResourceId = res.data.lResId;
                        var dataMap = {
                            resID: parseInt(ResourceId),
                            dwPresetCmd: ptzcontrolcmd,
                            dwSpeed: 5
                        }
                        that.gWebControl.SDKControl.JS_pTZControl(dataMap, function (res) {
                            if (0 !== res.code) {
                                var msg = $.lang.tip["tippresetturnfail"];
                                var icon = TIPS_TYPE.FAIL;
                                that.msgtipshow(msg, icon);
                            }
                        })
                    }
                })
            }


        },

        PTZ_GetPreset: function () {
            var msg, icon;
            var that = this;
            var channelID = Number($("#DevchannelID").val());
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_getPTZPresetList(this.DeviceHandle, channelID, function (res) {
                    if (0 !== res.code) {
                        $('#presetlistcontent').html("");
                        msg = $.lang.tip["tipgetpresetfail"];
                        icon = TIPS_TYPE.FAIL;
                    } else {
                        var presetIDSelect = $('#presetlistcontent');
                        var dwPresetID;
                        var szPresetName;
                        var optionStr = "";
                        var result = res.data;
                        for (var i = 0; i < result["dwSize"]; i++) {
                            dwPresetID = result["PresetList"][i]["dwPresetID"];
                            szPresetName = result["PresetList"][i]["szPresetName"];
                            optionStr += '<option value="' + dwPresetID + ',' + szPresetName + '">' + dwPresetID + '【' + szPresetName + '】</option>';
                        }
                        presetIDSelect.html(optionStr);
                        msg = $.lang.tip["tipgetpresetsuc"];
                        icon = TIPS_TYPE.SUCCEED;
                    }
                    that.msgtipshow(msg, icon);
                })
            }
        },

        PTZ_SetPreset: function () {
            var ResourceId;
            var msg, icon;
            var that = this;
            var presetID = $("#presetID").val();
            var presetName = $("#presetName").val();
            if (presetID < 1 || isNaN(presetID) || presetID > 255) {
                this.msgtipshow("presetID error", TIPS_TYPE.FAIL);
                return;
            }
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        var dataMap = {
                            resID: ResourceId,
                            dwPresetCmd: PresetCmd.SET_PRESET,
                            szPresetName: presetName,
                            dwPresetID: presetID
                        };
                        that.gWebControl.SDKControl.JS_pTZPreset(dataMap, function (res) {
                            if (0 !== res.code) {
                                msg = $.lang.tip["tipsetpresetfail"];
                                icon = TIPS_TYPE.FAIL;
                            } else {
                                msg = $.lang.tip["tipsetpresetsuc"];
                                icon = TIPS_TYPE.SUCCEED;
                                that.PTZ_GetPreset();
                            }
                            that.msgtipshow(msg, icon);
                        })
                    }
                })
            }
        },

        PTZ_GotoPreset: function () {
            var presetInfo = $("#presetlistcontent").val();
            if (!presetInfo) {
                this.msgtipshow("select presetID", TIPS_TYPE.CONFIRM);
                return;
            }
            var presetMap = presetInfo.split(",");
            var ResourceId;
            var presetID = presetMap[0];
            var presetName = presetMap[1];
            var that =this;

            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        var dataMap = {
                            resID: ResourceId,
                            dwPresetCmd: PresetCmd.GOTO_PRESET,
                            szPresetName: presetName,
                            dwPresetID: presetID
                        };
                        that.gWebControl.SDKControl.JS_pTZPreset(dataMap, function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("Preset control fail", TIPS_TYPE.FAIL);
                            }
                        })
                    }
                })
            }
        },

        PTZ_DeletePreset: function () {
            var presetInfo = $("#presetlistcontent").val();
            if (!presetInfo) {
                this.msgtipshow("select presetID", TIPS_TYPE.CONFIRM);
                return;
            }
            var ResourceId;
            var presetMap = presetInfo.split(",");
            var presetID = presetMap[0];
            var presetName = presetMap[1];
            var that =this;

            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        var dataMap = {
                            resID: ResourceId,
                            dwPresetCmd: PresetCmd.CLE_PRESET,
                            szPresetName: presetName,
                            dwPresetID: presetID
                        };
                        that.gWebControl.SDKControl.JS_pTZPreset(dataMap, function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("Preset control fail", TIPS_TYPE.FAIL);
                            } else {
                                that.PTZ_GetPreset();
                            }
                        })
                    }
                })
            }
        },

        /******************************* 查询相关 *********************************/
        queryclick: function () {
            WdatePicker({
                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                position: {top: -245}
            })
        },

        commonQuery: function () {
            var BeginTime = $("#startQuerytime").val();
            var EndTime = $("#endQuerytime").val();
            if (BeginTime == "" || EndTime == "") {
                this.msgtipshow($.lang.tip["tipinputsearchtime"], TIPS_TYPE.CONFIRM);
                return;
            }
            BeginTime = BeginTime.replace(/-/g, "/");
            EndTime = EndTime.replace(/-/g, "/");
            var vBeginTime = (new Date(BeginTime).getTime()) / 1000;
            var vEndTime = (new Date(EndTime).getTime()) / 1000;
            var channelID = $("#DevchannelID").val();
            var dataMap = {
                szFileName: 0,
                dwChannelID: channelID,
                dwFileType: EventType.ALL,
                tBeginTime: vBeginTime,
                tEndTime: vEndTime,
                dwRecordLocation: 1,
                UserID: this.DeviceHandle
            };
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findFile(dataMap, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow("Not find", TIPS_TYPE.CONFIRM);
                    } else {
                        that.queryHandle = res.data.findHandle;
                        that.msgtipshow("Find OK!Please Click 'Find All' button to Get File", TIPS_TYPE.SUCCEED);
                    }
                })
            }
        },

        findall: function () {
            var result;
            var tBeginTime;
            var tEndTime;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findNextFile(this.queryHandle, function (res) {
                    if (0 !== res.code) {
                        if (that.queryjsonMap.length == 0) {
                            that.msgtipshow("Not find", TIPS_TYPE.CONFIRM);
                        } else {
                            that.createQuerytable();
                            that.closefind();
                        }
                    } else {
                        result = res.data;
                        tBeginTime = that.changeMStoDate(result["tBeginTime"] * 1000);
                        tEndTime = that.changeMStoDate(result["tEndTime"] * 1000);
                        var dateobj = {
                            tBeginTime: tBeginTime,
                            tEndTime: tEndTime
                        };
                        that.queryjsonMap.push(dateobj);
                        that.findall();
                    }
                })
            }
        },

        createQuerytable: function () {
            var str = '<table id="querytable" class="querytable"></table>';
            $("#querytablediv").html(str);
            var width = Number($("#queryBtn").width());
            //创建查询结果表格
            var querygridSetting = {
                datatype: "local",
                width: width,
                height: 100,
                colNames: [
                    "开始时间",
                    "结束时间"
                ],
                colModel: [
                    {name: "tBeginTime", align: "center", width: 80, sortable: false},
                    {name: "tEndTime", align: "center", width: 80, sortable: false},
                ]
            };
            this.createTable(querygridSetting, this.queryjsonMap, "querytable");
        },

        changeMStoDate: function (ms) {
            var datedata = new Date(ms);
            // return datedata;
            return datedata.toLocaleString();
        },

        findNextfile: function () {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findNextFile(this.DeviceHandle, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow("Not find", TIPS_TYPE.CONFIRM);
                    } else {
                        var result = res.data;
                        that.PlayBackBeginTime = result.tBeginTime;
                        that.PlayBackEndTime = result.tEndTime;
                        var dataMap = {
                            BeginTime: that.getLocalTime(that.PlayBackBeginTime),
                            EndTime: that.getLocalTime(that.PlayBackEndTime)
                        };
                        var jsonStr = JSON.stringify(dataMap);
                        alert(jsonStr);
                    }
                })
            }
        },

        getLocalTime: function (nS) {
            return new Date(parseInt(nS) * 1000).toLocaleString().substr(0, 17)
        },

        closefind: function () {
            var msg, icon;
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_findClose(this.queryHandle, function (res) {
                    if (0 !== res.code) {
                        msg = "Find Fail";
                        icon = TIPS_TYPE.FAIL;
                    } else {
                        msg = "Find Success";
                        icon = TIPS_TYPE.SUCCEED;
                    }
                    that.msgtipshow(msg, icon);
                })
            }

        },

        playbackbytime: function () {
            var BeginTime = $("#startQuerytime").val();
            var EndTime = $("#endQuerytime").val();
            if (BeginTime == "" || EndTime == "") {
                this.msgtipshow($.lang.tip["tipinputsearchtime"], TIPS_TYPE.CONFIRM);
                return;
            }
            BeginTime = BeginTime.replace(/-/g, "/");
            EndTime = EndTime.replace(/-/g, "/");
            var vBeginTime = (new Date(BeginTime).getTime()) / 1000;
            var vEndTime = (new Date(EndTime).getTime()) / 1000;
            var channelID = $("#DevchannelID").val();
            var dataMap = {
                dwChannelID: channelID,
                tBeginTime: vBeginTime,
                tEndTime: vEndTime,
                dwLinkMode: Protocal.TRANSPROTOCAL_RTPTCP,
                dwFileType: EventType.ALL,
                dwPlaySpeed: 9,
                dwRecordLocation: 1,
                UserID: this.DeviceHandle
            };
            var that = this;


            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        var ResourceId = parseInt(res.data.lResId);
                        var obj = {
                            streamtype: videostreamtype.playback,
                            screenNum: ResourceId
                        };
                        that.videotypejsonMap[ResourceId] = obj;
                        dataMap.resID = ResourceId;
                        that.gWebControl.SDKControl.JS_stopPlayback(ResourceId);
                        that.gWebControl.SDKControl.JS_playBack(dataMap,function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("playback fail", TIPS_TYPE.FAIL);
                            }
                        })
                    }
                })
            }
        },

        stopplayback: function () {
            var that = this;

            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        var ResourceId = parseInt(res.data.lResId);
                        that.videotypejsonMap[ResourceId] = null;
                        that.gWebControl.SDKControl.JS_stopPlayback(ResourceId,function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("stop fail", TIPS_TYPE.FAIL);
                            }
                        })
                    }
                })
            }
        },

        downloadbytime: function () {
            var BeginTime = $("#startQuerytime").val();
            var EndTime = $("#endQuerytime").val();
            if (BeginTime == "" || EndTime == "") {
                this.msgtipshow($.lang.tip["tipinputsearchtime"], TIPS_TYPE.CONFIRM);
                return;
            }
            BeginTime = BeginTime.replace(/-/g, "/");
            EndTime = EndTime.replace(/-/g, "/");
            var vBeginTime = (new Date(BeginTime).getTime()) / 1000;
            var vEndTime = (new Date(EndTime).getTime()) / 1000;
            var channelID = Number($("#DevchannelID").val());
            var dataMap = {
                dwChannelID: channelID,
                tBeginTime: vBeginTime,
                tEndTime: vEndTime,
                dwLinkMode: Protocal.TRANSPROTOCAL_RTPTCP,
                dwFileType: EventType.ALL,
                dwDownloadSpeed: 3,
                dwRecordLocation: 1,
                UserID: this.DeviceHandle,
                szFileName: "C:\\NETDEV\\DownLoad\\record" + new Date().valueOf(),
                dwFormat: MediaFileFormat.MEDIA_FILE_MP4
            };
            var that = this;

            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_getFileByTime(dataMap, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow("Download fail", TIPS_TYPE.FAIL);
                    } else {
                        that.DownLoadHandle = res.data.downloadHandle;
                        that.msgtipshow("Downloading ... Please click 'stop download'button to save file", TIPS_TYPE.SUCCEED);
                    }
                })
            }

        },
        stopdownload: function () {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_stopDownload(this.DownLoadHandle, function (res) {
                    if (0 !== res.code) {
                        that.msgtipshow("stop fail", TIPS_TYPE.FAIL);
                    } else {
                        that.msgtipshow("Download succeed!", TIPS_TYPE.SUCCEED);
                        $("#downloadpathurl").html("C:\\NETDEV\\DownLoad");
                        $("#downloadpathurldiv").removeClass("hidden");
                    }
                    that.DownLoadHandle = null;
                })
            }
        },
        GetProgress: function () {
            var that = this;
            var ResourceId;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        if (null != that.DownLoadHandle) {
                            ResourceId = that.DownLoadHandle;

                        }
                        var dataMap = {
                            tPlayTime: 0,
                            dwSpeed: 0,
                            resID: ResourceId,
                            dwControlMode: PlayControl.NETDEV_PLAY_CTRL_GETPLAYTIME
                        };
                        that.gWebControl.SDKControl.JS_playBackControl(dataMap, function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("Not find", TIPS_TYPE.FAIL);
                            } else {
                                var result = res.data;
                                var PlayTime = result.tPlayTime;
                                var showplaytime = that.changeMStoDate(PlayTime * 1000);
                                $("#getprogresstime").val(showplaytime);
                            }
                        })
                    }
                })
            }
        },

        SetProgress: function () {
            var setprogresstime = $("#setprogresstime").val();
            if (setprogresstime == "") {
                this.msgtipshow($.lang.tip["tipinputsearchtime"], TIPS_TYPE.CONFIRM);
                return;
            }
            setprogresstime = setprogresstime.replace(/-/g, "/");
            var pullTime = parseInt((new Date(setprogresstime).getTime()) / 1000);
            var that = this;
            var ResourceId;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        var dataMap = {
                            tPlayTime: pullTime,
                            dwSpeed: 20,
                            resID: ResourceId,
                            dwControlMode: PlayControl.NETDEV_PLAY_CTRL_SETPLAYTIME
                        };
                        that.gWebControl.SDKControl.JS_playBackControl(dataMap, function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("Set Play Time Fail", TIPS_TYPE.FAIL);
                            } else {
                                that.msgtipshow("Set play Time Success", TIPS_TYPE.SUCCEED);
                            }
                        })
                    }
                })
            }
        },
        resumeProgress: function () {
            var that = this;
            var ResourceId;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        var dataMap = {
                            tPlayTime: 0,
                            dwSpeed: 0,
                            resID: ResourceId,
                            dwControlMode: PlayControl.NETDEV_PLAY_CTRL_RESUME
                        };
                        that.gWebControl.SDKControl.JS_playBackControl(dataMap, function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("Resume Fail", TIPS_TYPE.FAIL);
                            }
                        })
                    }
                })
            }
        },

        Pauseprogress: function () {
            var that = this;
            var ResourceId;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = parseInt(res.data.lResId);
                        var dataMap = {
                            tPlayTime: 0,
                            dwSpeed: 0,
                            resID: ResourceId,
                            dwControlMode: PlayControl.NETDEV_PLAY_CTRL_PAUSE
                        };
                        that.gWebControl.SDKControl.JS_playBackControl(dataMap, function (res) {
                            if (0 !== res.code) {
                                that.msgtipshow("Pause fail", TIPS_TYPE.FAIL);
                            }
                        })
                    }
                })
            }
        },
        /**************************停止所有播放流********************/
        stoponevideo: function (id) {
            this.gWebControl.SDKControl.JS_stopRealPlay(id);
        },

        /**************************停止播放单路回放流*******************/

        stoponeplaybackvideo: function (id) {
            this.gWebControl.SDKControl.JS_stopPlayback(id);
        },
        /**************************清理SDK并关闭线程********************/
        destory_activex: function () {
            var that = this;
            if (this.gWebControl != null) {
                this.gWebControl.wndControl.JS_GetFocus(function (res) {
                    if (0 === res.code) {
                        ResourceId = res.data.lResId;
                        that.gWebControl.SDKControl.JS_closeSound(parseInt(ResourceId),function (res) {
                            if (0 === res.code) {
                                that.gWebControl.SDKControl.JS_stopRealPlay(parseInt(ResourceId));
                                that.gWebControl === null;
                            }
                        })
                    }
                })
            }
        },
        eventCallback: function(res) {
            if (typeof res.msg === "undefined") return;
            switch (res.msg.MsgType) {
                case 2 : //鼠标点击事件
                    if (0x0203 === res.msg.info.lButtonAct) { //鼠标双击
			this.gWebControl.wndControl.JS_FullScreen(this.gFullScreen); // 双击全屏放大
			this.gFullScreen = !this.gFullScreen;
                    }
                    break;
            }
        },

        /******************************* 日志相关 BEGIN ***************************/
        /**
         * 开启日志
         * @constructor
         */
        OpenLog: function () {
            var msg;
            var icon;
            var that = this;

            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_setWriteLogFlag(1, function (res) {
                    if (-1 == res.code) {
                        msg = $.lang.tip["tiplogOpenfail"];
                        icon = TIPS_TYPE.FAIL;
                    } else {
                        msg = $.lang.tip["tiplogOpensuc"];
                        icon = TIPS_TYPE.SUCCEED;
                    }
                    that.msgtipshow(msg, icon);
                })
            }
        },
        /**
         * 关闭日志
         * @constructor
         */
        CloseLog: function () {
            var msg;
            var icon;
            var that = this;

            if (this.gWebControl != null) {
                this.gWebControl.SDKControl.JS_setWriteLogFlag(0, function (res) {
                    if (0 !== res.code) {
                        msg = $.lang.tip["tiplogOpenfail"];
                        icon = TIPS_TYPE.FAIL;
                    } else {
                        msg = $.lang.tip["tiplogOpensuc"];
                        icon = TIPS_TYPE.SUCCEED;
                    }
                    that.msgtipshow(msg, icon);
                })
            }
        },

        setlogpath: function () {
            var pathurl = $("#logpath").val();
            var msg;
            var icon;
            var that = this;
            if (pathurl == "") {
                this.msgtipshow($.lang.tip["tipsetlogpath"], TIPS_TYPE.CONFIRM);
            } else {
                if (this.gWebControl != null) {
                    this.gWebControl.SDKControl.JS_setLogPath(pathurl, function (res) {
                        if (0 !== res.code) {
                            msg = $.lang.tip["tiplogClosefail"];
                            icon = TIPS_TYPE.FAIL;
                        } else {
                            msg = $.lang.tip["tiplogClosesuc"];
                            icon = TIPS_TYPE.SUCCEED;
                            $("#openLog").attr("disabled", false);
                            $("#closeLog").attr("disabled", false);
                        }
                        that.msgtipshow(msg, icon);
                    })
                }
            }
        },
        /******************************* 日志相关 END ***************************/

        /*************************** 公用方法 Begin ****************************/
        //滚动调滑动一小步，为解决关闭视频最后一帧画面问题
        bodyScroll: function () {
            var t = $(window).scrollTop();
            $('body,html').animate({'scrollTop': t - 10}, 100);
            $('body,html').animate({'scrollTop': t + 10}, 100);
        },
        //清除表格
        destoryTable: function (id) {
            $.jgrid.gridDestroy("#" + id);
        }
    });
    return new mainClass();
}(jQuery);
