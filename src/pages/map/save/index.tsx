import {Form, Modal, Select} from "antd";
import { FormComponentProps } from "antd/es/form";
import React from "react";

interface Props extends FormComponentProps {
  close: Function;
  save: Function;
  data: any;
}

const Save: React.FC<Props> = props => {
  const { form: { getFieldDecorator }, form } = props;
  const submitData = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;
      props.data.channal = fileValue.channal;
      if(props.data.play) {
        props.data.musicid = fileValue.musicid.toString();
        props.data.zone = fileValue.zone.toString();
      }
      props.save(props.data);
    });
  };

  return (
    <Modal
      title={`${props.data.play ? '播放' : '停止'}音频`}
      visible
      okText="确定"
      cancelText="取消"
      onOk={() => { submitData() }}
      onCancel={() => props.close()}
    >
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        {props.data.play && (<Form.Item label="音频">
          {getFieldDecorator('musicid', {
            rules: [{ required: true, message: '请选择音频' }],
            initialValue: props.data.musicid ? props.data.musicid.split(',') : [],
          })(<Select mode='multiple'>
            {props.data.audio_list.map((item: any, index: number) => <Select.Option value={item} key={index}>{item}</Select.Option>)}
          </Select>)}
        </Form.Item>)}
        <Form.Item label="通道">
          {getFieldDecorator('channal', {
            rules: [{ required: true, message: '请选择通道' }],
            initialValue: props.data?.channal,
          })(<Select placeholder="请选择">
            {props.data.audio_channal.map((i: any, index: number) => {
              return <Select.Option key={index} value={i}>{i}</Select.Option>
            })}
          </Select>)}
        </Form.Item>
        {props.data.play && (<Form.Item label="区域">
          {getFieldDecorator('zone', {
            rules: [{ required: true, message: '请选择区域' }],
            initialValue: props.data.zone ? props.data.zone.split(',') : [],
          })(<Select mode='multiple'>
            {props.data.audio_zone.map((item: any, index: number) => <Select.Option value={item} key={index}>{item}</Select.Option>)}
          </Select>)}
        </Form.Item>)}
      </Form>
    </Modal>
  );
};
export default Form.create<Props>()(Save);
