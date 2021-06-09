import request from '@/utils/request';

export async function login(params: any): Promise<any> {
  return request(`/rwslinks/authorize/login`, {
    method: 'POST',
    data: params,
  });
}

export async function logout(): Promise<any> {
  return request(`/rwslinks/user-token/reset`, {
    method: 'GET',
  });
}

export async function oauth(params: any): Promise<any> {
  return request(`/rwslinks/oauth2/authorize`, {
    method: 'GET',
    params,
  });
}
