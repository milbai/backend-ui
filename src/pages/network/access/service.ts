import request from '@/utils/request';
import { AccessItem } from './data';

export async function list(params?: any) {
  return request(`/rwslinks/network/server/url/_query`, {
    method: 'GET',
    params: params,
  });
}

export async function saveOrUpdate(params: AccessItem) {
  return request(`/rwslinks/network/server/url/`, {
    method: 'PATCH',
    data: params,
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/network/server/url/${id}`, {
    method: 'DELETE',
  });
}
