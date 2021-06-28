import React, { Fragment, useEffect, useState } from 'react';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/es/table';
import {AccessItem} from './data';
import { Button, Card, Divider, message, Modal, Table } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import { ConnectState, Dispatch } from '@/models/connect';
import { connect } from 'dva';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './save';

interface Props {
  access: any;
    dispatch: Dispatch;
    location: Location;
    loading: boolean;
}

interface State {
    data: any;
    searchParam: any;
    saveVisible: boolean;
    currentItem: Partial<AccessItem>;
}

const AccessList: React.FC<Props> = props => {

    const { dispatch } = props;
    const { result } = props.access;

    const initState: State = {
        data: result,
        searchParam: { pageSize: 10 },
        saveVisible: false,
        currentItem: {}
    };

    const [searchParam, setSearchParam] = useState(initState.searchParam);
    const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
    const [currentItem, setCurrentItem] = useState(initState.currentItem);

    const columns: ColumnProps<AccessItem>[] = [
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '地址',
        dataIndex: 'address',
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
        setSearchParam(params);
        dispatch({
            type: 'access/query',
            payload: encodeQueryParam(params)
        });
    };

    useEffect(() => {
        handleSearch(searchParam);
    }, []);

    const edit = (record: AccessItem) => {
        setCurrentItem(record);
        setSaveVisible(true);
    };
    const saveOrUpdate = (user: AccessItem) => {
        dispatch({
            type: 'access/insert',
            payload: encodeQueryParam(user),
            callback: (response: any) => {
                if (response.status === 200) {
                    message.success("操作成功");
                    setSaveVisible(false);
                    handleSearch(searchParam);
                    setCurrentItem({})
                } else {
                    message.error(`操作失败，${response.message}`);
                }
            }
        })
    };

    const handleDelete = (params: any) => {
        Modal.confirm({
            title: '确定删除吗？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch({
                    type: 'access/remove',
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
        <PageHeaderWrapper
            title="接入管理"
        >
            <Card bordered={false}>
                <div className={styles.tableList}>
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
                    data={currentItem}
                    close={() => { setSaveVisible(false); setCurrentItem({}) }}
                    save={(user: AccessItem) => { saveOrUpdate(user) }}
                />
            }
        </PageHeaderWrapper>
    )
};
export default connect(({ access, loading }: ConnectState) => ({
  access,
    loading: loading.models.access
}))(AccessList)
