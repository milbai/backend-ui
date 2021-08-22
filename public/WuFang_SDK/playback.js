/*
 *功能:回放类
 */

import h264Demuxer from "./h264-demuxer.js"

export class playback {
    constructor(hConn_, playbackParam_) {
        this.hConn = hConn_;
        this.playbackPara = playbackParam_;
        this.reconn = false;
        this.wsock = null;
        this.h264Demux = new h264Demuxer(playbackParam_.hwnd, "playback");
        this.h264Demux.setstatuscb(this.playbackcb, this);
        this.playtimecb = this.playbackPara.playtimecb;
        this.show = true;
        this.firstrsp = 0;
        this.finish    = 0;
        this.downloadcb = playbackParam_.downloadcb;
        this.rspsuccess = false;
		this.paused     = false;

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

    playbackcb(code, self) {
        if (!self.rspsuccess) {
            return;
        }

		if (null == self.wsock){
		    return;
		}

        if (0 == code) {
            self.wsock.send(JSON.stringify({
                command : "continue"}));
        } else if (1 == code) {
            self.wsock.send(JSON.stringify({
                command : "pause"}));
        }
    }

    start() {
        this.rspsuccess = false;
        this.url = this.hConn.url;
        this.wsock = new WebSocket(this.url);
        this.wsock.binaryType = 'arraybuffer';

        var selfPlay = this;
        var selfConn = this.hConn;
        var playbackInfo  = this.playbackPara;

        if (null == this.tick) {
            this.tick = setInterval(()=> {
                if (null != self.wsock &&
                    WebSocket.OPEN == selfPlay.wsock.readyState) {
                    return;
                }

                if (null != selfPlay.hConn.wsock &&
                    WebSocket.OPEN == selfPlay.hConn.wsock.readyState &&
                    null == selfPlay.wsock) {
                    selfPlay.start();
                }
            }, 2000);
        }

        this.wsock.onopen = function (e) {
            var selfWSock = this;
            if (undefined == selfConn.key ||
                null == selfConn.key) {
                selfPlay.wsock.close(1000);
                clearTimeout(selfPlay.timeOut);
                clearInterval(selfPlay.heartbeat);
                return;
            }

            if (0 == playbackInfo.mode) {
                selfWSock.send(JSON.stringify({
                    command  : "playback",
                    version  : "v1.0",
                    userKey  : selfConn.key,
                    deviceHost : playbackInfo.devip,
                    devicePort : playbackInfo.devport,
                    channelNo  :  playbackInfo.chn,
                    obtainType : 1,
                    filename : playbackInfo.filename}));
            }
            else if (1 == playbackInfo.mode){
                selfWSock.send(JSON.stringify({
                    command    : "playback",
                    version    : "v1.0",
                    userKey    : selfConn.key,
                    deviceHost : playbackInfo.devip,
                    devicePort : playbackInfo.devport,
                    channelNo  :  playbackInfo.chn,
                    obtainType : 1,
                    start       : playbackInfo.beginTime,
                    end         :  playbackInfo.endTime }));
            }
        };

        this.timeOut = setTimeout(()=>{
            selfPlay.wsock.close();
            clearTimeout(selfPlay.timeOut);
            clearTimeout(selfPlay.heartbeat);
        }, 2000);

        this.heartbeat = setInterval(()=>{
            if (null != self.wsock &&
                WebSocket.OPEN === this.wsock.readyState) {
                this.wsock.send(JSON.stringify({command: "heartbeat"}));
                console.log(new Date().toLocaleString() + " " + "send heartbeat");
            }

            if (selfPlay.finish == 1) {
                selfPlay.wsock.close(1000);
            }
        }, 5000);

        this.wsock.onclose  = function (e) {
            clearTimeout(selfPlay.timeOut);
            clearInterval(selfPlay.heartbeat);
            selfPlay.wsock = null;
        };

        this.wsock.onmessage = function (e) {
            clearTimeout(selfPlay.timeOut);

            this.recvtime = new Date().getMinutes();
            if (!selfPlay.show) {
                return;
            }

            if (!selfPlay.firstrsp) {
				var buff = new Uint8Array(e.data, 4, e.data.byteLength-4);
                var blob = new Blob([buff]);
                var reader = new FileReader();
                reader.readAsText(blob, 'utf-8');
                selfPlay.firstrsp = 1;

                reader.onload = ()=> {
                    var obj = JSON.parse(reader.result);
                    if (obj.code != 200) {
                        selfPlay.wsock.close(1000);
                        return;
                    }

                    selfPlay.rspsuccess = true;
                }
                return;
            } else {
                if (e.data[4] == 65){
                    return;
                }

                var tag = new Uint8Array(e.data, 0, 4);
                var b1 = tag[0];
                var b2 = tag[1];
                var b3 = tag[2];
                var b4 = tag[3];
                if (b1 == 80 && b2 == 79 &&
                        b3 == 83 && b4 == 73){
                    var pos = new Uint8Array(e.data, 40, 1);
                    if (pos == 100) {
                    	clearTimeout(selfPlay.tick);
                    	this.close();
                        selfPlay.finish = 1;
                        if (null != selfPlay.downloadcb) {
                            selfPlay.downloadcb(100, null);
                        }
                    }
                    return;
                }
                else {
                	var time = new BigInt64Array(e.data, 16, 1);
                	if (null != selfPlay.playtimecb &&
						!this.paused) {
                		  selfPlay.playtimecb(time, null);
                	}	
                }             
                
                var copy = new Uint8Array(e.data, 40, e.data.byteLength-40) ;
                selfPlay.h264Demux.onH264DataParsing({ data: copy });

				//console.log(copy[0]+ "-- " + copy[1]+ "-- " + copy[2]+ "-- " + copy[3]+ "-- " + copy[4] + "--------" + e.data.byteLength);
            }
        }

        this.wsock.onerror   = function (e) {
            clearTimeout(selfPlay.timeOut);
            clearInterval(selfPlay.heartbeat);
            selfPlay.wsock.close(1000);
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

    playctrl(playbackCtrlParam_) {
        var cmd = playbackCtrlParam_.cmd;
        switch (cmd) {
            case 1:
				if (this.playbackPara.hwnd.playbackRate>=16){
				   return;
				}
			    this.playbackPara.hwnd.playbackRate *= 2;
				var speedX = "1";
				if (1 == this.playbackPara.hwnd.playbackRate){
					speedX = "1";
				}
				else if (2 == this.playbackPara.hwnd.playbackRate){
					speedX = "2";
				}
                else if (4 == this.playbackPara.hwnd.playbackRate){
					speedX = "4";
				}
				else if (8 == this.playbackPara.hwnd.playbackRate){
					speedX = "8";
				}
				else if (16 == this.playbackPara.hwnd.playbackRate){
					speedX = "16";
				}
				else if (0.5 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.5";
				}
                else if (0.25 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.25";
				}
				else if (0.125 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.125";
				}
				else if (0.0625 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.0625";
				}
                speedX="1";
				this.wsock.send(JSON.stringify({command: "fast", speed: speedX}));
                break;
            case 2:
				if (this.playbackPara.hwnd.playbackRate==0.0625){
				   return;
				}
			    this.playbackPara.hwnd.playbackRate /= 2;
				var speedX = "1";
				if (1 == this.playbackPara.hwnd.playbackRate){
					speedX = "1";
				}
				else if (2 == this.playbackPara.hwnd.playbackRate){
					speedX = "2";
				}
                else if (4 == this.playbackPara.hwnd.playbackRate){
					speedX = "4";
				}
				else if (8 == this.playbackPara.hwnd.playbackRate){
					speedX = "8";
				}
				else if (16 == this.playbackPara.hwnd.playbackRate){
					speedX = "16";
				}
				else if (0.5 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.5";
				}
                else if (0.25 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.25";
				}
				else if (0.125 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.125";
				}
				else if (0.0625 == this.playbackPara.hwnd.playbackRate){
					speedX = "0.0625";
				}

				this.wsock.send(JSON.stringify({command: "slow", speed: speedX}));
                break;
            case 3:
				this.paused = true;
                this.playbackcb(1, this);
                this.playbackPara.hwnd.pause();
                break;
            case 4:
				this.paused = false;
                this.playbackcb(0, this);
                this.playbackPara.hwnd.play();
                break
            case 5:
                this.stop();
                this.playbackPara.hwnd.src = null;
                break;
            case 6:
                this.wsock.send(JSON.stringify({command: "setPos", pos: playbackCtrlParam_.pos}));
                break;
			case 7:
				this.wsock.send(JSON.stringify({command: "link", devid: "123"}));
			    break;
            case 8:
                this.wsock.send(JSON.stringify({command: "startRepos"}));
                break;
            case 9:
                this.wsock.send(JSON.stringify({command: "setTime",time:playbackCtrlParam_.time}));
                break;
        }
    }
}

export default playback;