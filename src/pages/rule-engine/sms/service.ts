import request from '@/utils/request';
import { SmsItem } from './data';

export async function list(params?: any) {
    return request(`/rwslinks/sms-sender/_query`, {
        method: 'GET',
        params: params,
    });
}

export async function listNoPaging(params?: any) {
    return request(`/rwslinks/sms-sender/_query/no-paging`, {
        method: 'GET',
        params: params,
    });
}

export async function saveOrUpdate(params: SmsItem) {
    return request(`/rwslinks/sms-sender/`, {
        method: 'PATCH',
        data: params,
    });
}

export async function info(id: string) {
    return request(`/rwslinks/sms-sender/${id}`, {
        method: 'GET',
    });
}


export async function remove(id: string) {
    return request(`/rwslinks/sms-sender/${id}`, {
        method: 'DELETE',
    });
}

export async function providerList() {
    return request(`/rwslinks/sms-sender/provider/all`, {
        method: "GET",
    });
}
