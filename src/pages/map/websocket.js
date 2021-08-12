var ws, ws_timer = null, heart_timer = null;
var ws_url = 'wss://101.201.145.41:8881/rwslinks-websocket';

export function createWebSocket(callback) {
  if(ws_timer)
    clearTimeout(ws_timer);
  if(heart_timer)
    clearTimeout(heart_timer);
  if(!('WebSocket' in window || 'MozWebSocket' in window)) {
    alert("当前浏览器不支持websocket协议,建议使用谷歌浏览器");
    return;
  }
  try {
    if ('WebSocket' in window)
      ws = new WebSocket(ws_url);
    else if ('MozWebSocket' in window)
      ws = new MozWebSocket(ws_url);
    initEventHandle(callback);
  } catch (e) {
    reconnect(e);
  }
}
function reconnect(e) {
  console.log('2s后重新连接', e);
  ws_timer = setTimeout(function () {
    createWebSocket();
  }, 2000);
}
function initEventHandle(callback) {
  ws.onopen = function (event) {
    if(ws.readyState === 1) {
      ws.send('Hello Server!');
      sendHeart();
    }
  };
  ws.onmessage = function (event) {
    console.log(event);
    callback();
    sendHeart();
  };
  ws.onclose = function (event) {
    reconnect(event);
  };
  ws.onerror = function (event) {
    reconnect(event);
  };
}

function sendHeart() {
  if(heart_timer)
    clearTimeout(heart_timer);
  heart_timer = setTimeout(function () {
    if(ws.readyState === 1) {
      ws.send('Hello Server!');
      sendHeart();
      console.log('send heart!!!');
    }
  }, 30 * 1000);
}
