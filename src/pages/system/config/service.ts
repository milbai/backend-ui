import request from "@/utils/request";

export async function list() {
    return request(`/rwslinks/system/config/front`, {
        method: 'GET',
    });
}


export async function add(params: any) {
    return request(`/rwslinks/system/config/front`, {
        method: 'POST',
        data: params,
    })
}
export async function update(params: any) {
    return request(`/rwslinks/system/config/front`, {
        method: 'POST',
        data: params,
    })
}
