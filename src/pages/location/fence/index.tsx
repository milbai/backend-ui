import React, { Fragment, useEffect, useState } from 'react';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/es/table';
import { Card, Table, Tag } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import { connect } from 'dva';
import moment from 'moment';
import { SystemLoggerItem } from './data.d';
import { ConnectState, Dispatch } from '@/models/connect';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './save';
import SearchForm from '@/components/SearchForm1';

interface Props {
  systemLogger: any;
  dispatch: Dispatch;
  location: Location;
  loading: boolean;
}

interface State {
  data: any;
  searchParam: any;
  saveVisible: boolean;
  current: Partial<SystemLoggerItem>;
}

const SystemLoggerList: React.FC<Props> = props => {
  const { dispatch } = props;

  const { result } = props.systemLogger;

  const initState: State = {
    data: result,
    searchParam: {
      pageSize: 10,
      sorts: {
        field: 'createTime',
        order: 'desc',
      },
    },
    saveVisible: false,
    current: {},
  };

  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [current, setCurrent] = useState(initState.current);

  const columns: ColumnProps<SystemLoggerItem>[] = [
    // {
    //   title: '序号',
    //   dataIndex: 'id',
    //   width: 60,
    //   render: (_, __, index) => index + 1,
    // },

    {
      title: '围栏ID',
      dataIndex: 'threadName',
      ellipsis: true
    },
    {
      title: '围栏名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '告警名称',
      dataIndex: 'level',
      width: 180,
      render: text => <Tag color={text === 'ERROR' ? 'red' : 'orange'}>{text}</Tag>,
    },
    {
      title: '开始时间',
      dataIndex: 'createTime',
      width: 200,
      sorter: true,
      ellipsis: true,
      defaultSortOrder: 'descend',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      dataIndex: 'exceptionStack',
      ellipsis: true,
    },
    {
      title: '围栏状态',
      dataIndex: 'context.server',
      width: 150,
      ellipsis: true
    },

    {
      title: '操作',
      render: (_, record) => (
        <Fragment>
          <a
            onClick={() => {
              setCurrent(record);
              setSaveVisible(true);
            }}
          >
            详情
          </a>
        </Fragment>
      ),
    },
  ];
  const handleSearch = (params?: any) => {
    dispatch({
      type: 'systemLogger/query',
      payload: encodeQueryParam(params),
    });
    setSearchParam(params);
  };

  useEffect(() => {
    handleSearch(searchParam);
  }, []);

  const saveOrUpdate = (item: SystemLoggerItem) => {
    dispatch({
      type: 'systemLogger/insert',
      payload: encodeQueryParam(item),
      callback: response => {
        if (response) {
          setSaveVisible(false);
          handleSearch(searchParam);
        }
      },
    });
  };

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<SystemLoggerItem>,
  ) => {
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam.terms,
      sorts: sorter.field ? sorter : searchParam.sorter,
    });
  };

  return (
    <PageHeaderWrapper title="虚拟电子围栏">
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div>
            {/* <Search
              search={(params: any) => {
                setSearchParam(params);
                handleSearch({ terms: params, pageSize: 10, sorts: searchParam.sorts });
              }}
            /> */}
            <SearchForm
              search={(params: any) => {
                setSearchParam(params);
                handleSearch({ terms: params, pageSize: 10, sorts: searchParam.sorts });
              }}
              formItems={[
                {
                  label: '围栏名称',
                  key: '请输入围栏名称',
                  type: 'string',
                },
                {
                  label: '围栏区域',
                  key: 'message$LIKE111',
                  type: 'button1',
                },
                {
                  label: '围栏时间',
                  key: 'createTime$btw1',
                  type: 'time',
                },
                {
                  label: '人员离开告警',
                  key: 'message$LIKE11',
                  type: 'switch',
                },
                {
                  label: '超时设置',
                  key: 'message$LIKE1',
                  type: 'number',
                },
                {
                  label: '允许进入人员',
                  key: 'message$LIKE1211',
                  type: 'button2',
                },
                {
                  label: '人员未进入告警',
                  key: 'message$LIKE131',
                  type: 'switch',
                },
                {
                  label: '超时设置',
                  key: 'message$LIKE21',
                  type: 'number',
                },
              ]}
            />
          </div>
          <div className={styles.StandardTable}>
            <Table
              loading={props.loading}
              dataSource={({}).data}
              columns={columns}
              rowKey="id"
              onChange={onTableChange}
              pagination={{
                current: result.pageIndex + 1,
                total: 0,
                pageSize: result.pageSize,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total: number) =>
                  `共 ${total} 条记录 第  ${result.pageIndex + 1}/${Math.ceil(
                    result.total / result.pageSize,
                  )}页`,
              }}
            />
          </div>
        </div>
      </Card>
      {saveVisible && (
        <Save
          data={current}
          close={() => {
            setSaveVisible(false);
          }}
          save={(data: SystemLoggerItem) => {
            saveOrUpdate(data);
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};
export default connect(({ systemLogger, loading }: ConnectState) => ({
  systemLogger,
  loading: loading.models.systemLogger,
}))(SystemLoggerList);
