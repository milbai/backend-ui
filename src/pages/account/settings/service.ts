import BaseService from "@/services/crud";
import { UserDetail } from "./data";
import { defer, from } from "rxjs";
import request from "@/utils/request";
import { map, filter } from "rxjs/operators";

class Service extends BaseService<UserDetail>{

    /**
     * 查询详情
     */
    public get = () => defer(() => from(
        request(this.uri, {
            method: 'GET'
        })).pipe(
            filter(resp => resp.status === 200),
            map(resp => resp.result)
        ));

    /**
     * 
     * @param data 基本信息保存
     */
    public save = (data: Partial<UserDetail>) => defer(() => from(
        request(this.uri, {
            method: 'PUT',
            data,
        })).pipe(
            map(resp => resp.reuslt)
        ));

    public setMainTenant = (tenant: string) => defer(() => from(
        request(`/rwslinks/tenant/${tenant}/_main`, {
            method: 'PUT'
        })).pipe(
            map(resp => resp.result)
        ));

    public savePassword = (data: { oldPassword: string, newPassword: string }) => defer(() => from(
        request('/user/passwd', {
            method: 'PUT',
            data
        })).pipe(
            map(resp => resp.result)
        ));

    public notificationProvider = () => defer(() => from(
        request(`/rwslinks/notifications/providers`)
    )).pipe(
        map(resp => resp.result)
    );

    public deviceAlarm = (params: any) => defer(() => from(
        request(`/rwslinks/device/alarm/_query`, {
            method: 'GET',
            params
        })
    )).pipe(
        map(resp => resp.result)
    );

    public saveSubscribe = (data: any) => defer(() => from(
        request(`/rwslinks/notifications/subscribe`, {
            method: 'PATCH',
            data
        })
    )).pipe(
        map(resp => resp.result)
    );

    public notification = {
        close: (id: string) => defer(() => from(
            request(`/rwslinks/notifications/subscription/${id}/_disabled`, {
                method: 'PUT',
            })
        )),

        open: (id: string) => defer(() => from(
            request(`/rwslinks/notifications/subscription/${id}/_enabled`, {
                method: 'PUT',
            })
        )),

        remove: (id: string) => defer(() => from(
            request(`/rwslinks/notifications/subscription/${id}`, {
                method: 'DELETE',
            })
        )),
    }
}

export default Service;