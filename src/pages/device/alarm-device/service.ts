import request from '@/utils/request';
import {DeviceInstance} from './data.d';

export async function list(params: any) {
  return request(`/rwslinks/device-instance/_query`, {
    method: 'GET',
    params,
  });
}

export async function listAll(params?: any) {
  return request(`/rwslinks/device-instance/_query/no-paging?paging=false`, {
    method: 'GET',
    params: params,
  });
}

export async function list_bond(params?: any) {
  return request(`/rwslinks/device/instance/chestCard/bond`, {
    method: 'GET',
    params: params,
  });
}

export async function list_bond1(params?: any) {
  return request(`/rwslinks/device-instance/chestCard/workOrder/list`, {
    method: 'GET',
    params: params,
  });
}

export async function count(params: any) {
  return request(`/rwslinks/device-instance/_count`, {
    method: 'GET',
    params,
  });
}

export async function info(id: string) {
  return request(`/rwslinks/device/instance/${id}/detail`, {
    method: 'GET',
  });
}

export async function switchTGSG190(deviceId: string, data: string) {
  return request(`/rwslinks/device-instance/${deviceId}/command/${data}`, {
    method: 'GET',
  });
}

export async function saveOrUpdate(params: DeviceInstance) {
  return request(`/rwslinks/device-instance`, {
    method: 'PATCH',
    data: params,
  });
}

export async function saveDevice(params: DeviceInstance) {
  return request(`/rwslinks/device-instance`, {
    method: 'POST',
    data: params,
  });
}

export async function remove(id: string) {
  return request(`/rwslinks/device-instance/${id}`, {
    method: 'DELETE',
  });
}

export async function logs(deviceId: string, params: any) {
  return request(`/rwslinks/device-instance/${deviceId}/logs`, {
    method: 'GET',
    params,
  });
}

export async function logs1(userId: string, params: any) {
  return request(`/rwslinks/device-instance/trajectory/${userId}/logs`, {
    method: 'GET',
    params,
  });
}

export async function properties(productId: string, id: string) {
  return request(`/rwslinks/device-instance/${id}/properties/latest`, {
    method: 'GET',
  });
}

export async function changeDeploy(deviceId: string | undefined) {
  return request(`/rwslinks/device-instance/${deviceId}/deploy`, {
    method: 'POST',
  });
}

export async function unDeploy(deviceId: string) {
  return request(`/rwslinks/device-instance/${deviceId}/undeploy`, {
    method: 'POST',
  });
}

export async function property(id: string, type: string) {
  return request(`/rwslinks/device/standard/${id}/property/${type}`, {
    method: 'GET',
  });
}

export async function eventData(id: string, event: string, params: any) {
  return request(`/rwslinks/device/instance/${id}/event/${event}?format=true`, {
    method: 'GET',
    params,
  });
}

export async function propertieInfo(deviceId: string, params: any) {
  return request(`/rwslinks/device-instance/${deviceId}/properties/_query`, {
    method: 'GET',
    params,
  });
}

export async function invokedFunction(deviceId: string, functionId: string, data: any) {
  return request(`/rwslinks/device/invoked/${deviceId}/function/${functionId}`, {
    method: 'POST',
    data,
  });
}

export async function disconnectDevice(deviceId?: string) {
  return request(`/rwslinks/device/instance/${deviceId}/disconnect`, {
    method: 'POST',
  });
}

export async function update(deviceId: string | undefined, params: DeviceInstance) {
  return request(`/rwslinks/device/instance/${deviceId}`, {
    method: 'PUT',
    data: params,
  });
}

export async function saveDeviceTags(deviceId: string | undefined, params: any) {
  return request(`/rwslinks/device/instance/${deviceId}/tag`, {
    method: 'PATCH',
    data: params,
  });
}

export async function removeTags(deviceId: string | undefined, tagId: string) {
  return request(`/rwslinks/device/instance/${deviceId}/tag/${tagId}`, {
    method: 'DELETE',
  });
}

export async function propertiesRealTime(data: any) {
  return request(`/rwslinks/dashboard/_multi`, {
    method: 'POST',
    data,
  });
}

export async function _delete(params: any) {
  return request(`/rwslinks/device/instance/batch/_delete`, {
    method: 'PUT',
    data: params,
  });
}

export async function _unDeploy(params: any) {
  return request(`/rwslinks/device/instance/batch/_unDeploy`, {
    method: 'PUT',
    data: params,
  });
}

export async function _deploy(params: any) {
  return request(`/rwslinks/device/instance/batch/_deploy`, {
    method: 'PUT',
    data: params,
  });
}

export async function configurationReset(deviceId?: string) {
  return request(`/rwslinks/device/instance/${deviceId}/configuration/_reset`, {
    method: 'PUT',
  });
}

export async function getDeviceShadow(deviceId: string) {
  return request(`/rwslinks/device/instance/${deviceId}/shadow`, {
    method: 'GET',
  });
}

export async function saveDeviceShadow(deviceId: string, data: string) {
  return request(`/rwslinks/device/instance/${deviceId}/shadow`, {
    method: 'PUT',
    data
  });
}

export async function updateProperty(deviceId: string, data: any) {
  return request(`/rwslinks/device/instance/${deviceId}/property`, {
    method: 'PUT',
    data
  });
}
export async function deleteBinds(deviceId: string | undefined, bindType: string, bindKey: string) {
  return request(`/rwslinks/device/instance/${deviceId}/binds/${bindType}/${bindKey}`, {
    method: 'DELETE',
  });
}

//获取音频列表
export async function getAudioList() {
  return request(`/rwslinks/device/instance/audio/record`, {
    method: 'GET',
  });
}

//打开关闭音频
export async function handle_audio(data: any) {
  return request(`/rwslinks/device/instance/command/audio`, {
    method: 'POST',
    data,
  });
}
