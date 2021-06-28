import { Effect } from 'dva';
import { Reducer } from 'react';
import apis from '@/services';
import { SimpleResponse } from '@/utils/common';

export interface AccessModelState {
  result: any;
}

export interface AccessModelType {
  namespace: string;
  state: AccessModelState;
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

const AccessModel: AccessModelType = {
  namespace: 'access',
  state: {
    result: {},
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response: SimpleResponse = yield call(apis.access.list, payload);
      yield put({
        type: 'save',
        payload: response.result,
      });
    },
    *insert({ payload, callback }, { call }) {
      const response: SimpleResponse = yield call(apis.access.saveOrUpdate, payload);
      callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response: SimpleResponse = yield call(apis.access.remove, payload);
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

export default AccessModel;
