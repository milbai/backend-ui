import * as React from 'react';
import {Form} from "antd";
import {FormComponentProps} from "antd/lib/form";
import Fengmap from "./Fengmap";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment from "moment";

interface Props extends FormComponentProps {
}

interface State {
  saveVisible: boolean;
}

const Location: React.FC<Props> = props => {
  const [fenceList, setFenceList] = useState<any[]>([]);

  const initState: State = {
    saveVisible: false
  };

  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);

  useEffect(() => {
    defer(
      () => from(apis.employee.listAll(encodeQueryParam({ terms: {type: 1} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      const tempEmployee = {};

      data.map((item: any) => (tempEmployee[item.id] = item.name));
      console.log(tempEmployee);

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
        setFenceList(temp);
        setSaveVisible(true);
      });
    });
  }, []);

  return (
    saveVisible &&
    <Fengmap
      data={fenceList}
    />
  )
};

export default Form.create<Props>()(Location);
