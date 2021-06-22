import * as React from 'react';
import {Divider, message, Switch} from "antd";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment from "moment";

import { createFengmap, addPolygonMarker, updateMarkers } from './fengmap'
import styles from './css/index.css';
import {connect} from "dva";
import {ConnectState, Dispatch} from "@/models/connect";
import 'video.js/dist/video-js.css';

interface Props {
  dispatch: Dispatch;
}

interface State {
  currentItem: any;
  tempEmployee: any;
}

const Location: React.FC<Props> = props => {
  const { dispatch } = props;
  const initState: State = {
    currentItem: {},
    tempEmployee: {}
  };
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [tempEmployee, setTempEmployee] = useState(initState.tempEmployee);

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
          message.success("操作成功");
        } else {
          message.error(`操作失败，${response.message}`);
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
          if (temp[0] && temp[1] && temp[2] && temp[3] && temp[4]) {
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
            continue;
          }
          if (!temp[4] && tempFence[i].area === '出场线' && tempFence[i].state) {
            temp[4] = tempFence[i];
          }
        }
        addPolygonMarker(temp);
      });
    });
  };

  const getData = () => {
    //蓝牙胸卡 CM100
    //视频监控 videoMontior
    //声光报警器 TGSG-190
    defer(
      () => from(apis.deviceInstance.listAll(encodeQueryParam({ terms: {} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      const temp = data.filter((item: any) => {
        item.createTime = item.createTime ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
        item.registryTime = item.registryTime ? moment(item.registryTime).format('YYYY-MM-DD HH:mm:ss') : '';
        return (item.productId === 'CM100' && item.state && item.state.value === 'online') ||
          item.productId === 'videoMontior' || item.productId === 'TGSG-190';
      });
      updateMarkers(temp);
    });
  };

  useEffect(() => {
    var requestData;
    createFengmap(mapDone, setCurrentItem);

    function mapDone() {
      //console.log('地图加载完成！');
      getFenceData();
      getData();
      requestData = setInterval(() => getData(), 3000);
    }
    return () => {
      clearInterval(requestData);
    };
  }, []);

  return <div>
    <div className={styles.mapout}>
      <div className={styles.fengMap} id="fengmap"></div>
      <div className={styles.mapmask}></div>
      {currentItem.productId === "CM100" && (
        <div className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
          <Divider className={styles.fengge} />
          绑定人员<span id="binder_name" className={styles.vRight}>{ getBinder(currentItem.id) }</span>
        </div>
      )}
      {currentItem.productId === "videoMontior" && (
        <div className={styles.videoModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          <video id="myVideo" className="video-js vjs-default-skin vjs-big-play-centered"
                 controls preload="auto" data-setup="{}"
                 style={{width: '380px'}}
          >
          </video>
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
          开关<Switch className={styles.vRight} defaultChecked onChange={(b) => {
          handle_switchTGSG190(b);
        }} />
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
    </div>
  </div>
};

export default connect(({}: ConnectState) => ({
}))(Location)
