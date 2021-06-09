import BaseService from "@/services/crud";
import { defer, from } from "rxjs";
import request from "@/utils/request";
import { map, filter, flatMap } from "rxjs/operators";
import { TenantItem } from "./data";

class Service extends BaseService<TenantItem>{
    private tenant = localStorage.getItem('tenants-admin');
    public create = (params: any) => defer(
        () => from(request(`/rwslinks/tenant/_create`, {
            method: 'POST',
            data: params
        })).pipe(
            map(resp => resp.result),
        ));

    public list = (params: any) => defer(
        () => from(request(`/rwslinks/tenant/detail/_query`, {
            method: 'GET',
            params
        }
        )).pipe(
            filter(resp => resp.status === 200),
            map(resp => resp.result),
            map(result => {
                const temp = result;
                temp.data = result.data.
                    map((i: any) => ({ members: i.members, ...i.tenant }))
                return temp;
            })
        ));

    public queryById = (id: string) => defer(() => from(request(`/rwslinks/tenant/${id}`, {
        method: 'GET'
    })).pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
    ));

    public member = {
        query: (id: string, params: any) => defer(() => from(
            request(`/rwslinks/tenant/${id}/members/_query`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        query2: (params: any) => defer(() => from(
            request(`/rwslinks/tenant/members/_query`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        queryNoPaging: (params: any) => defer(() => from(
            request(`/rwslinks/tenant/members/_query/no-paging?paging=false`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                flatMap(resp => from(resp.result)),
            )),
        bind: (id: string, data: { name: string, userId: string, admin: boolean }[]) => defer(
            () => from(
                request(this.tenant === 'true' ? `/rwslinks/tenant/members/_bind` : `/rwslinks/tenant/${id}/members/_bind`, {
                    method: 'POST',
                    data,
                })).pipe(
                    filter(resp => resp.status === 200),
                    map(resp => resp.result)
                )),
        unBind: (id: string, data: string[]) => defer(() => from(
            request(this.tenant === 'true' ? `/rwslinks/tenant/members/_unbind` : `/rwslinks/tenant/${id}/members/_unbind`, {
                method: 'POST',
                data
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        create: (id: string, data: any) => defer(() => from(
            request(`/rwslinks/tenant/${id}/member`, {
                method: 'POST',
                data
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        userlist: (params: any) => defer(() => from(
            request(`/rwslinks/user/_query/no-paging`, {
                method: 'GET',
                params,
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            ))
    }

    public assets = {
        bind: (id: string, data: {
            userId: string,
            assetType: string,
            assetIdList: string[],
            allPermission: boolean
        }[]) => defer(() => from(
            request(this.tenant === 'true' ? `/rwslinks/tenant/assets/_bind` : `/rwslinks/tenant/${id}/assets/_bind`, {
                method: 'POST',
                data
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp)
            )),
        unbind: (id: string, data: {
            userId?: string,
            assetType: string,
            assetIdList: string[]
        }[]) => defer(() => from(
            request(this.tenant === 'true' ? `/rwslinks/tenant/assets/_unbind` : `/rwslinks/tenant/${id}/assets/_unbind`, {
                method: 'POST',
                data
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        device: (params: any) => defer(() => from(
            request(`/rwslinks/device/instance/_query`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        deviceCount: (params: any) => defer(() => from(
            request(`/rwslinks/device/instance/_count`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        product: (params: any) => defer(() => from(
            request(`/rwslinks/device-product/_query`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        productNopaging: (params: any) => defer(() => from(
            request(`/rwslinks/device-product/_query/no-paging?paging=false`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                flatMap(resp => from(resp.result)),
            )),
        productCount: (params: any) => defer(() => from(
            request(`/rwslinks/device-product/_count`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        instanceNopaging: (params: any) => defer(() => from(
            request(`/rwslinks/device-instance/_query/no-paging?paging=false`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                flatMap(resp => from(resp.result)),
            )),
        protocol: (params: any) => defer(() => from(
            request(`/rwslinks/protocol/_query`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        protocolCount: (params: any) => defer(() => from(
            request(`/rwslinks/protocol/_count`, {
                method: 'GET',
                params
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
        members: (tenantId: string, assetType: string, assetId: string) => defer(() => from(
            request(`/rwslinks/tenant/${tenantId}/asset/${assetType}/${assetId}/members`, {
                method: 'GET',
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
    }

    public alarm = {
        count: (params: any) => defer(() => from(
            request(`/rwslinks/device/alarm/history/_count`, {
                method: 'GET',
                params,
            })).pipe(
                filter(resp => resp.status === 200),
                map(resp => resp.result)
            )),
    }
}
export default Service;