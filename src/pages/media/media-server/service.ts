import BaseService from "@/services/crud";
import request from "@/utils/request";
import {defer, from} from "rxjs";
import {filter, map} from "rxjs/operators";

class Service extends BaseService<any> {

  public providersList = () => defer(
    () => from(request(`/rwslinks/media/server/providers`, {method: 'GET'}))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));

  public mediaServerInfo = (id: string) => defer(
    () => from(request(`/rwslinks/media/server/${id}`, {
      method: 'GET',
      errorHandler: () => {
      }
    }))
      .pipe(
        filter(resp => resp.status === 200 || resp.status === 404),
        map(resp => resp.result)
      ));

  public saveMediaServer = (data: any) => defer(
    () => from(request(`/rwslinks/media/server/`, {
      method: 'PATCH',
      data: data
    }))
      .pipe(
        filter(resp => resp.status === 200),
        map(resp => resp.result)
      ));
}

export default Service;
