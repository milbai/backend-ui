import request from '@/utils/request';

export async function list(params?: any) {
    return request(`/rwslinks/autz-setting/_query/no-paging`, {
        method: 'GET',
        params,
    });
}

export async function setAutz(params: any) {
    return request(`/rwslinks/autz-setting`, {
        method: 'PATCH',
        data: params,
    });
}

export async function saveAutz(params: any) {
    return request(`/rwslinks/autz-setting/detail/_save`, {
        method: 'POST',
        data: params
    })
}

export async function autzDetail(params: { type: string, id: string }) {
    return request(`/rwslinks/autz-setting/detail/${params.type}/${params.id}`, {
        method: 'GET'
    })
}