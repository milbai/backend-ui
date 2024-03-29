import { Form, Modal, Input } from "antd";
import { FormComponentProps } from "antd/es/form";
import React from "react";

interface Props extends FormComponentProps {
    close: Function;
    save: Function;
}

const UnBind: React.FC<Props> = props => {
    const { form: { getFieldDecorator }, form } = props;
    const submitData = () => {
      form.validateFields((err, fileValue) => {
        if (err) return;
        props.save(fileValue.deviceId);
      });
    };

    return (
        <Modal
            title="解绑"
            visible
            okText="确定"
            cancelText="取消"
            onOk={() => { submitData() }}
            onCancel={() => props.close()}
        >
            <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Form.Item
                key="deviceId"
                label="卡号"
              >
                {getFieldDecorator('deviceId', {
                  rules: [{ required: true, message: '请输入卡号' }]
                })(<Input placeholder="请输入" maxLength={16} onChange={e => {
                  var id = e.target.value;
                  if(id.startsWith('ID:')) {
                    id = id.substring(3);
                    e.target.value = id;
                  }
                }}/>)}
              </Form.Item>
            </Form>
        </Modal>
    );
};
export default Form.create<Props>()(UnBind);
