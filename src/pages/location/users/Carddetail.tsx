import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, {useEffect, useState} from 'react';
import { router } from 'umi';
import styles from "@/utils/table.less";
import {Card, Table} from "antd";
import {ConnectState, Dispatch} from "@/models/connect";
import {CardItem} from "./card";
import {ColumnProps, PaginationConfig, SorterResult} from "antd/es/table";
import encodeQueryParam from "@/utils/encodeParam";
import {connect} from "dva";
import moment from "moment";

interface Props {
  employee: any;
  dispatch: Dispatch;
  location: any;
  loading: boolean;
}

interface State {
  data: any;
  searchParam: any;
}

const Carddetail: React.FC<Props> = props => {
  const {
    location: { query },
    dispatch
  } = props;
  const { result } = props.employee;

  const initState: State = {
    data: result,
    searchParam: { pageSize: 10, terms: {userId: query.id} },
  };
  const [searchParam, setSearchParam] = useState(initState.searchParam);

  const columns: ColumnProps<CardItem>[] = [
    {
      title: '卡号',
      dataIndex: 'deviceId',
    },
    {
      title: '绑定时间',
      dataIndex: 'takeTime',
      width: 200,
      sorter: true,
      ellipsis: true,
      defaultSortOrder: 'descend',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),

    },
    {
      title: '解绑时间',
      dataIndex: 'backTime',
      width: 200,
      sorter: true,
      ellipsis: true,
      defaultSortOrder: 'descend',
      render: text => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '',
    },
  ];

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    dispatch({
      type: 'employee/carddetail',
      payload: encodeQueryParam(params)
    });
  };

  useEffect(() => {
    handleSearch(searchParam);
  }, []);

  const onTableChange = (pagination: PaginationConfig, filters: any, sorter: SorterResult<any>, extra: any) => {
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam,
      sorts: sorter,
    });
  };

  return (
    <PageHeaderWrapper
      onBack={() => router.push('/location/user')}
      title={<>{'绑卡记录-' + query.name}</>}
    >
      <Card bordered={false}>
        <div className={styles.tableList}>
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
    </PageHeaderWrapper>
  );
};

export default connect(({ employee, loading }: ConnectState) => ({
  employee,
  loading: loading.models.employee
}))(Carddetail)
