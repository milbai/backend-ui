import BaseService from "@/services/crud";
import request from "@/utils/request";
import {defer, from} from "rxjs";
import {filter, map} from "rxjs/operators";

class Service extends BaseService<any> {

  public queryProduct = (params: any) => defer(
    () => from(request(`/rwslinks/device/product/_query/no-paging?paging=false`, {
      method: 'GET',
      params
    })).pipe(
      filter(resp => resp.status === 200),
      map(resp => resp.result)
    ));

  public mediaGateway = (params: any) => defer(
    () => from(request(`/rwslinks/media/gb28181/_query/no-paging?paging=false`, {
      method: 'GET',
      params
    }))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public mediaDeviceNoPaging = (params: any) => defer(
    () => from(request(`/rwslinks/media/channel/_query/no-paging?paging=false`, {
      method: 'GET',
      params
    }))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public mediaDevice = (deviceId: string) => defer(
    () => from(request(`/rwslinks/media/device/${deviceId}`, {method: 'GET'}))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public deviceDetail = (deviceId: string) => defer(
    () => from(request(`/rwslinks/device/instance/${deviceId}/detail`, {method: 'GET'}))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public getPlay = (deviceId: string, channelId: string) => defer(
    () => from(request(`/rwslinks/media/device/${deviceId}/${channelId}/_start`, {method: 'POST'}))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public getStop = (deviceId: string, channelId: string) => defer(
    () => from(request(`/rwslinks/media/device/${deviceId}/${channelId}/_stop`, {method: 'POST'}))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public getControlStart = (deviceId: string, channelId: string, direct: string, speed: number) => defer(
    () => from(request(`/rwslinks/media/device/${deviceId}/${channelId}/_ptz/${direct}/${speed}`, { method: 'POST' }))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public getControlStop = (deviceId: string, channelId: string) => defer(
    () => from(request(`/rwslinks/media/device/${deviceId}/${channelId}/_ptz/STOP`, { method: 'POST' }))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));
}

export default Service;
