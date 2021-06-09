import request from '@/utils/request';
import { OrgItem } from './data.d';

export async function list(params: any) {
  return request(`/rwslinks/dimension/_query/tree`, {
    method: 'GET',
    params,
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/dimension/${id}`, {
    method: 'DELETE',
  });
}

export async function add(params: OrgItem) {
  return request(`/rwslinks/dimension`, {
    method: 'POST',
    data: params,
  });
}
export async function saveOrUpdate(params: OrgItem) {
  return request(`/rwslinks/dimension/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function bindUser(params: any) {
  return request(`/rwslinks/dimension-user/_query/no-paging`, {
    method: 'GET',
    params,
  });
}

export async function unBindUser(id: string) {
  return request(`/rwslinks/dimension-user/${id}`, {
    method: 'DELETE',
  });
}

export async function bind(params: any) {
  return request(`/rwslinks/dimension-user`, {
    method: 'POST',
    data: params,
  });
}
