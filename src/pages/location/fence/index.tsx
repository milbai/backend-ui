import React, { Fragment, useEffect, useState } from 'react';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/es/table';
import {Button, Card, Divider, message, Modal, Table, Tag} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import { connect } from 'dva';
import moment from 'moment';
import { FenceItem } from './data';
import { ConnectState, Dispatch } from '@/models/connect';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './save';
import SearchForm from '@/components/SearchForm';

interface Props {
  fence: any;
  dispatch: Dispatch;
  location: Location;
  loading: boolean;
}

interface State {
  data: any;
  searchParam: any;
  saveVisible: boolean;
  current: Partial<FenceItem>;
}

const FenceList: React.FC<Props> = props => {
  const { dispatch } = props;
  const { result } = props.fence;

  const initState: State = {
    data: result,
    searchParam: {
      pageSize: 10,
    },
    saveVisible: false,
    current: {},
  };

  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [current, setCurrent] = useState(initState.current);

  const columns: ColumnProps<FenceItem>[] = [
    {
      title: '围栏名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '告警名称',
      width: 180,
      render: (text, record) =>
        (<Fragment>
          {record.insideAlarm ? (<Tag color='#108ee9'>未进入</Tag>) : ''}
          {record.outsideAlarm ? (<Tag color='#108ee9'>离开</Tag>) : ''}
        </Fragment>),
    },
    {
      title: '开始时间',
      dataIndex: 'begin',
      width: 200,
      sorter: true,
      ellipsis: true,
      defaultSortOrder: 'descend',
      render: text => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '',
    },
    {
      title: '结束时间',
      dataIndex: 'end',
      width: 200,
      sorter: true,
      ellipsis: true,
      defaultSortOrder: 'descend',
      render: text => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '',
    },
    {
      title: '围栏状态',
      width: 150,
      ellipsis: true,
      render: (text, record) =>
        <Tag color={record.begin && record.end && record.begin < moment().valueOf() && moment().valueOf() < record.end ?
          '#108ee9' : '#f50'}>{record.begin && record.end && record.begin < moment().valueOf() && moment().valueOf() < record.end ?
          '开启' : '关闭'}</Tag>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => edit(record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => handleDelete(record)}>删除</a>
        </Fragment>
      ),
    },
  ];
  const handleSearch = (params?: any) => {
    dispatch({
      type: 'fence/query',
      payload: encodeQueryParam(params),
    });
    setSearchParam(params);
  };

  useEffect(() => {
    handleSearch(searchParam);
  }, []);

  const saveOrUpdate = (item: FenceItem) => {
    dispatch({
      type: 'fence/insert',
      payload: encodeQueryParam(item),
      callback: (response: any) => {
        if (response.status === 200) {
          message.success("操作成功");
          setSaveVisible(false);
          handleSearch(searchParam);
          setCurrent({})
        } else {
          message.error(`操作失败，${response.message}`);
        }
      }
    })
  };

  const edit = (record: FenceItem) => {
    setCurrent(record);
    setSaveVisible(true);
  };

  const handleDelete = (params: any) => {
    Modal.confirm({
      title: '确定删除吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'fence/remove',
          payload: params.id,
          callback: response => {
            if (response.status === 200) {
              message.success("删除成功");
              handleSearch(searchParam);
            } else {
              message.error("删除失败");
            }
          }
        });
      },
    })
  };

  const onTableChange = (pagination: PaginationConfig, filters: any, sorter: SorterResult<any>, extra: any) => {
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam,
      sorts: sorter,
    });
  };

  return (
    <PageHeaderWrapper title="虚拟电子围栏">
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                setSearchParam(params);
                handleSearch({ terms: params, pageSize: 10 })
              }}
              formItems={[
                {
                  label: "围栏名称",
                  key: "name$LIKE",
                  type: 'string'
                },
              ]}
            />
          </div>
          <div className={styles.tableListOperator}>
            <Button icon="plus" type="primary" onClick={() => { setSaveVisible(true) }}>
              新建
            </Button>
          </div>
          <div className={styles.StandardTable}>
            <Table
              loading={props.loading}
              dataSource={(result || {}).data}
              columns={columns}
              rowKey="id"
              onChange={onTableChange}
              pagination={{
                current: result.pageIndex + 1,
                total: result.total,
                pageSize: result.pageSize,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total: number) => `共 ${total} 条记录 第  ${result.pageIndex + 1}/${Math.ceil(result.total / result.pageSize)}页`
              }}
            />
          </div>
        </div>
      </Card>
      {
        saveVisible &&
        <Save
          data={current}
          close={() => { setSaveVisible(false); setCurrent({}) }}
          save={(fence: FenceItem) => { saveOrUpdate(fence) }}
        />
      }
    </PageHeaderWrapper>
  );
};
export default connect(({ fence, loading }: ConnectState) => ({
  fence,
  loading: loading.models.fence,
}))(FenceList);
