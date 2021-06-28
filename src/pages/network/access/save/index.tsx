import { Form, Modal, Input } from "antd";
import { FormComponentProps } from "antd/es/form";
import React from "react";
import { AccessItem } from "../data";

interface Props extends FormComponentProps {
  close: Function;
  save: Function;
  data: Partial<AccessItem>;
}

const Save: React.FC<Props> = props => {
  const { form: { getFieldDecorator }, form } = props;
  const submitData = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;
      props.save({ id: props.data.id,
        ...fileValue });
    });
  };

  return (
    <Modal
      title={`${props.data.id ? '编辑' : '新建'}接入`}
      visible
      okText="确定"
      cancelText="取消"
      onOk={() => { submitData() }}
      onCancel={() => props.close()}
    >
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item
          key="name"
          label="名称"
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入名称' }],
            initialValue: props.data.name,
          })(<Input placeholder="请输入" />)}
        </Form.Item>
        <Form.Item
          key="address"
          label="地址"
        >
          {getFieldDecorator('address', {
            rules: [{ required: true, message: '请输入地址' }],
            initialValue: props.data.address,
          })(<Input placeholder="请输入" />)}
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default Form.create<Props>()(Save);
