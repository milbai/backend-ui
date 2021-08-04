import * as React from 'react';
import {Button, Card, Col, DatePicker, Form, Icon, message, Radio, Row, Select, Slider} from "antd";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import { createFengmap, clearMap, updateMap, updateLocation } from './fengmap'
import styles from './css/index.css';
import { FormComponentProps } from "antd/lib/form";
import {useEffect} from "react";
import {defer, from} from "rxjs";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import {filter, map} from "rxjs/operators";
import {useState} from "react";
import moment, {Moment} from "moment";
import {connect} from "dva";
import {ConnectState} from "@/models/connect";

interface Props extends FormComponentProps {
}
interface State {
  cm100List: any;
  currentItem: any;
}

const Trajectory: React.FC<Props> = props => {
  const initState: State = {
    cm100List: [],
    currentItem: {
      play: false,
      speed: 400,
      data: [],
      index: 0
    },
  };
  const {
    form: { getFieldDecorator },
    form,
  } = props;
  const [cm100List, setCm100List] = useState(initState.cm100List);
  const [currentItem, setCurrentItem] = useState(initState.currentItem);

  useEffect(() => {
    defer(
      () => from(apis.employee.listAll(encodeQueryParam({ terms: {type: 1} }))).pipe(
      //() => from(apis.deviceInstance.listAll(encodeQueryParam({ terms: {productId: 'CM100-GB'} }))).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      )).subscribe((data) => {
      setCm100List(data);
    });
    createFengmap();

    return () => {
      clearMap(currentItem, setCurrentItem);
    };
  }, []);

  function setSpeed(e:any) {
    const {value} = e.target;
    if(currentItem.speed === parseInt(value))
      return;
    currentItem.speed = parseInt(value);
    if(currentItem.data.length) {
      updateLocation(currentItem, setCurrentItem);
    }
  }

  const onSearch = () => {
    form.validateFields((err, params) => {
      if (err) return;
      if(params.createTime$BTW[1].valueOf() - params.createTime$BTW[0].valueOf() > 3 * 24 * 3600 * 1000) {
        message.error('时间范围不能大于3日！');
        return;
      }
      const formatDate = params.createTime$BTW.map((e: Moment) =>
        moment(e).format('YYYY-MM-DD HH:mm:ss'),
      );
      params.createTime$BTW = formatDate.join(',');
      //params.createTime$BTW = "2021-08-02 10:00:00,2021-08-02 12:00:00";
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
    var userId = param.terms.userId;
    delete param.terms.userId;
    apis.deviceInstance
      .logs1(userId, encodeQueryParam(param))
      .then(response => {
        if (response.status === 200 && response.result.data) {
          clearMap(currentItem, setCurrentItem);
          if(response.result.data.length) {
            var data = response.result.data;
            var points = [];
            for(var i = data.length - 1; i >= 0 ; i--) {
              var p = JSON.parse(data[i].content);
              if(p.badgePos_x >= 12609225.960729167 && p.badgePos_x <= 12610032.132511862 &&
                p.badgePos_y >= 2634433.8295556237 && p.badgePos_y <= 2634690.610197519)
                points.push({
                  x: p.badgePos_x,
                  y: p.badgePos_y,
                  z: 3,
                  time: data[i].createTime ? moment(data[i].createTime).format('YYYY-MM-DD HH:mm:ss') : ''
                });
            }
            currentItem.data = points;
            updateMap(currentItem, setCurrentItem);
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
                <Form.Item label="人员">
                  {getFieldDecorator('userId', {
                    rules: [{ required: true, message: '请选择人员' }]
                  })(
                    <Select showSearch={true} allowClear={true}
                             filterOption={(inputValue, option) =>
                               option?.props?.children?.toUpperCase()?.indexOf(inputValue.toUpperCase()) !== -1
                             }>
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
                        clearMap(currentItem, setCurrentItem);
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
      {
        currentItem.data.length && (
          <div style={{
            position: "absolute",
            bottom: "0",
            right: "20%",
            width: "60%",
          }}>
            <Icon
              type={ currentItem.play ? "pause-circle" : "play-circle"}
              onClick={() => {
                currentItem.play = !currentItem.play;
                updateLocation(currentItem, setCurrentItem);
              }}
              style={{
                color: "#91D5FF",
                fontSize: "28px",
                float: "left",
                marginTop: "5px"
              }}
            />
            <Slider
              tooltipVisible
              tipFormatter={(value) => {
                return currentItem.data[value] ? currentItem.data[value].time : null
              }}
              value={currentItem.index}
              min={0}
              max={currentItem.data.length - 1}
              onChange={(value) => {
                currentItem.index = value;
                updateLocation(currentItem, setCurrentItem);
              }}
              style={{
                marginLeft: "40px"
              }}
            />
          </div>)
      }
    </div>
  </div>
};

export default connect(({}: ConnectState) => ({
}))(Form.create<Props>()(Trajectory))
