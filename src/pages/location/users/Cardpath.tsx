import * as React from 'react';
import {Button, Card, Col, DatePicker, Form, message, Row, Select, Switch} from "antd";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import {createFengmap, drawNaviLine, naviData} from './fengmap'
import styles from './css/index.css';
import { FormComponentProps } from "antd/lib/form";
import {useEffect} from "react";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {useState} from "react";
import moment from "moment";
import {router} from "umi";
import {UserItem} from "@/pages/location/users/data";

interface Props extends FormComponentProps {
  location: any;
}

interface State {
  currentItem: Partial<UserItem>;
  showVisible: boolean;
}

const paths = [
  [
    //路径1，走廊: start - end
    { x: 12609730.584668012, y: 2634680.204680953, z: 56},
    { x: 12609628.452463193, y: 2634483.8905584496, z: 56}
  ],
  [
    // 路径2，月检站：start - end
    { x: 12609729.815250406, y: 2634669.4546577465, z: 56 },
    { x: 12609350.735470776, y: 2634668.477778039, z: 56 }
  ],
  [
    // 路径3，维修线：start - end
    { x: 12609730.584668012, y: 2634680.204680953, z: 56 },
    { x: 12609353.564902872, y: 2634639.0095029576, z: 56 }
  ]
];

const Cardpath: React.FC<Props> = props => {
  const {
    location: { query },
    form: { getFieldDecorator },
    form,
  } = props;
  const initState: State = {
    currentItem: {},
    showVisible: true,
  };
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [showVisible, setShowVisible] = useState(initState.showVisible);

  useEffect(() => {
    apis.employee.info(query.id)
      .then((response: any) => {
        if (response.status === 200 && response.result) {
          console.log(response.result);
          setCurrentItem(response.result);
          createFengmap(response.result);
        } else {
          message.error(`获取数据失败，${response.message}`);
        }
      });
  }, []);

  const onSave = () => {
    form.validateFields((err, params) => {
      if (err) return;
      currentItem.begin = moment(params.createTime$BTW[0]).valueOf();
      currentItem.end = moment(params.createTime$BTW[1]).valueOf();
      currentItem.startPointX = naviData.startPointX;
      currentItem.startPointY = naviData.startPointY;
      currentItem.endPointX = naviData.endPointX;
      currentItem.endPointY = naviData.endPointY;
      currentItem.pathPoints = naviData.pathPoints;
      currentItem.pathName = params.pathName;
      apis.employee
        .saveOrUpdate(encodeQueryParam(currentItem))
        .then(response => {
          if (response.status === 200) {
            message.success("保存成功");
            setShowVisible(true);
          } else {
            message.error(`保存失败，${response.message}`);
          }
        })
        .catch(() => {});
    });
  };

  const handle_switch = (b: boolean) => {
    currentItem.state = b;
    apis.employee
      .saveOrUpdate(encodeQueryParam(currentItem))
      .then(response => {
        if (response.status === 200) {
          message.success("操作成功");
        } else {
          message.error(`操作失败，${response.message}`);
        }
      })
      .catch(() => {});
  };

  return <div>
    <PageHeaderWrapper
      onBack={() => router.push('/location/user')}
      title={<>{'路径规划-' + query.name}</>}
    >
      <Card bordered={false}>
        <div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {currentItem.pathName && showVisible ? (<Row gutter={{ md: 8, lg: 4, xl: 48 }}>
                <Col md={4} sm={8}>
                  <Form.Item label="路径：">
                    {currentItem.pathName}
                  </Form.Item>
                </Col>
              <Col md={6} sm={14}>
                <Form.Item label="开始时间：">
                  {moment(currentItem.begin).format('YYYY-MM-DD HH:mm:ss')}
                </Form.Item>
              </Col>
              <Col md={6} sm={14}>
                <Form.Item label="结束时间：">
                  {moment(currentItem.end).format('YYYY-MM-DD HH:mm:ss')}
                </Form.Item>
              </Col>
              <Col md={6} sm={12}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ float: 'right', marginBottom: 24 }}>
                    <Button
                      type="primary"
                      onClick={() => {
                        setShowVisible(false);
                      }}
                    >
                      编辑
                    </Button>
                    <Switch
                      style={{ marginLeft: 38 }}
                      defaultChecked={currentItem.state} onChange={(b) => {
                      handle_switch(b);
                    }} />
                  </div>
                </div>
              </Col>
            </Row>) :
            (<Row gutter={{ md: 8, lg: 4, xl: 48 }}>
              <Col md={8} sm={12}>
                <Form.Item label="路径">
                  {getFieldDecorator('pathName', {
                    rules: [{ required: true, message: '请选择路径' }],
                    initialValue: currentItem.pathName,
                  })(<Select placeholder="请选择" onChange={value => {
                    drawNaviLine(value);
                  }}>
                    <Select.Option value="路径A" key='path1'>路径A</Select.Option>
                    <Select.Option value="路径B" key='path2'>路径B</Select.Option>
                    <Select.Option value="路径C" key='path3'>路径C</Select.Option>
                  </Select>)}
                </Form.Item>
              </Col>
              <Col md={8} sm={24}>
                <Form.Item label="时间">
                  {getFieldDecorator('createTime$BTW', {
                    rules: [{ required: true, message: '请选择时间' }],
                    initialValue: currentItem.begin ? [moment(currentItem.begin), moment(currentItem.end)] : null
                  })(
                    <DatePicker.RangePicker
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['开始时间', '结束时间']}
                    />,
                  )}
                </Form.Item>
              </Col>
              <Col md={6} sm={12}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ float: 'right', marginBottom: 24 }}>
                    <Button
                      type="primary"
                      onClick={() => {
                        onSave();
                      }}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>)}
          </Form>
        </div>
      </Card>
    </PageHeaderWrapper>
    <div className={styles.mapout}>
      <div className={styles.fengMap} id="fengmap"></div>
      <div className={styles.mapmask}></div>
    </div>
  </div>
};

export default Form.create<Props>()(Cardpath);
