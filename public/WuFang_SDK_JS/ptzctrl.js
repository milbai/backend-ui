/*
 *功能:主消息类
 */

export class ptzCtrl {
    constructor(hConn_, ptzParam_) {
        this.hConn = hConn_;
        this.ptzPara = ptzParam_;
    }

    sendRequest() {
       var url = this.hConn.url;
       this.wSock = new WebSocket(url);

       var self = this;

       var tick = setTimeout(function () {
               self.wSock.close(1000);
			   self.wSock = null;
          }, 5000);

       self.wSock.onopen = ()=>{
              self.wSock.send(JSON.stringify({
                   command: "ptzCtrl",
                   deviceHost: self.ptzPara.devip,
                   devicePort : self.ptzPara.devport,
                   channelNo: self.ptzPara.chn,
                   cmd: self.ptzPara.cmd,
                   preset: self.ptzPara.preset,
                   speed: self.ptzPara.speed,
                   stop:self.ptzPara.stop,
                   userKey: self.hConn.key,
                   version: "1.0"}));
           }

        self.wSock.onmessage = (e)=>{

        }

        self.wSock.onclose = ()=>{

        }

        self.wSock.onerror = ()=>{

        }
    }
}

export default  ptzCtrl;