import * as React from 'react';
import {Button, Card, Col, DatePicker, Form, message, Radio, Row, Select} from "antd";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import { createFengmap, clearMap, updateMap, set_freq } from './fengmap'
import styles from './css/index.css';
import { FormComponentProps } from "antd/lib/form";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment, {Moment} from "moment";

interface Props extends FormComponentProps {
}
interface State {
  cm100List: any;
}

const Trajectory: React.FC<Props> = props => {
  const initState: State = {
    cm100List: []
  };
  const {
    form: { getFieldDecorator },
    form,
  } = props;
  const [cm100List, setCm100List] = useState(initState.cm100List);

  useEffect(() => {
    defer(
      () => from(apis.deviceInstance.listAll(encodeQueryParam({ terms: {productId: 'CM100-GB'} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      setCm100List(data);
    });
    createFengmap();
  }, []);

  function setSpeed(e:any) {
    const {value} = e.target;
    set_freq(parseInt(value));
  }

  const onSearch = () => {
    form.validateFields((err, params) => {
      if (err) return;
      if (params.createTime$BTW) {
        if(params.createTime$BTW[1].valueOf() - params.createTime$BTW[0].valueOf() > 3 * 24 * 3600 * 1000) {
          message.error('时间范围不能大于3日！');
          return;
        }
        const formatDate = params.createTime$BTW.map((e: Moment) =>
          moment(e).format('YYYY-MM-DD HH:mm:ss'),
        );
        params.createTime$BTW = formatDate.join(',');
      }
      loadLogData({
        pageSize: 10000,
        pageIndex: 0,
        terms: { type$IN: 'reportProperty', ...params },
        sorts: {
          field: 'createTime',
          order: 'desc',
        },
      });
    });
  };

  const loadLogData = (param: any) => {
    apis.deviceInstance
      .logs(param.terms.deviceId, encodeQueryParam(param))
      .then(response => {
        if (response.status === 200 && response.result.data) {
          clearMap();
          console.log(response.result.data);
          if(response.result.data.length) {
            updateMap(response.result.data);
          } else {
            message.info('无轨迹记录');
          }
        }
      })
      .catch(() => {});
  };

  return <div>
    <PageHeaderWrapper title="轨迹记录">
      <Card bordered={false}>
        <div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Row gutter={{ md: 8, lg: 4, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item label="设备名称">
                  {getFieldDecorator('deviceId', {
                    rules: [{ required: true, message: '请选择设备' }]
                  })(
                    <Select>
                      {cm100List.map(item => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>,
                  )}
                </Form.Item>
              </Col>
              <Col md={10} sm={24}>
                <Form.Item label="日期">
                  {getFieldDecorator('createTime$BTW', {
                    rules: [{ required: true, message: '请选择时间范围' }]
                  })(
                    <DatePicker.RangePicker
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['开始时间', '结束时间']}
                    />,
                  )}
                </Form.Item>
              </Col>
              <Col md={6} sm={24}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ float: 'right', marginBottom: 24 }}>
                    <Button
                      icon="search"
                      type="primary"
                      onClick={() => {
                        onSearch();
                      }}
                    >
                      查询
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        form.resetFields();
                        clearMap();
                      }}
                    >
                      重置
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Card>
    </PageHeaderWrapper>
    <div className={styles.mapout}>
      <div className={styles.fengMap} id="fengmap"></div>
      <div className={styles.mapmask}></div>
      <div style={{
        position: "absolute",
        top: "203px",
        right: "3px"
      }}>
        <Radio.Group defaultValue="400" onChange={setSpeed}>
          <Radio.Button value="1600">
            1倍
          </Radio.Button>
          <Radio.Button value="800">
            2倍
          </Radio.Button>
          <Radio.Button value="400">
            4倍
          </Radio.Button>
          <Radio.Button value="200">
            8倍
          </Radio.Button>
          <Radio.Button value="100">
            16倍
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  </div>
};

export default Form.create<Props>()(Trajectory);
