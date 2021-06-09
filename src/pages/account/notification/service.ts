import BaseService from "@/services/crud";
import {defer} from "rxjs";
import request from "@/utils/request";

class Service extends BaseService<any> {

  public read = (id: string) => defer(() => request(`/rwslinks/notifications/${id}/read`));

  public unReadNotices = (data: string[]) => defer(() => request(`/rwslinks/notifications/_unread`, {
    method: 'POST',
    data
  }));

  public readNotices = (data: string[]) => defer(() => request(`/rwslinks/notifications/_read`, {
    method: 'POST',
    data
  }));
}

export default Service;

export async function readNotice(id: string): Promise<any> {
  return request(`/rwslinks/notifications/${id}/read`, {
    method: 'GET',
  });
}

export async function noticesCount(params: any) {
  return request(`/rwslinks/notifications/_query`, {
    method: 'GET',
    params
  });
}

export async function readNotices(data: string[]): Promise<any> {
  return request(`/rwslinks/notifications/_read`, {
    method: 'POST',
    data
  });
}

export async function unReadNotices(data: string[]): Promise<any> {
  return request(`/rwslinks/notifications/_unread`, {
    method: 'POST',
    data
  });
}
