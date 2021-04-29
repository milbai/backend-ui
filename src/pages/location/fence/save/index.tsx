import {Form, Modal, Input, Select, DatePicker, Switch, InputNumber} from "antd";
import { FormComponentProps } from "antd/es/form";
import React, {useEffect, useState} from "react";
import { FenceItem } from "../data";
import moment from "moment";
import encodeQueryParam from "@/utils/encodeParam";
import apis from "@/services";
import {defer, from} from "rxjs";
import {filter, map} from "rxjs/operators";

interface Props extends FormComponentProps {
  close: Function;
  save: Function;
  data: Partial<FenceItem>;
}

const Save: React.FC<Props> = props => {
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const { form: { getFieldDecorator }, form } = props;
  const submitData = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;
      console.log(fileValue);
      if(fileValue.begin) {
        fileValue.begin = new Date(fileValue.begin).getTime();
      }
      if(fileValue.end) {
        fileValue.end = new Date(fileValue.end).getTime();
      }
      if(fileValue.outsideAlarm === undefined) {
        fileValue.outsideAlarm = props.data.outsideAlarm;
      }
      if(fileValue.insideAlarm === undefined) {
        fileValue.insideAlarm = props.data.insideAlarm;
      }
      if(fileValue.employees) {
        fileValue.employees = fileValue.employees.toString();
      }
      props.save({ id: props.data.id, ...fileValue });
    });
  };

  useEffect(() => {
    defer(
      () => from(apis.employee.listAll(encodeQueryParam({ terms: {type: 1} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      const temp = data.map((item: any) => ({value: item.id, label: item.name, ...item}));
      setEmployeeList(temp);
    });
  }, []);

  return (
    <Modal
      title={`${props.data.id ? '编辑' : '新建'}电子围栏`}
      visible
      okText="确定"
      cancelText="取消"
      onOk={() => { submitData() }}
      onCancel={() => props.close()}
    >
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        {
          props.data.id ? (<Form.Item
            key="name"
            label="名称"
          >
            {getFieldDecorator('name', {
              initialValue: props.data.name,
            })(<Input placeholder="请输入" disabled={true} />)}
          </Form.Item>) : (<Form.Item
            key="name"
            label="名称"
          >
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入围栏名称' }],
              initialValue: props.data.name,
            })(<Input placeholder="请输入" />)}
          </Form.Item>)
        }
        <Form.Item label="区域">
          {getFieldDecorator('area', {
            rules: [{ required: true, message: '请选择围栏区域' }],
            initialValue: props.data?.area,
          })(<Select placeholder="请选择">
            <Select.Option value="月检线" key='area1'>月检线</Select.Option>
            <Select.Option value="维修线" key='area2'>维修线</Select.Option>
            <Select.Option value="停车日检库A区" key='area3'>停车日检库A区</Select.Option>
            <Select.Option value="停车日检库B区" key='area4'>停车日检库B区</Select.Option>
          </Select>)}
        </Form.Item>
        <Form.Item label="开始时间">
          {getFieldDecorator('begin', {
            initialValue: props.data.begin ? moment(props.data.begin) : null,
          })(<DatePicker showTime />)}
        </Form.Item>
        <Form.Item label="结束时间">
          {getFieldDecorator('end', {
            initialValue: props.data.end ? moment(props.data.end) : null,
          })(<DatePicker showTime />)}
        </Form.Item>

        <Form.Item label="离开报警" key="outsideAlarm">
          {getFieldDecorator('outsideAlarm', {
            valuePropName: 'checked',
            initialValue: props.data.outsideAlarm,
          })(<Switch />)}
        </Form.Item>
        <Form.Item label="离开超时" key="outsideTimeout">
          {getFieldDecorator('outsideTimeout', {
            initialValue: props.data?.outsideTimeout,
          })(<InputNumber min={0} />)} 分钟
        </Form.Item>

        <Form.Item label="未进入报警" key="insideAlarm">
          {getFieldDecorator('insideAlarm', {
            valuePropName: 'checked',
            initialValue: props.data.insideAlarm,
          })(<Switch />)}
        </Form.Item>
        <Form.Item label="进入超时" key="insideTimeout">
          {getFieldDecorator('insideTimeout', {
            initialValue: props.data?.insideTimeout,
          })(<InputNumber min={0} />)} 分钟
        </Form.Item>

        <Form.Item label="可进入员工" key="employees">
          {getFieldDecorator('employees', {
            initialValue: props.data.employees ? props.data.employees.split(',') : [],
          })(<Select mode='multiple'>
            {employeeList.map((item: any) => <Select.Option value={item.id || item} key={item.id || item}>{item.name || item}</Select.Option>)}
          </Select>)}
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default Form.create<Props>()(Save);
