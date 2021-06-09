import request from '@/utils/request';
import { UserItem } from './data';

export async function list(params?: any) {
  return request(`/rwslinks/user/employee/_query`, {
    method: 'GET',
    params: params,
  });
}

export async function listNoPaging(params?: any) {
  return request(`/rwslinks/user/employee/_query/no-paging`, {
    method: 'GET',
    params: params,
  });
}

export async function listAll(params?: any) {
  return request(`/rwslinks/user/employee/_query/no-paging?paging=false`, {
    method: 'GET',
    params: params,
  });
}

export async function saveOrUpdate(params: UserItem) {
  return request(`/rwslinks/user/employee/`, {
    method: 'PATCH',
    data: params,
  });
}

export async function bond(params?: any) {
  return request(`/rwslinks/user/employee/bond`, {
    method: 'GET',
    params: params,
  });
}
export async function unbond(params?: any) {
  return request(`/rwslinks/user/employee/unbond`, {
    method: 'GET',
    params: params,
  });
}

export async function unbondById(id: string) {
  return request(`/rwslinks/user/employee/unbond/${id}`, {
    method: 'GET',
  });
}

export async function carddetail(params?: any) {
  return request(`/rwslinks/user/card/record/_query`, {
    method: 'GET',
    params: params,
  });
}

export async function info(id: string) {
  return request(`/rwslinks/user/employee/${id}`, {
    method: 'GET',
  });
}


export async function remove(id: string) {
  return request(`/rwslinks/user/employee/${id}`, {
    method: 'DELETE',
  });
}


//=================================
export async function queryById(id: string) {
  return request(`/hsweb/user/${id}`, {
    method: 'GET',
  });
}


export async function add(params: UserItem) {
  return request(`/hsweb/user`, {
    method: 'POST',
    data: params,
  });
}

export async function update(params: UserItem) {
  return request(`/hsweb/user/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}
