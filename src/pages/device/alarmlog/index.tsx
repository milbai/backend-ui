import SearchForm from "@/components/SearchForm";
import ProTable from "@/pages/system/permission/component/ProTable";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { Card, Divider, message, Modal, Tag, Input, Form, Select, Icon } from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import { FormComponentProps } from "antd/lib/form";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { AlarmLog } from "../alarm/data";
import {createFengmap, updateMarkers} from "@/pages/device/alarmlog/fengmap";
import styles from "./css/index.css";

interface Props extends FormComponentProps {
    location: any;
}
const Alarmlog: React.FC<Props> = props => {
    const {
        form: { getFieldDecorator },
        form,
    } = props;
    const {
        location: { query }
    } = props;
    const [loading, setLoading] = useState(false);
    const [solveVisible, setSolveVisible] = useState(false);
    const [solveAlarmLogId, setSolveAlarmLogId] = useState();
    const [result, setResult] = useState<any>({});
    const productList = useRef<any[]>([]);
    const [searchParam, setSearchParam] = useState(
        query.alarmId ? {
            pageSize: 10,
            terms: { id: query.alarmId },
            sorts: {
                order: "descend",
                field: "alarmTime"
            }
      } : (
        query.deviceId ? {
          pageSize: 10,
          terms: {deviceId: query.deviceId},
          sorts: {
            order: "descend",
            field: "alarmTime"
          }
        } : {
            pageSize: 10,
            sorts: {
                order: "descend",
                field: "alarmTime"
            }
        }
      ));
    useEffect(() => {
        handleSearch(searchParam);
        apis.deviceProdcut.queryNoPagin(
            encodeQueryParam({ paging: false }))
            .then((resp) => {
                if (resp.status === 200) {
                    productList.current = resp.result;
                }
            });
        createFengmap();
    }, []);
    const handleSearch = (params?: any) => {
        setSearchParam(params);
        setLoading(true);
        apis.deviceAlarm.findAlarmLog(encodeQueryParam(params))
            .then((response: any) => {
                if (response.status === 200) {
                    setResult(response.result);
                }
            }).finally(() => { setLoading(false) });

    };
    const alarmSolve = () => {
        form.validateFields((err, fileValue) => {
            if (err) return;

            apis.deviceAlarm.alarmLogSolve(solveAlarmLogId, { type: fileValue.type, description : fileValue.description})
                .then((response: any) => {
                    if (response.status === 200) {
                        message.success('保存成功');
                        setSolveAlarmLogId(undefined);
                        setSolveVisible(false);
                        handleSearch(searchParam);
                    }
                })
                .catch(() => {
                })
        });
    };
    const alarmLogColumns: ColumnProps<AlarmLog>[] = [
        {
            title: '设备ID',
            dataIndex: 'deviceId',
        },
        {
            title: '设备名称',
            dataIndex: 'deviceName',
        },
        {
            title: '告警条件',
            dataIndex: 'alarmName',
        },
        {
            title: '告警时间',
            dataIndex: 'alarmTime',
            width: '200px',
            render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/',
            sorter: true,
            defaultSortOrder: 'descend'
        },
        {
            title: '处理状态',
            dataIndex: 'state',
            align: 'center',
            width: '100px',
            render: text => text === 'solve' ? <Tag color="#87d068">已处理</Tag> : <Tag color="#f50">未处理</Tag>,
        },
        {
            title: '操作',
            width: '220px',
            align: 'center',
            render: (record: any) => (
                <Fragment>
                    <a onClick={() => {
                        let content: string;
                        try {
                            content = JSON.stringify(record.alarmData, null, 2);
                        } catch (error) {
                            content = record.alarmData;
                        }
                        Modal.confirm({
                            width: '40VW',
                            title: '告警数据',
                            content: <pre>{content}
                                {record.state === 'solve' && (
                                    <>
                                        <br /><br />
                                        <span style={{ fontSize: 16 }}>报警类型：{record.type}</span>
                                        <br />
                                        <span style={{ fontSize: 16 }}>处理结果：</span>
                                        <br />
                                        <p>{record.description}</p>
                                    </>
                                )}
                            </pre>,
                            okText: '确定',
                            cancelText: '关闭',
                        })
                    }}>详情</a>
                  <Divider type="vertical" />
                  <a onClick={() => {
                    apis.deviceInstance.info(record.deviceId)
                      .then(response => {
                        if (response.status === 200 && response.result) {
                          updateMarkers(response.result);
                          document.getElementById('mymap').style.visibility = "visible";
                        } else {
                          message.error(`获取位置信息失败，${response.message}`);
                        }
                      })
                      .catch(() => {});
                  }}>位置</a>
                    {
                        record.state !== 'solve' ? <Divider type="vertical" /> : ''
                    }
                    {
                        record.state !== 'solve' && (
                            <a onClick={() => {
                                setSolveAlarmLogId(record.id);
                                setSolveVisible(true);
                            }}>处理</a>
                        )
                    }
                </Fragment>
            )
        },
    ];
    return (
        <PageHeaderWrapper title="告警记录">
          <div id={"mymap"} className={styles.mapout} style={{visibility: "hidden"}}>
            <div className={styles.fengMap} id="fengmap"></div>
            <div className={styles.mapmask}></div>
            <Icon
              type="close"
              onClick={() => {
                document.getElementById('mymap').style.visibility = "hidden";
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "20px",
                color: "#91D5FF",
                fontSize: "38px"
              }}
            />
          </div>
          {!(query.alarmId || query.deviceId) && (<Card bordered={false} style={{ marginBottom: 16 }}>
                <div>
                    <div>

                        <SearchForm
                            search={(params: any) => {
                                handleSearch({
                                    terms: { ...params },
                                    pageSize: 10,
                                    sorts: searchParam.sorts
                                });
                            }}
                            formItems={[{
                                label: '设备ID',
                                key: 'deviceId$like',
                                type: 'string',
                            },
                            {
                                label: '产品',
                                key: 'productId$IN',
                                type: 'list',
                                props: {
                                    data: productList.current,
                                    mode: 'tags',
                                }
                            },
                            {
                                label: '告警时间',
                                key: 'alarmTime$btw',
                                type: 'time',
                            },
                            ]}
                        />
                    </div>
                </div>
            </Card>)}
            <Card>
                <ProTable
                    loading={loading}
                    dataSource={result?.data}
                    columns={alarmLogColumns}
                    rowKey="id"
                    onSearch={(params: any) => {
                        handleSearch(params);
                    }}
                    paginationConfig={result}
                />
            </Card>
            {solveVisible && (
                <Modal
                    title='告警处理结果'
                    //title='告警设备位置'
                    visible
                    okText="确定"
                    cancelText="取消"
                    width='700px'
                    onOk={() => {
                        alarmSolve();
                    }}
                    onCancel={() => {
                        setSolveVisible(false);
                        setSolveAlarmLogId(undefined);
                    }}
                >
                    <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} key="solve_form">
                        <Form.Item label="报警类型">
                            {getFieldDecorator('type', {
                                rules: [{ required: true, message: '请选择围栏区域' }],
                                initialValue: '误报',
                            })(<Select placeholder="请选择">
                                <Select.Option value="误报" key='miss'>误报</Select.Option>
                                <Select.Option value="事故" key='accident'>事故</Select.Option>
                            </Select>)}
                        </Form.Item>
                        <Form.Item key="description" label="处理结果">
                            {getFieldDecorator('description', {
                                rules: [
                                    { required: true, message: '请输入处理结果' },
                                    { max: 2000, message: '处理结果不超过2000个字符' }
                                ],
                            })(
                                <Input.TextArea rows={8} placeholder="请输入处理结果" />,
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </PageHeaderWrapper>
    )
}

export default Form.create<Props>()(Alarmlog);
