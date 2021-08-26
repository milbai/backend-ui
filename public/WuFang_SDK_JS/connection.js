/*
 *功能:主消息类
 */

import {ByteArray} from "./ByteArray.js"

export class connection {
    constructor(loginParam_, userParam_) {
        this.loginPara = loginParam_;
        this.userPara = userParam_;
        this.wsock = null;
        this.state = 0;
        this.tick  = null;
		this.list  = new ByteArray();
		this.buftotal = 0;
		this.fnGetCfgCb = null;
    }

    start() {
        this.state = 0;
        this.url = "ws://" + this.loginPara.ip + ":" + this.loginPara.port;
        this.wsock = new WebSocket(this.url);
        this.wsock.binaryType = 'arraybuffer';

        var self = this;
        if (null == this.tick) {
            this.tick = setInterval(function () {
                if (null != self.wsock &&
                    WebSocket.OPEN == self.wsock.readyState) {
                    return;
                }

                if (self.wsock == null) {
                    self.start();
                }
            }, 2000);
        }

        var user     = this.loginPara.user;
        var password = this.loginPara.password;
        var conn     = this;

        this.wsock.onopen = function (e) {
            var self = this;
            self.send(JSON.stringify({
                command: "login",
                username: user,
                password: password}
            ));
            console.log("login param, user:" + user + "password: " + password + "this: " + this)
        };

        this.timeOut = setTimeout(()=>{
            conn.wsock.close(1000);
            conn.state = 0;
        }, 2000);

        this.heartbeat = setInterval(()=>{
            if (null != self.wsock &&
                WebSocket.OPEN == this.wsock.readyState) {
                if (conn.state == 0) {
                    return;
                }
                this.wsock.send(JSON.stringify({ command: "heartbeat"}));
            }
        }, 5000);

        this.wsock.onclose  = function (e) {
            clearTimeout(conn.timeOut);
            clearInterval(conn.heartbeat);
            conn.wsock = null;
            conn.state = 0;
            conn.key  = null;
        };

        this.wsock.onmessage = function (e) {
            conn.list.push(new Uint8Array(e.data));
            conn.buftotal += e.data.byteLength;

            clearTimeout(conn.timeOut);
		    var self = this;

			do{			
			
			    var temp = conn.list.readBytes(4);
				if ((null==temp) || (0==temp.byteLength)){
					break;
				}			

				var len = temp[1]*256+temp[0];
				var copy = conn.list.readBytes((len-4));

				conn.buftotal -= len;       

			    var blob = new Blob([copy]);
			    var reader = new FileReader();
			    reader.readAsText(blob, 'utf-8');
			   
			    reader.onload = ()=>{
				 var obj = JSON.parse(reader.result);

				 if (obj.code != 200){
                      conn.state = 0;
                      conn.wsock.close(1000);
                      conn.key  = null;
                      return;
					}

			    var body = JSON.parse(obj.data);
                if (obj.msg == "heartbeat") {
                    
                }
                else if (obj.msg == "login") {
                    if (body.key != null) {
                        conn.state = 1;
                        conn.key = body.key;
                        var mytime = new Date().toLocaleString();
                        console.log(mytime + " " + body.key);
                    }
                }
				else if (obj.msg == "alarm") {
                    if (null != conn.loginPara.alarmcallback){
                        conn.loginPara.alarmcallback(body);
					}
				}
				else if (obj.msg == "getConfig"){
                    if (null != conn.fnGetCfgCb){
                        conn.fnGetCfgCb(obj.data);
                    }
				}

				console.log(new Date().toLocaleString() + " " + obj.msg);
              }

			}while (1);
        };

        this.wsock.onerror   = function (e) {
            clearInterval(conn.timeOut);
            clearInterval(conn.heartbeat);
            conn.wsock.close(1000);
            conn.state = 0;
            conn.key  = null;
        };
    }

    stop() {       
		if (null != this.timeOut){
			clearInterval(this.timeOut);
			this.timeOut = null;
		}
		if (null != this.tick){
			clearInterval(this.tick);
			this.tick = null;
		}
		if (null != this.heartbeat){
			clearInterval(this.heartbeat);
			this.heartbeat = null;
		}
		if (null != this.wsock) {         
            this.wsock.close(1000);
            this.key  = null;
        }
    }

    queryConfig(json, pfnGetConfigCb) {
	   this.fnGetCfgCb = pfnGetConfigCb;

	    var wGetCfgSock = new WebSocket(this.url);
		wGetCfgSock.binaryType = 'arraybuffer';
        var getCfgR = this;

        wGetCfgSock.onopen = function(e) {
           var selfGetCfg = this;
           selfGetCfg.send(json);
		}

        this.timeOut = setTimeout(()=>{
              wGetCfgSock.close(1000);
              clearTimeout(getCfgR.timeOut);
          }, 5000);

        wGetCfgSock.onmessage = function(e) {
		   clearTimeout(getCfgR.timeOut);

            var buff = new Uint8Array(e.data, 4, e.data.byteLength-4);

            var blob = new Blob([buff]);
            var reader = new FileReader();
            reader.readAsText(blob, 'utf-8');

            reader.onload = function(){
                if (null != getCfgR.fnGetCfgCb) {
                    getCfgR.fnGetCfgCb(reader.result);
                }
            }

            getCfgR.close(1000);
		}

		wGetCfgSock.onclose = function(e) {
            clearTimeout(getCfgR.timeOut);
            getCfgR = null;
        }

        wGetCfgSock.onerror = function(e) {
            getCfgR.close(1000);
        }
	}

    queryRecord(recordParam_, userParam_) {
          var wQuerySock = new WebSocket(this.url);
		  wQuerySock.binaryType = 'arraybuffer';
          var queryR = this;
          var recordPara = recordParam_;

          wQuerySock.onopen = function(e) {
              var selfR = this;
              selfR.send(JSON.stringify({
                  command: "queryRecord",
                  deviceHost: recordParam_.devip,
                  devicePort: recordParam_.port,
                  channelNo: recordParam_.chn,
                  start:recordParam_.beginTime,
                  end: recordParam_.endTime,
                  fromIndex: 1,
                  toIndex: 1000,
                  userKey : queryR.key,
                  type: 0,
                  version: "1.0"}
              ));
          }

        this.timeOut = setTimeout(()=>{
              wQuerySock.close(1000);
              clearTimeout(queryR.timeOut);
          }, 5000);

        wQuerySock.onmessage = function(e) {
            clearTimeout(queryR.timeOut);

            var buff = new Uint8Array(e.data, 4, e.data.byteLength-4);

            var blob = new Blob([buff]);
            var reader = new FileReader();
            reader.readAsText(blob, 'utf-8');

            reader.onload = function(){
                if (null != recordPara.resultCb) {
                    recordPara.resultCb(reader.result);
                }
            }

            wQuerySock.close(1000);
        }

        wQuerySock.onclose = function(e) {
            clearTimeout(queryR.timeOut);
            queryR = null;
        }

        wQuerySock.onerror = function(e) {
            queryR.close(1000);
        }
    }
}

export default connection;