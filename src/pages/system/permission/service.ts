import request from '@/utils/request';
// import { AutzSetting } from '@/components/SettingAutz/AutzSetting';
import { PermissionItem } from './data';

export async function list(params?: any) {
  return request(`/rwslinks/permission/_query`, {
    method: 'GET',
    params,
  });
}

export async function listNoPaging(params?: any) {
  return request(`/rwslinks/permission/_query/no-paging?paging=false`, {
    method: 'GET',
    params
  });
}

export async function detail(id: string) {
  return request(`/rwslinks/permission/${id}`, {
    method: 'GET',
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/permission/${id}`, {
    method: 'DELETE',
  });
}

export async function add(params: PermissionItem) {
  return request(`/rwslinks/permission`, {
    method: 'PATCH',
    data: params,
  });
}
export async function update(params: PermissionItem) {
  return request(`/rwslinks/permission/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function autzSetting(params: { settingId: string; settingType: string }) {
  return request(`/rwslinks/autz-setting/${params.settingType}/${params.settingId}`, {
    method: 'GET',
  });
}

export async function setAutz(params: any) {
  return request(`/rwslinks/autz-setting`, {
    method: 'PATCH',
    data: params,
  });
}
