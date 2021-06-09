import request from '@/utils/request';

export async function list(params?: any) {
  return request(`/rwslinks/device/group/_query/_detail`, {
    method: 'GET',
    params,
  });
}

export async function save(params: any) {
  return request(`/rwslinks/device/group`, {
    method: 'POST',
    data: params,
  });
}

export async function saveOrUpdate(params: any) {
  return request(`/rwslinks/device/group`, {
    method: 'PATCH',
    data: params,
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/device/group/${id}`, {
    method: 'DELETE',
  });
}

export async function _bind(groupId: string, deviceId: any[]) {
  return request(`/rwslinks/device/group/${groupId}/_bind`, {
    method: 'POST',
    data: deviceId
  })
}

export async function _unbind(groupId: string, deviceId: any[]) {
  return request(`/rwslinks/device/group/${groupId}/_unbind`, {
    method: 'POST',
    data: deviceId
  })
}

export async function _unbindAll(groupId: string) {
  return request(`/rwslinks/device/group/${groupId}/_unbind/all`, {
    method: 'POST',
  })
}
