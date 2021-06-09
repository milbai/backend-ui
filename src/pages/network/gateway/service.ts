import request from '@/utils/request';

export async function providers(params?: any) {
    return request(`/rwslinks/gateway/device/providers`, {
        method: 'GET',
        params: params
    })
}

export async function supports(params?: any) {
    return request(`/rwslinks/protocol/supports`, {
        method: 'GET'
    })
}

export async function insert(params?: any) {
    return request(`/rwslinks/gateway/device`, {
        method: 'PATCH',
        data: params
    })
}

export async function list(params: any) {
    return request(`/rwslinks/gateway/device/_query`, {
        method: 'GET',
        params: params
    })
}

export async function startUp(id: string) {
    return request(`/rwslinks/gateway/device/${id}/_startup`, {
        method: 'POST',
    })
}

export async function pause(id: string) {
    return request(`/rwslinks/gateway/device/${id}/_pause`, {
        method: 'POST',
    })
}

export async function shutdown(id: string) {
    return request(`/rwslinks/gateway/device/${id}/_shutdown`, {
        method: 'POST',
    })
}

export async function remove(id: string) {
    return request(`/rwslinks/gateway/device/${id}`, {
        method: 'DELETE'
    })
}