import request from '@/utils/request';

export async function query(params: any) {
  return request(`/rwslinks/visualization/_query`, {
    method: 'GET',
    params,
  })
}

export async function update(id: string, params: any) {
  return request(`/rwslinks/visualization/${id}`, {
    method: 'PUT',
    data: params,
  })
}


export async function save(params: any) {
  return request(`/rwslinks/visualization`, {
    method: 'POST',
    data: params,
  })
}

export async function remove(id: any) {
  return request(`/rwslinks/visualization/${id}`, {
    method: 'DELETE'
  })
}

//获取跳转地址
export async function getUrl() {
  return request('/rwslinks/system/apis', {
    method: 'GET'
  })
}

