import request from '@/utils/request';

export async function list(params?: any) {
  return request(`/rwslinks/device/gateway/_query`, {
    method: 'GET',
    params,
  });
}

export async function unBind(gatewayId: string,deviceId :string) {
  return request(`/rwslinks/device/gateway/${gatewayId}/unbind/${deviceId}`, {
    method: 'POST',
  });
}

export async function bind(gatewayId: string,data?: any) {
  return request(`/rwslinks/device/gateway/${gatewayId}/bind`, {
    method: 'POST',
    data,
  });
}
