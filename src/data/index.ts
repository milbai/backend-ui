import { zip, from, defer } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
// import { getAccessToken } from "@/utils/authority";
// import { ajax } from "rxjs/ajax";
import request from "umi-request";

// const auth$ = ajax({
//     url: '/rwslinks/authorize/me',
//     method: 'GET',
//     headers: {
//         'X-Access-Token': getAccessToken()
//     }
// });
const auth$ = defer(() => from(request(`/rwslinks/authorize/me`, {
    method: 'GET',
})));

const systemInfo$ = defer(() => from(request('/rwslinks/system/config/front', { method: 'GET' })))
// const systemInfo$ = ajax({
//     url: '/rwslinks/system/config/front',
//     method: 'GET',
//     headers: {
//         'X-Access-Token': getAccessToken()
//     }
// });

export const root$ = zip(auth$, systemInfo$)
    .pipe(
        map(([auth, systemInfo]) => ({ auth, systemInfo })),
        shareReplay(1));
