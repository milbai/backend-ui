import * as React from 'react';
import {Divider, Form} from "antd";
import {FormComponentProps} from "antd/lib/form";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment from "moment";

import { createFengmap, addPolygonMarker, updateMarkers } from './fengmap'
import styles from './css/index.css';

interface Props extends FormComponentProps {
}

interface State {
  currentItem: any;
}

const Location: React.FC<Props> = props => {
  const initState: State = {
    currentItem: {}
  };
  const [currentItem, setCurrentItem] = useState(initState.currentItem);

  useEffect(() => {
    var requestData;
    createFengmap(mapDone, setCurrentItem);

    function mapDone() {
      //console.log('地图加载完成！');
      defer(
        () => from(apis.employee.listAll(encodeQueryParam({ terms: {type: 1} }))).pipe(
          filter(resp => resp.status === 200),
          map(resp => resp.result)
        )).subscribe((data) => {
        const tempEmployee = {};
        data.map((item: any) => (tempEmployee[item.id] = item.name));
        //console.log(tempEmployee);

        function getEmployeeName(employees) {
          if(!employees)
            return '';
          var emp = employees.split(',');
          var result = '';
          for(var j = 0; j < emp.length; j++) {
            result += tempEmployee[emp[j]] + ' ';
          }
          return result;
        }
        defer(
          () => from(apis.fence.listAll(encodeQueryParam({}))).pipe(
            filter(resp => resp.status === 200),
            map(resp => resp.result)
          )).subscribe((data) => {
          const tempFence = data.map((item: any) => ({
            name: item.name,
            area: item.area,
            begin: item.begin ? moment(item.begin).format('YYYY-MM-DD HH:mm:ss') : '',
            end: item.end ? moment(item.end).format('YYYY-MM-DD HH:mm:ss') : '',
            status: item.begin && item.end && item.begin < moment().valueOf() && moment().valueOf() < item.end,
            outsideAlarm: item.outsideAlarm ? '开启' : '关闭',
            outsideTimeout: item.outsideTimeout + '分钟',
            insideAlarm: item.insideAlarm ? '开启' : '关闭',
            insideTimeout: item.insideTimeout + '分钟',
            employees: getEmployeeName(item.employees)
          }));
          var temp = [];
          for(var i = 0; i < tempFence.length; i++) {
            if(temp[0] && temp[1] && temp[2] && temp[3]) {
              break;
            }
            if(!temp[0] && tempFence[i].area === '月检线' && tempFence[i].status) {
              temp[0] = tempFence[i];
              continue;
            }
            if(!temp[1] && tempFence[i].area === '维修线' && tempFence[i].status) {
              temp[1] = tempFence[i];
              continue;
            }
            if(!temp[2] && tempFence[i].area === '停车日检库A区' && tempFence[i].status) {
              temp[2] = tempFence[i];
              continue;
            }
            if(!temp[3] && tempFence[i].area === '停车日检库B区' && tempFence[i].status) {
              temp[3] = tempFence[i];
            }
          }
          addPolygonMarker(temp);
        });
      });

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
          开始时间<span className={styles.vRight}>{currentItem.begin}</span>
          <Divider className={styles.fengge} />
          结束时间<span className={styles.vRight}>{currentItem.end}</span>
          <Divider className={styles.fengge} />
          离开报警<span className={styles.vRight}>{currentItem.outsideAlarm}</span>
          <Divider className={styles.fengge} />
          离开超时<span className={styles.vRight}>{currentItem.outsideTimeout}</span>
          <Divider className={styles.fengge} />
          未进入报警<span className={styles.vRight}>{currentItem.insideAlarm}</span>
          <Divider className={styles.fengge} />
          进入超时<span className={styles.vRight}>{currentItem.insideTimeout}</span>
          <Divider className={styles.fengge} />
          可进入员工<span className={styles.vRight}>{currentItem.employees}</span>
        </div>
      )}
    </div>
  </div>
};

export default Form.create<Props>()(Location);
