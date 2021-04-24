import { Effect } from 'dva';
import { Reducer } from 'react';
import apis from '@/services';
import { SimpleResponse } from '@/utils/common';

export interface EmployeeModelState {
  result: any;
}

export interface EmployeeModelType {
  namespace: string;
  state: EmployeeModelState;
  effects: {
    query: Effect;
    queryById: Effect;
    insert: Effect;
    remove: Effect;
  };
  reducers: {
    save: Reducer<any, any>;
  }
}

const EmployeeModel: EmployeeModelType = {
  namespace: 'employee',
  state: {
    result: {},
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response: SimpleResponse = yield call(apis.employee.list, payload);
      yield put({
        type: 'save',
        payload: response.result,
      });
    },
    *queryById({ payload, callback }, { call }) {
      const response: SimpleResponse = yield call(apis.employee.list, payload);
      callback(response);
    },
    *insert({ payload, callback }, { call }) {
      const response: SimpleResponse = yield call(apis.employee.saveOrUpdate, payload);
      callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response: SimpleResponse = yield call(apis.employee.remove, payload);
      callback(response);
    }
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        result: { ...action.payload },
      }
    }
  }
};

export default EmployeeModel;
