import { Form, Modal, Input } from "antd";
import { FormComponentProps } from "antd/es/form";
import React from "react";
import { UserItem } from "../data";

interface Props extends FormComponentProps {
    close: Function;
    save: Function;
    data: Partial<UserItem>;
}

const Save1: React.FC<Props> = props => {
    const { form: { getFieldDecorator }, form } = props;
    const submitData = () => {
      form.validateFields((err, fileValue) => {
        if (err) return;
        props.save({ id: props.data.id, ...fileValue });
      });
    };

    return (
        <Modal
            title="绑卡"
            visible
            okText="确定"
            cancelText="取消"
            onOk={() => { submitData() }}
            onCancel={() => props.close()}
        >
            <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Form.Item
                key="name"
                label="姓名"
              >
                {getFieldDecorator('name', {
                  initialValue: props.data.name,
                })(<Input placeholder="请输入" disabled={true} />)}
              </Form.Item>
              <Form.Item
                key="deviceId"
                label="卡号"
              >
                {getFieldDecorator('deviceId', {
                  rules: [{ required: true, message: '请输入卡号' }],
                  initialValue: props.data.deviceId,
                })(<Input placeholder="请输入" />)}
              </Form.Item>
            </Form>
        </Modal>
    );
};
export default Form.create<Props>()(Save1);
