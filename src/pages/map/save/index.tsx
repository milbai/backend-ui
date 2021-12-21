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
      
      if(props.data.play) {
        props.data.musicid = fileValue.musicid.toString();
        props.data.repeate = fileValue.repeate;
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
      {!props.data.play && (<p>确实要停止音频播放吗？</p>)}
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        {props.data.play && (<Form.Item label="音频">
          {getFieldDecorator('musicid', {
            rules: [{ required: true, message: '请选择音频' }],
            initialValue: props.data.musicid ? props.data.musicid.split(',') : [],
          })(<Select mode='multiple'>
            {props.data.audio_list.map((item: any, index: number) => <Select.Option value={item} key={index}>{item}</Select.Option>)}
          </Select>)}
        </Form.Item>)}
        {props.data.play && <Form.Item label="重复">
          {getFieldDecorator('repeate', {
            rules: [{ required: true, message: '请选择是否重复播放' }],
            initialValue: "false",
          })(<Select>
            <Select.Option value="true">是</Select.Option>
            <Select.Option value="false">否</Select.Option>
          </Select>)}
        </Form.Item>}
      </Form>
    </Modal>
  );
};
export default Form.create<Props>()(Save);
