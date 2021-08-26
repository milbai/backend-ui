/*
 *功能:视频渲染
 */


class MediaPlay {

  constructor(video_, type) {
    this.mediaSource = null;
    this.media = video_;
    this.type   = type;
    this.pendingTracks = {};
    this.sourceBuffer = {};
    this.segments = [];
 
    this.appended = 0;
    this._msDuration = null;

    // Source Buffer listeners
    this.onsbue = this.onSBUpdateEnd.bind(this);

    this.browserType = 0;
    if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1){
      this.browserType = 1;
    }

    this.onMediaAttaching();

    var self = this;

    if ("playback" == self.type) {
       self.ctrl = setInterval(function () {
          if (null != self.statuscb ) {
             var played = self.media.played;
			 var buffered = self.media.buffered;

             if (buffered.length >= 1 && played.length >= 1 &&
                  buffered.end(0) - played.end(0) >= 5) {
                  self.statuscb(1, self.user);
				  console.log("**************** buffered.end(0), buffered.start(0), played.start(0),played.end(0), playrate: " 
						  + buffered.end(0), buffered.start(0), played.start(0),played.end(0), self.media.playbackRate);
             }

             if ((buffered.length >= 1 && played.length >= 1 &&
                      buffered.end(0) - played.end(0) <= 2) || (buffered.length == 0)) {
                      self.statuscb(0, self.user);
             }
           }
        }, 100);
     }
  }

  setstatuscb(statuscb, user) {
      this.statuscb = statuscb;
      this.user = user;
  }

  setplaytimecb(playtimecb, user){
      this.playtime = playtimecb;
  }

  stop() {
    if ("playback" == this.type &&
		  null != this.ctrl) {
          clearInterval(this.ctrl);
		  this.ctrl = null;
    }

    let ms = this.mediaSource;
    if (ms) {

       ms.removeEventListener('sourceopen', this.onmso);
       ms.removeEventListener('sourceended', this.onmse);
       ms.removeEventListener('sourceclose', this.onmsc);
	   ms.removeEventListener('error', this.onerr);
	   ms.removeEventListener('updateend', this.onsbue);

	   this.media.removeAttribute('src');
	   this.media.load();
       this.mediaSource = null;
	   this.media = null;
	   this.pendingTracks = {};
	   this.sourceBuffer = {};
       this.segments = [];
     }
  }
 
  onMediaAttaching() {
    let media = this.media;
    if (media) {
      // setup the media source
      var ms = this.mediaSource = new MediaSource();
      //Media Source listeners
      this.onmso = this.onMediaSourceOpen.bind(this);
      this.onmse = this.onMediaSourceEnded.bind(this);
      this.onmsc = this.onMediaSourceClose.bind(this);
      this.onerr  = this.onMediaSourceError.bind(this);

      ms.addEventListener('sourceopen', this.onmso);
      ms.addEventListener('sourceended', this.onmse);
      ms.addEventListener('sourceclose', this.onmsc);
      ms.addEventListener('error', this.onerr);

      // link video and media Source
      media.src = URL.createObjectURL(ms);
    }
  }
   
  onBufferAppending(data) { 
    if (!this.segments) {
      this.segments = [ data ];
    } else {
      this.segments.push(data); 
    }

    this.doAppending(); 
  }
  
  onMediaSourceClose() {
    console.log('media source closed');
  }

  onMediaSourceEnded() {
    console.log('media source ended');
  }

  onMediaSourceError() {
      console.log('media source errr');
  }

  onSBUpdateEnd(event) { 
    // Firefox
    if (this.browserType === 1){
      this.mediaSource.endOfStream();
      this.media.play();  
    }

    this.appending = false;
    this.doAppending();
    this.updateMediaElementDuration();
  }
 
  updateMediaElementDuration() {
  
  }

  onMediaSourceOpen() { 

	URL.revokeObjectURL(this.media.src);

    let mediaSource = this.mediaSource;
    if (mediaSource) {
      // once received, don't listen anymore to sourceopen event
      mediaSource.removeEventListener('sourceopen', this.onmso);
    }
  }

  onBufferReset(data) {
      this.createSourceBuffers({ tracks : 'video' , mimeType: data.mimeType } );
  }
 
  createSourceBuffers(data) {
    var sourceBuffer = this.sourceBuffer,mediaSource = this.mediaSource;
    if (data.mimeType === ''){
       this.mimeType = 'video/mp4;codecs=avc1.420028'; // avc1.42c01f avc1.42801e avc1.640028 avc1.420028
    }else{
        this.mimeType = 'video/mp4;codecs=' + data.mimeType;
    }
 
    try {
      let sb = sourceBuffer['video'] = mediaSource.addSourceBuffer(this.mimeType);
      sb.addEventListener('updateend', this.onsbue);
    } catch(err) {

    }
    this.media.play();    
  }

  doAppending() {

	  if (this.appending) {
          return;
      }

      var sourceBuffer = this.sourceBuffer, segments = this.segments;
      if (undefined != sourceBuffer['video'] &&
          sourceBuffer['video'].updating) {
          return;
      }
	
	  if ((null == this.media) || 
		  (null == this.media.buffered))
	  {
		  return;
	  }

	  if (0 == Object.keys(sourceBuffer).length) {
          this.segments = [];
		  return;
	  }

      var buffered = this.media.buffered;
      var played = this.media.played;

      if ("preview" == this.type) {
          if (played.length >= 1 && buffered.length >= 1) {
              if (played.end(0)-1 > buffered.start(0) && played.end(0) > 1) {
                  this.sourceBuffer['video'].remove(buffered.start(0), played.end(0)-1);
              }
          }
      }
      else if ("playback" == this.type) {
          if (played.length >= 1 && buffered.length >= 1) {
              if (played.end(0) > buffered.start(0) &&
				  buffered.end(0) - played.end(0) > 5 &&
				  played.end(0) > 1 && 
				  !sourceBuffer['video'].updating) {
                   this.sourceBuffer['video'].remove(buffered.start(0), played.end(0));
				   return;
              }
          }  		  	 
      }

      if (Object.keys(sourceBuffer).length) {
          if (this.media.error) {
              this.segments = [];
			  this.sourceBuffer['video'].remove(buffered.start(0), buffered.end(0));
              console.log('trying to append although a media error occured, flush segment and abort, media code:' + this.media.error.code);
              return;
          }
          
          if (segments && segments.length) {
              if (undefined != sourceBuffer['video'] &&
                  sourceBuffer['video'].updating) {
                  return;
              }

              var segment = segments.shift();
              try {
                  if (sourceBuffer[segment.type]) {
                      this.parent = segment.parent;
                      sourceBuffer[segment.type].appendBuffer(segment.data);
                      this.appendError = 0;
                      this.appended++;
                      this.appending = true;
                  } else {
                  }
              } catch (err) {
                  // in case any error occured while appending, put back segment in segments table
                  segments.unshift(segment);
                  if (err.code !== 22) {
                      if (this.appendError) {
                          this.appendError++;
                      } else {
                          this.appendError = 1;
                      }
                  } else {
                      this.segments = [];
                  }
              }
          }
      }
  }

  FragParsingInitSegment(data){
      var tracks = data.tracks,
          trackName,
          track;

      track = tracks.video;
      if (track) {
          track.id = data.id;
      }

      for (trackName in tracks) {
          track = tracks[trackName];
          var initSegment = track.initSegment;
          if (initSegment) {
              this.onBufferAppending({ type: trackName, data: initSegment, parent: 'main' });
          }
      }
  }

  FragParsingData(data) {
      var self = this;
      [data.data1, data.data2].forEach(function (buffer) {
          if (buffer) {
              self.onBufferAppending({ type: data.type, data: buffer, parent: 'main' });
          }
      });
  }

  reset () {
      var sourceBuffer = this.sourceBuffer;
      if (sourceBuffer != null) {
          sourceBuffer['video'].abort();
          console.log("meida play reset");
      }
  }
}

export default MediaPlay;
