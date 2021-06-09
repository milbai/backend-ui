import request from "@/utils/request";
import { OpenApiItem } from "./data";
import BaseService from "@/services/crud";
import { defer, from, of } from "rxjs";
import { filter, map, flatMap, toArray } from "rxjs/operators";

export async function list(params: any) {
    return request(`/rwslinks/open-api/_query`, {
        method: 'GET',
        params,
    });
}

export async function remove(id: string) {
    return request(`/rwslinks/open-api/${id}`, {
        method: 'DELETE',
    });
}

export async function add(params: OpenApiItem) {
    return request(`/rwslinks/open-api`, {
        method: 'POST',
        data: params,
    })
}
export async function update(params: OpenApiItem) {
    return request(`/rwslinks/open-api`, {
        method: 'PATCH',
        data: params,
    })
}

export async function authList(params?: any) {
    return request(`/rwslinks/autz-setting/_query/no-paging`, {
        method: 'GET',
        params,
    });
}

export async function permissionList(params?: any) {
    return request(`/rwslinks/permission/_query/no-paging?paging=false`, {
        method: 'GET',
        params
    });
}

export async function autz(params?: any) {
    return request(`/rwslinks/autz-setting/_query/no-paging`, {
        method: 'GET',
        params,
    });
}
class Service extends BaseService<any>{

    public permission = {
        query: (params: any) => defer(() => from(
            request(`/rwslinks/permission/_query/no-paging?paging=false`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result as any[]),
                flatMap(data => of(...data)),
                filter((data: any) => (data.properties?.type || []).includes('api')),
                map(item => ({
                    title: item.name,
                    key: item.id,
                    children: item.actions.map((child: any) => ({
                        title: child.name,
                        key: child.action,
                    }))
                })),
                toArray()
            )),
        auth: (params: any) => defer(() => from(
            request(`/rwslinks/autz-setting/_query/no-paging?paging=false`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result),
                flatMap(data => of(...data)),
                map(item => ({
                    key: item.permission,
                    actions: item.actions
                })),
                toArray(),
            )),
        save: (data: any) => defer(() => from(
            request(`/rwslinks/autz-setting/detail/_save`, {
                method: 'POST',
                data
            })).pipe(
                filter(resp => resp.status === 200),
            ))
    }
}
export default Service;
