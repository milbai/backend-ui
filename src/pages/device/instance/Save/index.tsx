import React, { useEffect, useState } from 'react';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import { Input, message, Modal, Select, TreeSelect } from 'antd';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import apis from '@/services';
import { DeviceProduct } from '../../product/data.d';
import { DeviceInstance } from '../data.d';
import { router } from "umi";
import encodeQueryParam from '@/utils/encodeParam';

interface Props extends FormComponentProps {
  close: Function;
  data: Partial<DeviceInstance>;
}

interface State {
  productList: DeviceProduct[];
  organizationList: any[];
}

const Save: React.FC<Props> = props => {
  const initState: State = {
    productList: [],
    organizationList: [],
  };
  const [productList, setProductList] = useState(initState.productList);
  // 消息协议
  const [organizationList, setOrganizationList] = useState(initState.organizationList);
  const {
    form: { getFieldDecorator },
    form,
  } = props;
  const submitData = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;

      const product: Partial<DeviceProduct> =
        productList.find(i => i.id === fileValue.productId) || {};

      preservation({
        ...fileValue,
        productName: product.name,
        state: { text: "未激活", value: "notActive" },
      });
    });
  };

  const preservation = (item: any) => {
    if (props.data.id) {
      apis.deviceInstance.saveOrUpdate(item)
        .then((response: any) => {
          if (response.status === 200) {
            message.success('保存成功');
            props.close();
            router.push(`/device/instance/save/${item.id}`);
          }
        })
        .catch(() => {
        });
    } else {
      apis.deviceInstance.saveDevice(item)
        .then((response: any) => {
          if (response.status === 200) {
            message.success('保存成功');
            props.close();
            router.push(`/device/instance/save/${item.id}`);
          }
        })
        .catch(() => {
        });
    }
  };

  useEffect(() => {
    // 获取下拉框数据
    apis.deviceProdcut
      .queryNoPagin(encodeQueryParam({
        paging: false
      }))
      .then(response => {
        setProductList(response.result);
      })
      .catch(() => {
      });

    apis.deviceProdcut.queryOrganization()
      .then((res: any) => {
        if (res.status === 200) {
          let orgList: any = [];
          res.result.map((item: any) => {
            orgList.push({ id: item.id, pId: item.parentId, value: item.id, title: item.name })
          });
          setOrganizationList(orgList);
        }
      }).catch(() => {
      });
  }, []);

  return (
    <Modal
      title={`${props.data.id ? '编辑' : '新建'}设备`}
      visible
      okText="确定"
      cancelText="取消"
      onOk={() => {
        submitData();
      }}
      onCancel={() => props.close()}
    >
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item key="id" label="设备id">
          {getFieldDecorator('id', {
            rules: [
              { required: true, message: '请输入设备id' },
              { max: 64, message: '设备ID不超过64个字符' },
              { pattern: new RegExp(/^[0-9a-zA-Z_\-]+$/, "g"), message: '产品ID只能由数字、字母、下划线、中划线组成' }
            ],
            initialValue: props.data.id,
          })(<Input placeholder="请输入设备id" readOnly={!!props.data.id} />)}
        </Form.Item>
        <Form.Item key="name" label="设备名称">
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: '请输入设备名称' },
              { max: 200, message: '设备名称不超过200个字符' }
            ],
            initialValue: props.data.name,
          })(<Input placeholder="请输入设备名称" />)}
        </Form.Item>
        <Form.Item key="productId" label="产品">
          {getFieldDecorator('productId', {
            rules: [{ required: true }],
            initialValue: props.data.productId,
          })(
            <Select placeholder="请选择产品">
              {(productList || []).map(item => (
                <Select.Option
                  key={JSON.stringify({ productId: item.id, productName: item.name })}
                  value={item.id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>,
          )}
        </Form.Item>

        <Form.Item key="longitude" label="经度">
          {getFieldDecorator('longitude', {
            rules: [
              { message: '请输入经度' },
              { pattern: new RegExp(/^\d+(\.{0,1}\d+){0,1}$/, "g"), message: '请输入数字' }
            ],
            initialValue: props.data.longitude
          })(<Input placeholder="请输入" />)}
        </Form.Item>
        <Form.Item key="latitude" label="纬度">
          {getFieldDecorator('latitude', {
            rules: [
              { message: '请输入纬度' },
              { pattern: new RegExp(/^\d+(\.{0,1}\d+){0,1}$/, "g"), message: '请输入数字' }
            ],
            initialValue: props.data.latitude
          })(<Input placeholder="请输入" />)}
        </Form.Item>

        <Form.Item key="orgId" label="所属机构">
          {getFieldDecorator('orgId', {
            initialValue: props.data.orgId,
          })(
            <TreeSelect
              allowClear treeDataSimpleMode showSearch
              placeholder="所属机构" treeData={organizationList}
              treeNodeFilterProp='title' searchPlaceholder='根据机构名称模糊查询'
            />
          )}
        </Form.Item>

        <Form.Item key="describe" label="说明">
          {getFieldDecorator('describe', {
            initialValue: props.data.describe,
          })(<Input.TextArea rows={4} placeholder="请输入至少五个字符" />)}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default connect(({ deviceProduct, loading }: ConnectState) => ({
  deviceProduct,
  loading,
}))(Form.create<Props>()(Save));
