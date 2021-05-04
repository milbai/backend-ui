import request from '@/utils/request';
import { FenceItem } from './data';

export async function list(params?: any) {
  return request(`/jetlinks/electric/fence/_query`, {
    method: 'GET',
    params: params,
  });
}

export async function listNoPaging(params?: any) {
  return request(`/jetlinks/electric/fence/_query/no-paging`, {
    method: 'GET',
    params: params,
  });
}

export async function listAll(params?: any) {
  return request(`/jetlinks/electric/fence/_query/no-paging?paging=false`, {
    method: 'GET',
    params: params,
  });
}

export async function saveOrUpdate(params: FenceItem) {
  return request(`/jetlinks/electric/fence/`, {
    method: 'PATCH',
    data: params,
  });
}

export async function info(id: string) {
  return request(`/jetlinks/electric/fence/${id}`, {
    method: 'GET',
  });
}


export async function remove(id: string) {
  return request(`/jetlinks/electric/fence/${id}`, {
    method: 'DELETE',
  });
}
