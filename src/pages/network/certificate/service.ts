import request from '@/utils/request';
// import { MqttItem } from './data';

export async function list(params?: any) {
  return request(`/rwslinks/network/certificate/_query`, {
    method: 'GET',
    params,
  });
}

export async function listNoPaging(params?: any) {
  return request(`/rwslinks/network/certificate/_query/no-paging`, {
    method: 'GET',
    params,
  });
}

export async function saveOrUpdate(params: any) {
  return request(`/rwslinks/network/certificate/`, {
    method: 'PATCH',
    data: params,
  });
}

export async function info() {
  return request(`/rwslinks/network/certificate`, {
    method: 'GET',
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/network/certificate/${id}`, {
    method: 'DELETE',
  });
}
