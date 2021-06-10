import { Form, Modal, Input } from "antd";
import { FormComponentProps } from "antd/es/form";
import React from "react";
import { UserItem } from "../data";

interface Props extends FormComponentProps {
    close: Function;
    save: Function;
    data: Partial<UserItem>;
}

const Save: React.FC<Props> = props => {
    const { form: { getFieldDecorator }, form } = props;
    const submitData = () => {
      form.validateFields((err, fileValue) => {
        if (err) return;
        props.save({ id: props.data.id, type: 1, ...fileValue });
      });
    };

    return (
        <Modal
            title={`${props.data.id ? '编辑' : '新建'}员工`}
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
                  label="姓名"
                >
                  {getFieldDecorator('name', {
                    initialValue: props.data.name,
                  })(<Input placeholder="请输入" disabled={true} />)}
                </Form.Item>) : (<Form.Item
                  key="name"
                  label="姓名"
                >
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入姓名' }],
                    initialValue: props.data.name,
                  })(<Input placeholder="请输入" />)}
                </Form.Item>)
              }
              <Form.Item
                key="department"
                label="部门"
              >
                {getFieldDecorator('department', {
                  rules: [{ message: '请输入部门' }],
                  initialValue: props.data.department
                })(<Input placeholder="请输入" />)}
              </Form.Item>
              <Form.Item
                key="telephone"
                label="电话"
              >
                {getFieldDecorator('telephone', {
                  rules: [
                    {
                      pattern: /^1[3|4|5|7|8][0-9]\d{8}$/, message: '请输入正确的手机号'
                    }
                  ],
                  initialValue: props.data.telephone
                })(<Input placeholder="请输入" />)}
              </Form.Item>
              <Form.Item
                key="cardNumber"
                label="身份证"
              >
                {getFieldDecorator('cardNumber', {
                  rules: [
                    {
                      pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号'
                    }
                  ],
                  initialValue: props.data.cardNumber
                })(<Input placeholder="请输入" />)}
              </Form.Item>
            </Form>
        </Modal>
    );
};
export default Form.create<Props>()(Save);
