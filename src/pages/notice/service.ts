import request from '@/utils/request';

export async function configType(params?: any) {
  return request(`/rwslinks/notifier/config/types`, {
    method: 'GET',
    params,
  });
}

export async function template(params?: any) {
  return request(`/rwslinks/notifier/template/_query`, {
    method: 'GET',
    params,
  });
}
export async function queryById(id: string) {
  return request(`/rwslinks/notifier/template/${id}`, {
    method: 'GET',
  });
}

export async function saveOrUpdate(item: any) {
  return request(`/rwslinks/notifier/template`, {
    method: 'PATCH',
    data: item,
  });
}

export async function saveOrUpdateConfig(item: any) {
  return request(`/rwslinks/notifier/config`, {
    method: 'PATCH',
    data: item,
  });
}

export async function removeConfig(id: string) {
  return request(`/rwslinks/notifier/config/${id}`, {
    method: 'DELETE',
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/notifier/template/${id}`, {
    method: 'DELETE',
  });
}

export async function config(params?: any) {
  return request(`/rwslinks/notifier/config/_query`, {
    method: 'GET',
    params,
  });
}

export async function queryConfigById(id: string) {
  return request(`/rwslinks/notifier/config/${id}`, {
    method: 'GET',
  });
}

export async function configMetadata(type: string, id: string) {
  return request(`/rwslinks/notifier/config/${type}/${id}/metadata`, {
    method: 'GET',
  });
}

export async function debugTemplate(id: string, data: any) {
  return request(`/rwslinks/notifier/${id}/_send`, {
    method: 'POST',
    data,
  });
}

async function list(params: any) {
  return request(`/rwslinks/notify/history/_query`, {
    method: 'GET',
    params
  })
}

async function detail(id: string) {
  return request(`/rwslinks/notify/history/${id}`, {
    method: 'GET'
  })
}

export const history = { list, detail };