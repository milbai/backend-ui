import * as React from 'react';
import {Divider, message, Switch} from "antd";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment from "moment";

import { createFengmap, setFenceData, setDevicesData, setAlarms, setAlarmsVideo, showVideo, isAlarmVideoShow } from './fengmap.js'
import styles from './css/index.css';
import {connect} from "dva";
import {ConnectState, Dispatch} from "@/models/connect";
import 'video.js/dist/video-js.css';
import Save from "./save";
import {router} from "umi";
import { camelCase } from 'lodash';
//import {createWebSocket} from "@/pages/map/websocket";

interface Props {
  dispatch: Dispatch;
}

interface State {
  currentItem: any;
  tempEmployee: any;
  TGSG190state: boolean;
  AudioSetting: any;
  audioVisible: boolean;
  alarmDevices: any;
  videoVisible: boolean;
  videoDevice4Alarm: string;
}

const Location: React.FC<Props> = props => {
  const { dispatch } = props;
  const initState: State = {
    currentItem: {},
    tempEmployee: {},
    TGSG190state: false,
    AudioSetting: {},
    audioVisible: false,
    alarmDevices: {},
    videoVisible: false,
    videoDevice4Alarm: '',
  };
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [tempEmployee, setTempEmployee] = useState(initState.tempEmployee);
  const [TGSG190state, setTGSG190state] = useState(initState.TGSG190state);
  const [AudioSetting, setAudioSetting] = useState(initState.AudioSetting);
  const [audioVisible, setAudioVisible] = useState(initState.audioVisible);
  const [alarmDevices, setAlarmDevices] = useState(initState.alarmDevices);
  const [videoVisible, setVideoVisible] = useState(initState.videoVisible);
  const [videoDevice4Alarm, setVideoDevice4Alarm] = useState(initState.videoDevice4Alarm);

  let deviceList: any;

  const handle_switch = (b: boolean) => {
    currentItem.state = b;
    dispatch({
      type: 'fence/insert',
      payload: encodeQueryParam(currentItem),
      callback: (response: any) => {
        if (response.status === 200) {
          message.success("操作成功");
          getFenceData();
          setCurrentItem({});
        } else {
          message.error(`操作失败，${response.message}`);
        }
      }
    });
  };

  const handle_switchTGSG190 = (b: boolean) => {
    apis.deviceInstance.switchTGSG190(currentItem.id, b ? 'D10003' : 'D10000')
      .then(response => {
        if (response.status === 200) {
          setTGSG190state(b);
          message.success("操作成功");
        } else {
          message.error(`操作失败，${response.message}`);
        }
      })
      .catch(() => {});
  };

  const getAudioList = () => {
    apis.deviceInstance.getAudioList()
      .then(response => {
        if (response.status === 200 && response.result) {
          //let result = ["[", " \"dingdong.mp3\",", " \"29_空调_通用.mp3\",", " \"31_四号线的徘徊_通用.mp3\",", " \"32_童玩_通用.mp3\"", "]"];
          let result = response.result;
          result.shift();
          result.pop();
          result = result.map((str: string, index: number, arr: Array<string>) => arr.length === index +1 ? str.substring(3, str.length-1):str.substring(3, str.length-2));
          setAudioSetting({
            audio_list: result,//多选 信息
          });
        } else {
        }
      })
      .catch(() => {});
  };

  const getEmployeeName = (employees: string) => {
    if(!employees)
      return '';
    var emp = employees.split(',');
    var result = '';
    for(var j = 0; j < emp.length; j++) {
      result += tempEmployee[emp[j]] + ' ';
    }
    return result;
  };

  const getVideoSrc = (describe: string, rootPath: string) => {
    // console.log("getVideoSrc: " + describe);
    var src = '';
    if(describe && describe.indexOf(", ") > -1) {
      var params = describe.split(", ");
      src = rootPath + "?cameraIp=" + params[0] + "&DevchannelID=" + params[1];
    }
    return src;
  };

  const getNearestVideo = (alarmDevice: any) => {
    let distanceMinY = 100;
    let distanceMinX = 1000;
    let idx = 0;

    // longitude: number;
    // latitude: number;
    console.log(deviceList[0].productId);
    console.log(alarmDevice);
    let postionY = alarmDevice.alarmData.trigger0['devicePositionY'] != undefined ? alarmDevice.alarmData.trigger0['devicePositionY'] : alarmDevice.alarmData.trigger0['badgePos_y'];
    let postionX = alarmDevice.alarmData.trigger0['devicePositionX'] != undefined ? alarmDevice.alarmData.trigger0['devicePositionX'] : alarmDevice.alarmData.trigger0['badgePos_x'];
    for(var i = 0; i < deviceList.length; i++) {
      if(deviceList[i].productId === "videoMonitor") {

        let distance = Math.abs(parseFloat(deviceList[i].latitude) - parseFloat(postionY));
        let distanceX = 0;
        // console.log('device: ' + deviceList[i].latitude);
        // console.log('alarm: ');
        console.log(distance);

        if (distanceMinY >= distance) {
          distanceMinY = distance;
          idx = i;
          
          distanceX = Math.abs(parseFloat(deviceList[i].longitude) - parseFloat(postionX));
          if (distanceMinX > distanceX) {
            distanceMinX = distanceX;
            idx = i;
          }
        }
      }
    }
    if (deviceList[idx].productId === "videoMonitor" || deviceList[idx].productId === "videoMonitorWuFang") {
      setVideoDevice4Alarm(deviceList[idx].describe);
      console.log(' --- ' + deviceList[idx].name)
      console.log(' --- ' + deviceList[idx].describe);
    }

  };

  // const getBinder = (deviceId: string) => {
  //   apis.employee.getBinderById(deviceId)
  //     .then((response: any) => {
  //       if (response.status === 200 && response.result && response.result.name) {
  //         document.getElementById('binder_name').innerHTML = response.result.name;
  //       }
  //     });
  //   return '获取中...';
  // };

  const handle_audio = (setting: any) => {
    var data = {
      "deviceId": [ currentItem.id ]
    };
    if(setting.play) {
      data["audio"] = setting.musicid.split(',');
      data["repeate"] = setting.repeate === "true" ? true : false;
      data["action"] = "play";
    } else {
      data["action"] = "stop";
    }
    apis.deviceInstance
      .handle_audio(setting.play ? "play":"stop", encodeQueryParam(data))
      .then(response => {
        if (response.status === 200) {
          //setAudioSetting(setting);
          //setAudioVisible(false);
          message.success("操作成功");
        } else {
          //message.error(`操作失败，${response.message}`);
        }
      })
      .catch(() => {});
    setAudioVisible(false);
  };

  const getDeviceInfo = (deviceId: string) => {
    apis.deviceInstance
      .logs(deviceId, encodeQueryParam({
        pageSize: 1,
        pageIndex: 0,
        terms: { type$IN: "reportProperty", deviceId: deviceId },
        sorts: {
          field: 'createTime',
          order: 'desc',
        },
      }))
      .then(response => {
        if (response.status === 200 && response.result && response.result.data && response.result.data.length) {
          var content = JSON.parse(response.result.data[0].content);
          if(response.result.data[0].productId === 'AN303') {
            document.getElementById('an303_wendu').innerHTML = content.temperature + ' °C';
            document.getElementById('an303_shidu').innerHTML = content.humidity + ' %';
          } else if(response.result.data[0].productId === 'JTY-GF-NT8141') {
            document.getElementById('yangan_battery').innerHTML = content.battery;
            document.getElementById('yangan_nongdu').innerHTML = content.smokedencityvalue;
            document.getElementById('yangan_status').innerHTML = function () {
              switch (content.type) {
                case 'alarm':
                  return '报警';
                case 'muted':
                  return '静音';
                case 'lowbattery':
                  return '低压';
                case 'fail':
                  return '故障';
                case 'normal':
                  return '正常';
                case 'open':
                  return '拆除';
                case 'close':
                  return '安装';
                case 'battery normal and alarm test':
                  return '正常电压时测试报警';
                case 'battery low and alarm test':
                  return '低电压时测试报警';
                default:
                  //return content.type;
                  return '正常';
              }
            }();
          } else if(response.result.data[0].productId === 'GT-CX400') {
            document.getElementById('cx400_nongdu').innerHTML = content.gas_density + " " + content.gas_unit;
            document.getElementById('cx400_status').innerHTML = function () {
              switch (content.sensor_status) {
                case 'normal':
                  return '正常';
                case 'low':
                  return '低报';
                case 'high':
                  return '高报';
                case 'fail':
                  return '故障';
                case 'fault':
                  return '错误';
                case 'storage_err':
                  return '存储故障';
                default:
                  //return content.sensor_status;
                  return '正常';
              }
            }();
          }
        }
      })
      .catch(() => {});
    return '获取中...';
  };

  const getTGSG_state = (deviceId: string) => {
    apis.deviceInstance
      .logs(deviceId, encodeQueryParam({
        pageSize: 1,
        pageIndex: 0,
        terms: { type$IN: "reportProperty", deviceId: deviceId },
        sorts: {
          field: 'createTime',
          order: 'desc',
        },
      }))
      .then(response => {
        if (response.status === 200 && response.result && response.result.data && response.result.data.length) {
          var content = JSON.parse(response.result.data[0].content);
          if(content["switch_voice"] === 'On' || content["switch_light"] === 'On') {
            setTGSG190state(true);
          }
        }
      })
      .catch(() => {});
    setTGSG190state(false);
  };

  const getFenceData = () => {
    defer(
      () => from(apis.employee.listAll(encodeQueryParam({ terms: {type: 1} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      const tempEmployees = {};
      data.map((item: any) => (tempEmployees[item.id] = item.name));
      setTempEmployee(tempEmployees);
      defer(
        () => from(apis.fence.listAll(encodeQueryParam({}))).pipe(
          filter(resp => resp.status === 200),
          map(resp => resp.result)
        )).subscribe((data) => {
        const tempFence = data;
        var temp = [];
        for(var i = 0; i < tempFence.length; i++) {
          if (temp[0] && temp[1] && temp[2] && temp[3]) {
            break;
          }
          if(!temp[0] && tempFence[i].area === '月检线' && tempFence[i].state) {
            temp[0] = tempFence[i];
            continue;
          }
          if (!temp[1] && tempFence[i].area === '停车日检库A区' && tempFence[i].state) {
            temp[1] = tempFence[i];
            continue;
          }
          if (!temp[2] && tempFence[i].area === '停车日检库B区' && tempFence[i].state) {
            temp[2] = tempFence[i];
            continue;
          }
          if(!temp[3] && tempFence[i].area === '出场线' && tempFence[i].state) {
            temp[3] = tempFence[i];
          }
        }
        setFenceData(temp);
      });
    });
  };

  const getData = () => {
    //蓝牙胸卡 CM100-GB
    //视频监控 videoMonitor videoMonitorWuFang
    //声光报警器 TGSG-190
    defer(
      () => from(apis.deviceInstance.listAll(encodeQueryParam({ terms: {} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      const temp = data.filter((item: any) => {
        item.createTime = item.createTime ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
        item.registryTime = item.registryTime ? moment(item.registryTime).format('YYYY-MM-DD HH:mm:ss') : '';

        return item.productId === 'videoMonitorWuFang'
            || item.productId === 'videoMonitor'
            || item.productId === 'TGSG-190'
            || item.productId === 'audioBroadcast'
            || item.productId === 'AN303'
            || item.productId === 'JTY-GF-NT8141'
            || item.productId === 'GT-CX400'
          // (item.productId === 'AN303' && item.state && item.state.value === 'online') ||
          // (item.productId === 'JTY-GF-NT8141' && item.state && item.state.value === 'online') ||
          // (item.productId === 'GT-CX400' && item.state && item.state.value === 'online');

        //return item.productId === 'M401A';
      });
      setDevicesData({
        data: temp,
        type: 2
      });
      deviceList = temp;
    });
  };

  const getCM100Data = () => {
    defer(
      () => from(apis.deviceInstance.list_bond1(encodeQueryParam({ terms: {} }))).pipe(
        filter(resp => resp && resp.status === 200),
        map(resp => resp ? resp.result : [])
      )).subscribe((data) => {
        var temp = [];
        var inCharge = {};
        //获取负责人
        for(var i = 0; i < data.length; i++) {
          if(data[i].inCharge === 1) {
            inCharge[data[i].appNo] = {
              name: data[i].name,
              telephone: data[i].telephone
            };
          }
        }
        for(var j = 0; j < data.length; j++) {
          var item = data[j];
          item.productId = "CM100-GB";
          item.id = data[j].deviceId;
          item.inCharge_name = inCharge[data[j].appNo] ? inCharge[data[j].appNo].name : '无数据';
          item.inCharge_telephone = inCharge[data[j].appNo] ? inCharge[data[j].appNo].telephone : '无数据';
          temp.push(item);
        }
        /*老的bond
        for(var i = 0; i < data.length; i++) {
          var item = data[i];
          if(item.device && item.device.productId === 'CM100-GB' && item.device.state && item.device.state.value === 'online' &&
            item.user && item.user.name) {
            item.device.userName = item.user.name;
            item.device.createTime = item.device.createTime ? moment(item.device.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
            item.device.registryTime = item.device.registryTime ? moment(item.device.registryTime).format('YYYY-MM-DD HH:mm:ss') : '';
            temp.push(item.device);
          }
        }
        */
      setDevicesData({
        data: temp,
        type: 1
      });
    });
  };

  const getAlarmLogList = () => {
    apis.deviceAlarm.findAlarmLog2(encodeQueryParam({}))
    //apis.deviceAlarm.findAlarmLog1(encodeQueryParam({ terms: {state: "newer"} }))
      .then((response: any) => {
        if (response.status === 200 && response.result) {
          var alarms = {};
          var isWeiFangPinAlarm = false;
          var isChestCardAlarm = false;
          let tempAlarm = {};
          for(var i = 0; i < response.result.length; i++) {
            var item = response.result[i];
            var id = item.deviceId;
            if(alarms[id]) {
              alarms[id]++;
            } else {
              alarms[id] = 1;
            }

            if(item.productId === 'AN303'
              || item.productId === 'JTY-GF-NT8141'
              || item.productId === 'GT-CX400') {
              isWeiFangPinAlarm = true;
            } else {
              // 胸卡产生的报警
              if (!isChestCardAlarm) {
                isChestCardAlarm = true;
                tempAlarm = item;
              }
            }
          }
          console.log('chest card alarm video show: ' + isAlarmVideoShow());
          if (isAlarmVideoShow()) {
            // 报警已处理，关闭自动开启的摄像头
            if (!isWeiFangPinAlarm && !isChestCardAlarm) {
              setVideoVisible(false);
              setAlarmsVideo(false);
            }
          } else {
            if (isWeiFangPinAlarm) {
              // 开启危废品间的摄像头
              setVideoDevice4Alarm('21.105.208.16, 2604');
              showVideo();
              setCurrentItem({});
              setVideoVisible(true);
              setAlarmsVideo(true);
            } else if(isChestCardAlarm) {
              // 开启胸卡报警时，周边摄像头
              getNearestVideo(tempAlarm)
              showVideo();
              setCurrentItem({});
              setVideoVisible(true);
              setAlarmsVideo(true);
            } else {
              setVideoVisible(false);
              setAlarmsVideo(false);
            }
          }
          
          setAlarms(alarms);
          setAlarmDevices(alarms);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    var requestData: any;
    createFengmap(mapDone, setCurrentItem, getTGSG_state, setVideoVisible);

    function mapDone() {
      //console.log('地图加载完成！');
      getData();
      getAlarmLogList();
      getFenceData();
      getCM100Data();
      getAudioList();
      //createWebSocket(getAlarmLogList);
      requestData = setInterval(() => {
        getAlarmLogList();
        getCM100Data();
      }, 3000);
    }
    return () => {
      clearInterval(requestData);
    };
  }, []);

  return <div>
    <div className={styles.mapout}>
      <div className={styles.fengMap} id="fengmap"></div>
      <div className={styles.mapmask}></div>
      {currentItem.productId === "M401A" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          {/* <Divider className={styles.fengge} />
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span> */}
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.productId === "CM100-GB" && (
        <div className={styles.fenceModal}>
          人员<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          电话<span className={styles.vRight}>{currentItem.telephone}</span>
          <Divider className={styles.fengge} />
          负责人<span className={styles.vRight}>{currentItem.inCharge_name}</span>
          <Divider className={styles.fengge} />
          电话<span className={styles.vRight}>{currentItem.inCharge_telephone}</span>
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.productId === "audioBroadcast" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} />
          操作
          <a className={styles.vRight} onClick={() => {
            AudioSetting.play = false;
            setAudioVisible(true);
          }}>停止</a>
          <a style={{ marginRight: '20px' }} className={styles.vRight} onClick={() => {
            AudioSetting.play = true;
            setAudioVisible(true);
          }}>播放</a>
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.productId === "AN303" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          {/* 创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} /> */}
          温度<span id="an303_wendu" className={styles.vRight}>{ getDeviceInfo(currentItem.id) }</span>
          <Divider className={styles.fengge} />
          湿度<span id="an303_shidu" className={styles.vRight}>获取中...</span>
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.productId === "JTY-GF-NT8141" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          {/* 创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} /> */}
          电量<span id="yangan_battery" className={styles.vRight}>{ getDeviceInfo(currentItem.id) }</span>
          <Divider className={styles.fengge} />
          烟雾浓度<span id="yangan_nongdu" className={styles.vRight}>获取中...</span>
          <Divider className={styles.fengge} />
          状态<span id="yangan_status" className={styles.vRight}>获取中...</span>
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.productId === "GT-CX400" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          {/* 创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} /> */}
          气体浓度<span id="cx400_nongdu" className={styles.vRight}>{ getDeviceInfo(currentItem.id) }</span>
          <Divider className={styles.fengge} />
          状态<span id="cx400_status" className={styles.vRight}>获取中...</span>
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.productId === "videoMonitor" && (
        <div id={"playerContainer"} style={{
          // width: '600px', height: '350px', position: "absolute", right: "0"
          width: '600px', height: '350px', position: "absolute", left: 'calc(100% - 600px + 250px)', top: '100px'
        }}>
          <iframe
            frameBorder="0"
            style={{
              //display: "none"
              width: '1px', height: '1px'
            }}
            src={getVideoSrc(currentItem.describe, "/AnFang_SDK/index.html")}
          ></iframe>
          {/* {false && (<video id="myVideo" className="video-js vjs-default-skin vjs-big-play-centered"
                 controls preload="auto" data-setup="{}"
                 style={{width: '380px'}}
          >
          </video>)} */}
        </div>
      )}
      {videoVisible && (
        <div id={"playerContainer"} style={{
          width: '600px', height: '350px', position: "absolute", left: 'calc(100% - 600px + 250px)', top: '100px'
        }}>
          <iframe
            frameBorder="0"
            style={{
              width: '100px', height: '100px'
            }}
            src={getVideoSrc(videoDevice4Alarm, "/AnFang_SDK/index.html")}
          ></iframe>
        </div>
      )}
      {currentItem.productId === "videoMonitorWuFang" && (

        <div id={"playerContainer"} style={{
          // width: '600px', height: '350px', position: "absolute", right: "0"
          width: '600px', height: '350px', position: "absolute", left: 'calc(100% - 600px + 250px)', top: '100px'
        }}>
          <iframe
            frameBorder="0"
            style={{
              //display: "none"
              width: '1px', height: '1px'
            }}
            src={getVideoSrc(currentItem.describe, "/WuFang_SDK/index.html")}
          ></iframe>
          {/* {false && (<video id="myVideo" className="video-js vjs-default-skin vjs-big-play-centered"
                 controls preload="auto" data-setup="{}"
                 style={{width: '380px'}}
          >
          </video>)} */}
        </div>
      )}
      {/* {currentItem.productId === "videoMonitorWuFang" && (
        <div className={styles.videoModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          <div style={{width: '380px', height: '285px', overflow: 'hidden'}}>
            <iframe
              frameBorder="0"
              scrolling={"no"}
              src={getVideoSrc(currentItem.describe, "/WuFang_SDK/index.html")}
              style={{width: '168.4%', height: '168.4%',
                transform: 'scale(0.594, 0.594) translate(-34.2%, -34.2%)'
              }}
            ></iframe>
          </div>
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )} */}
      {currentItem.productId === "TGSG-190" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} />
          开关<Switch className={styles.vRight} checked={TGSG190state} onChange={(b) => {
          handle_switchTGSG190(b);
        }} />
          {alarmDevices[currentItem.id] && (
            <div>
              <Divider className={styles.fengge} />
              告警
              <a className={styles.vRight} onClick={() => {
                router.push('/device/alarm?deviceId=' + currentItem.id);
              }}>查看</a>
            </div>
          )}
        </div>
      )}
      {currentItem.area && (
        <div id="fence_modal" className={styles.fenceModal}>
          名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          区域<span className={styles.vRight}>{currentItem.area}</span>
          <Divider className={styles.fengge} />
          开关<Switch className={styles.vRight} defaultChecked={currentItem.state} onChange={(b) => {
            handle_switch(b);
        }} />
          <Divider className={styles.fengge} />
          {/* 开始时间<span className={styles.vRight}>{currentItem.begin ? moment(currentItem.begin).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
          <Divider className={styles.fengge} />
          结束时间<span className={styles.vRight}>{currentItem.end ? moment(currentItem.end).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
          <Divider className={styles.fengge} /> */}
          离开报警<span className={styles.vRight}>{currentItem.outsideAlarm ? '开启' : '关闭'}</span>
          <Divider className={styles.fengge} />
          离开超时<span className={styles.vRight}>{currentItem.outsideTimeout + '分钟'}</span>
          <Divider className={styles.fengge} />
          未进入报警<span className={styles.vRight}>{currentItem.insideAlarm ? '开启' : '关闭'}</span>
          <Divider className={styles.fengge} />
          进入超时<span className={styles.vRight}>{currentItem.insideTimeout + '分钟'}</span>
          {/* <Divider className={styles.fengge} />
          可进入员工<span className={styles.vRight}>{getEmployeeName(currentItem.employees)}</span> */}
        </div>
      )}

      {
        audioVisible &&
        <Save
          data={AudioSetting}
          close={() => { setAudioVisible(false) }}
          save={(setting: any) => handle_audio(setting) }
        />
      }
    </div>
  </div>
};

export default connect(({}: ConnectState) => ({
}))(Location)
