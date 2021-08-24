import * as React from 'react';
import {Divider, message, Switch} from "antd";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment from "moment";

import { createFengmap, addPolygonMarker, setDevicesData, setAlarms } from './fengmap'
import styles from './css/index.css';
import {connect} from "dva";
import {ConnectState, Dispatch} from "@/models/connect";
import 'video.js/dist/video-js.css';
import Save from "./save";
import {router} from "umi";
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
  };
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [tempEmployee, setTempEmployee] = useState(initState.tempEmployee);
  const [TGSG190state, setTGSG190state] = useState(initState.TGSG190state);
  const [AudioSetting, setAudioSetting] = useState(initState.AudioSetting);
  const [audioVisible, setAudioVisible] = useState(initState.audioVisible);
  const [alarmDevices, setAlarmDevices] = useState(initState.alarmDevices);

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
          setAudioSetting({
            audio_list: response.result,//多选 信息
            audio_channal: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],//单选 通道
            audio_zone: [1,2,3,4],//多选 分区
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

  const getBinder = (deviceId: string) => {
    apis.employee.getBinderById(deviceId)
      .then((response: any) => {
        if (response.status === 200 && response.result && response.result.name) {
          document.getElementById('binder_name').innerHTML = response.result.name;
        }
      });
    return '获取中...';
  };

  const handle_audio = (setting: any) => {
    var data = {
      "company": "BL",
      "token": "",
      "data": {
        "channal": setting.channal
      },
      "return_message": ""
    };
    if(setting.play) {
      data.data["musicid"] = setting.musicid;
      data.data["zone"] = setting.zone;
      data["actioncode"] = "prerecord_play_request";
    } else {
      data["actioncode"] = "prerecord_play_stop_request";
    }

    apis.deviceInstance
      .handle_audio(encodeQueryParam(data))
      .then(response => {
        if (response.status === 200) {
          setAudioSetting(setting);
          setAudioVisible(false);
          message.success("操作成功");
        } else {
          message.error(`操作失败，${response.message}`);
        }
      })
      .catch(() => {});
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
            document.getElementById('an303_wendu').innerHTML = content.temperature;
            document.getElementById('an303_shidu').innerHTML = content.humidity;
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
                  return content.type;
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
                  return content.sensor_status;
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
          if(!temp[1] && tempFence[i].area === '维修线' && tempFence[i].state) {
            temp[1] = tempFence[i];
            continue;
          }
          if(!temp[2] && tempFence[i].area === '停车日检库A区' && tempFence[i].state) {
            temp[2] = tempFence[i];
            continue;
          }
          if(!temp[3] && tempFence[i].area === '停车日检库B区' && tempFence[i].state) {
            temp[3] = tempFence[i];
          }
        }
        addPolygonMarker(temp);
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

        return item.productId === 'videoMonitorWuFang' || item.productId === 'videoMonitor' || item.productId === 'TGSG-190' || item.productId === 'audioBroadcast' ||
          (item.productId === 'AN303' && item.state && item.state.value === 'online') ||
          (item.productId === 'JTY-GF-NT8141' && item.state && item.state.value === 'online') ||
          (item.productId === 'GT-CX400' && item.state && item.state.value === 'online');

        //return item.productId === 'M401A';
      });
      setDevicesData({
        data: temp,
        type: 2
      });
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
          for(var i = 0; i < response.result.length; i++) {
            var id = response.result[i].deviceId;
            if(alarms[id]) {
              alarms[id]++;
            } else {
              alarms[id] = 1;
            }
          }
          setAlarms(alarms);
          setAlarmDevices(alarms);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    var requestData;
    createFengmap(mapDone, setCurrentItem, getTGSG_state);

    function mapDone() {
      //console.log('地图加载完成！');
      getAlarmLogList();
      getFenceData();
      getData();
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
          <Divider className={styles.fengge} />
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
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
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} />
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
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} />
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
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} />
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
        <div className={styles.videoModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          {/* {false && (<video id="myVideo" className="video-js vjs-default-skin vjs-big-play-centered"
                 controls preload="auto" data-setup="{}"
                 style={{width: '380px'}}
          >
          </video>)} */}
          {/* <div style={{ display: "none"}}> */}
          <div id="anFangVideo" style={{ width: '380px', height: '1px', overflow: 'hidden' }}>
            <iframe
              frameBorder="0"
              style={{
                width: '168.4%', height: '168.4%',
                transform: 'scale(0.594, 0.594) translate(-34.2%, -34.2%)'
              }}
              src={"/NetPluginSDK_Win32_V2.5.13.0/index.html?cameraIp=" + currentItem.describe.split(", ")[0] + "&DevchannelID=" + currentItem.describe.split(", ")[1]}
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
      )}
      {currentItem.productId === "videoMonitorWuFang" && (
        <div className={styles.videoModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          <div style={{width: '380px', height: '285px', overflow: 'hidden'}}>
            <iframe
              frameBorder="0"
              scrolling={"no"}
              src={"/WuFang_SDK/index.html?cameraIp=" + currentItem.describe.split(", ")[0] + "&DevchannelID=" + currentItem.describe.split(", ")[1]}
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
      )}
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
          开始时间<span className={styles.vRight}>{currentItem.begin ? moment(currentItem.begin).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
          <Divider className={styles.fengge} />
          结束时间<span className={styles.vRight}>{currentItem.end ? moment(currentItem.end).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
          <Divider className={styles.fengge} />
          离开报警<span className={styles.vRight}>{currentItem.outsideAlarm ? '开启' : '关闭'}</span>
          <Divider className={styles.fengge} />
          离开超时<span className={styles.vRight}>{currentItem.outsideTimeout + '分钟'}</span>
          <Divider className={styles.fengge} />
          未进入报警<span className={styles.vRight}>{currentItem.insideAlarm ? '开启' : '关闭'}</span>
          <Divider className={styles.fengge} />
          进入超时<span className={styles.vRight}>{currentItem.insideTimeout + '分钟'}</span>
          <Divider className={styles.fengge} />
          可进入员工<span className={styles.vRight}>{getEmployeeName(currentItem.employees)}</span>
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
