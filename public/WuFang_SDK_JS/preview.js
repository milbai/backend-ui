/*
 *功能:预览类
 */

import h264Demuxer from "./h264-demuxer.js"
import {ByteArray} from "./ByteArray.js"

export class preview {
    constructor(hConn_, previewParam_) {
        this.hConn = hConn_;
        this.previewPara = previewParam_;
        this.state = 0;
        this.wsock = null;
        this.firstrsp = 0;
        this.h264Demux = new h264Demuxer(previewParam_.hwnd, "preview");
        this.show = true;
		    this.lasttimer = new Date().getTime();
		    this.playtime  = 0;
		    this.audioStreamTrack = null;

        var selfCtrl = this;
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                selfCtrl.show = false;
            }
            else {
                selfCtrl.show = true;
            }
        })
    }

    start() {
        this.state = 0;
        this.firstrsp = 0;
        this.url = this.hConn.url;	

        var previewthis = this;
        var selfConn = this.hConn;
        var previewInfo  = this.previewPara;

		if (undefined != selfConn.key &&
                null != selfConn.key) {
          this.wsock = new WebSocket(this.url);
          this.wsock.binaryType = 'arraybuffer';
		}

        if (null == previewthis.tick) {
            previewthis.tick = setInterval(function () {
                if (null != previewthis.wsock &&
                    WebSocket.OPEN == previewthis.wsock.readyState) {

				   if (0 == previewthis.playtime){
					     previewthis.playtime = previewthis.previewPara.hwnd.played.end[0];
                   }

				   if (previewthis.previewPara.hwnd.played.end[0] - previewthis.playtime >= 2){
					     previewthis.lasttimer = new Date().getTime();
						 previewthis.playtime  = previewthis.previewPara.hwnd.played.end[0]; 
				   }

                   var nowTime = new Date().getTime();
				   if (nowTime - previewthis.lasttimer >= 5*1000){
					   previewthis.h264Demux.stop();
                       previewthis.h264Demux = null;
                       previewthis.h264Demux = new h264Demuxer(previewthis.previewPara.hwnd, "preview");
					   previewthis.lasttimer = nowTime;
				   }
				   else {
				       previewthis.lasttimer = nowTime;
				   }

                   return;
                }

                if (null != previewthis.hConn.wsock &&
                    WebSocket.OPEN == previewthis.hConn.wsock.readyState &&
                    null == previewthis.wsock) {
                    previewthis.start();
                }
          
            }, 2000);
        }

		if (null == this.wsock)
		{
			return;
		}

        this.wsock.onopen = function (e) {
            var self = this;
            if (undefined == selfConn.key ||
                null == selfConn.key) {
                previewthis.state = 0;
                previewthis.wsock.close(1000);
                clearTimeout(previewthis.timeOut);
                clearInterval(previewthis.heartbeat);
                return;
            }

            previewthis.recvtime = new Date().getTime();
            self.send(JSON.stringify({
                    command  : "preview",
                    version  : "v1.0",
                    userKey  : selfConn.key,
                    deviceHost : previewInfo.devip,
                    devicePort : previewInfo.port,
                    channelNo  :  previewInfo.chn,
                    obtainType : 1,
                    streamType : previewInfo.type,
                    transport  : 0}
            ));
        };

        this.timeOut = setTimeout(()=>{
            previewthis.wsock.close(1000);
            previewthis.state = 0;
        }, 2000);

        this.heartbeat = setInterval(()=>{
            if (WebSocket.OPEN == previewthis.wsock.readyState) {
                if (1 == previewthis.state) {
                    previewthis.wsock.send(JSON.stringify({command: "heartbeat"}));
                }

                var uptime = new Date().getTime();
                if (uptime - previewthis.recvtime >= 10*1000) {
                    previewthis.wsock.close(1000);
                    previewthis.recvtime = new Date().getTime();
                    previewthis.state   = 0;
                }
            }
        }, 5000);

        this.wsock.onclose  = function (e) {
            clearTimeout(previewthis.timeOut);
            clearInterval(previewthis.heartbeat);
            previewthis.recvtime = new Date().getTime();
            previewthis.state     = 0;
            previewthis.wsock     = null;
        };

        this.wsock.onmessage = function (e) {
            clearTimeout(previewthis.timeOut);
            previewthis.recvtime = new Date().getTime();

            if (0 == previewthis.firstrsp) {
            	  var buff = new Uint8Array(e.data, 4, e.data.byteLength-4);
                var blob = new Blob([buff]);
                var reader = new FileReader();
                reader.readAsText(blob, 'utf-8');
                previewthis.firstrsp = 1;

                reader.onload = ()=> {
                    var obj = JSON.parse(reader.result);
                    if (obj.code != 200) {
                        previewthis.state = 0;
                        previewthis.wsock.close();
                        return;
                    }

                    previewthis.state = 1;
                }
            }
            else {
                if (!previewthis.show) {
                    return;
                }

                if (e.data[4] == 65){
                    return;
                }

                var copy = new Uint8Array(e.data, 40, e.data.byteLength-40) ;

                //console.log(copy[0]+"---"+copy[1]+"---"+copy[2]+"---"+copy[3]+"---"+copy[4]+"---"+e.data.byteLength);

				if (null != previewthis.h264Demux){			
                   previewthis.h264Demux.onH264DataParsing({ data: copy });				
				}
            }
        }

        this.wsock.onerror   = function (e) {
            clearTimeout(previewthis.timeOut);
            clearInterval(previewthis.heartbeat);
            previewthis.recvtime = new Date().getTime();
            previewthis.wsock.close(1000);
        };
    }

    stop() {
        
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
            this.wsock = null;
        }
		if (null != this.h264Demux){
			 this.h264Demux.stop();
             this.h264Demux = null;
		}
    }
    
    record() {
       var constraints = {
        audio: {
        	sampleRate: 8000,
        	channelCount: 2,
        	sampleSize : 16,
        	volume: 1.0
         }
       }  
       
       var preview = this;
       navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
   	      
   	   if (null == preview.audioStreamTrack){
   	   	   preview.audioStreamTrack = stream.getTracks()[0];
   	   }
   	   
   	   if (null != preview.websock) {
   	   	   preview.websock.send(stream);
   	   }
   	   
       }).catch(function(err) {
           console.log("capture error");
      });
  	
    }
    
    release() {
       if (null != this.audioStreamTrack) {
       	   this.audioStreamTrack.stop();
       }
    }
}

export default preview;