import React, { Fragment, useEffect, useState } from 'react';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/es/table';
import { UserItem } from './data';
import { Button, Card, Divider, message, Modal, Popconfirm, Table } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import { ConnectState, Dispatch } from '@/models/connect';
import { connect } from 'dva';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './save';
import SearchForm from '@/components/SearchForm';
import Save1 from "./save/save1";
import {router} from "umi";
import UnBind from "./unBind";
import apis from "@/services";

interface Props {
    employee: any;
    dispatch: Dispatch;
    location: Location;
    loading: boolean;
}

interface State {
    data: any;
    searchParam: any;
    saveVisible: boolean;
    currentItem: Partial<UserItem>;
    save1Visible: boolean;
    unbindVisible: boolean;
}

const UserList: React.FC<Props> = props => {

    const { dispatch } = props;
    const { result } = props.employee;

    const initState: State = {
        data: result,
        searchParam: { pageSize: 10, terms: {type: 1} },
        saveVisible: false,
        currentItem: {},
        save1Visible: false,
        unbindVisible: false
    };

    const [searchParam, setSearchParam] = useState(initState.searchParam);
    const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
    const [currentItem, setCurrentItem] = useState(initState.currentItem);
    const [save1Visible, setSave1Visible] = useState(initState.save1Visible);
    const [unbindVisible, setUnbindVisible] = useState(initState.unbindVisible);

    const columns: ColumnProps<UserItem>[] = [
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '部门',
        dataIndex: 'department',
      },
      {
        title: '电话',
        dataIndex: 'telephone',
      },
      {
        title: '身份证',
        dataIndex: 'cardNumber',
      },
      {
        title: '卡号',
        dataIndex: 'deviceId',
      },
        {
            title: '操作',
            render: (text, record) => (
                <Fragment>
                    <a onClick={() => edit(record)}>编辑</a>
                    <Divider type="vertical" />
                  <a onClick={() => {
                    router.push({
                      pathname: '/location/user/path',
                      query: { name: record.name, id: record.id },
                    })
                  }}>路径</a>
                  <Divider type="vertical" />
                    <a onClick={() => {
                      router.push({
                        pathname: '/location/user/detail',
                        query: { name: record.name, id: record.id },
                      })
                    }}>记录</a>
                    <Divider type="vertical" />
                    {record.deviceId ? (
                      <Popconfirm
                        title="确认解绑？"
                        onConfirm={() => {
                          handleUnbind(record);
                        }}
                      >
                        <a>解绑</a>
                      </Popconfirm>
                    ) : (
                      <span>
                        <a onClick={() => bind(record)}>绑卡</a>
                        <Divider type="vertical" />
                        <a onClick={() => handleDelete(record)}>删除</a>
                      </span>
                     )}
                </Fragment>
            ),
        },
    ];


    const handleSearch = (params?: any) => {
        setSearchParam(params);
        dispatch({
            type: 'employee/query',
            payload: encodeQueryParam(params)
        });
    };

    useEffect(() => {
        // const tem = new Service<UserItem, 'user'>().save({}).subscribe(
        //     (data: any) => console.log(data.response.result),
        // );
        // console.log(tem, 'temp');
        handleSearch(searchParam);
    }, []);

    const edit = (record: UserItem) => {
        setCurrentItem(record);
        setSaveVisible(true);
    };
  const bind = (record: UserItem) => {
    setCurrentItem(record);
    setSave1Visible(true);
  };

    const saveOrUpdate = (user: UserItem) => {
        dispatch({
            type: 'employee/insert',
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
  const bond = (user: UserItem) => {
    dispatch({
      type: 'employee/bond',
      payload: encodeQueryParam(user),
      callback: (response: any) => {
        if (response.status === 200) {
          message.success("绑卡成功");
          setSave1Visible(false);
          handleSearch(searchParam);
          setCurrentItem({})
        } else {
          message.error(`绑卡失败，${response.message}`);
        }
      }
    })
  };

  const unBond = (deviceId: string) => {
    apis.employee.unbondById(deviceId)
      .then((response: any) => {
        if (response.status === 200) {
          setUnbindVisible(false);
          message.success("解绑成功");
          handleSearch(searchParam);
        }
      });
  };
    const handleDelete = (params: any) => {
        Modal.confirm({
            title: '确定删除吗？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch({
                    type: 'employee/remove',
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

  const handleUnbind = (record: UserItem) => {
    dispatch({
      type: 'employee/unbond',
      payload: encodeQueryParam({id: record.id, bondId: record.bondId}),
      callback: (response: any) => {
        if (response.status === 200) {
          message.success("解绑成功");
          handleSearch(searchParam);
        } else {
          message.error(`解绑失败，${response.message}`);
        }
      }
    });
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
            title="员工管理"
        >
            <Card bordered={false}>
                <div className={styles.tableList}>
                    <div >
                        <SearchForm
                            search={(params: any) => {
                              if(params) {
                                params["type"] = 1;
                              }
                              else {
                                params = {type: 1}
                              }
                                setSearchParam(params);
                                handleSearch({ terms: params, pageSize: 10 })
                            }}
                            formItems={[
                              {
                                label: "姓名",
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
                        <Button icon="disconnect" onClick={() => { setUnbindVisible(true) }}>
                            解绑
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
                    save={(user: UserItem) => { saveOrUpdate(user) }}
                />
            }
          {
            save1Visible &&
            <Save1
              data={currentItem}
              close={() => { setSave1Visible(false); setCurrentItem({}) }}
              save={(user: UserItem) => { bond(user) }}
            />
          }
        {
          unbindVisible &&
          <UnBind
            close={() => { setUnbindVisible(false); }}
            save={(deviceId: string) => { unBond(deviceId) }}
          />
        }
        </PageHeaderWrapper>
    )
};
export default connect(({ employee, loading }: ConnectState) => ({
  employee,
    loading: loading.models.employee
}))(UserList)
