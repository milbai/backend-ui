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
          if(temp[0] && temp[1] && temp[2] && temp[3]) {
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
    //蓝牙胸卡 CM100
    defer(
      () => from(apis.deviceInstance.listAll(encodeQueryParam({ terms: {productId: 'CM100'} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      const tempCm100 = data.filter((item: any) => {
        item.createTime = item.createTime ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
        item.registryTime = item.registryTime ? moment(item.registryTime).format('YYYY-MM-DD HH:mm:ss') : '';
        return item.state && item.state.value === 'online';
      });
      updateMarkers(tempCm100);
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
        <div id="cm100_modal" className={styles.fenceModal}>
          产品名称<span className={styles.vRight}>{currentItem.productName}</span>
          <Divider className={styles.fengge} />
          设备名称<span className={styles.vRight}>{currentItem.name}</span>
          <Divider className={styles.fengge} />
          创建时间<span className={styles.vRight}>{currentItem.createTime}</span>
          <Divider className={styles.fengge} />
          注册时间<span className={styles.vRight}>{currentItem.registryTime}</span>
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
