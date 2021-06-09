import request from '@/utils/request';

export async function nodeList() {
  return request(`/rwslinks/rule-engine/model/executors`, {
    method: 'GET',
  });
}

export async function debug(params: any) {
  return request('/rwslinks/rule-engine/debug', {
    method: 'POST',
    data: params,
  });
}

export async function debugNode(id: string, params: any) {
  return request(`/rwslinks/rule-engine/debug/${id}`, {
    method: 'POST',
    data: params,
  });
}

export async function debugResult(id: string, result: string, params: any) {
  return request(`/rwslinks/rule-engine/debug/${id}/${result}`, {
    method: 'POST',
    data: params,
  });
}

export async function closeDebug(id: string) {
  return request(`/rwslinks/rule-engine/debug/${id}`, {
    method: 'DELETE',
  });
}

export async function debugContext(id: string) {
  return request(`/rwslinks/rule-engine/debug/${id}/contexts`, {
    method: 'GET',
  });
}

export async function stopNodeDebug(id: string, nodeId: string) {
  return request(`/rwslinks/rule-engine/debug/${id}/${nodeId}`, {
    method: 'DELETE',
  });
}

export async function networkList(params: any) {
  return request(`/rwslinks/network/config/_query/no-paging`, {
    method: 'GET',
    params,
  });
}

export async function gatewayMessage() {
  return request(`/rwslinks/gateway/message/all`, {
    method: 'GET',
  });
}
