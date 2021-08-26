/**
 * fMP4 remuxer
*/

import MP4 from './mp4-generator.js';
import AAC from './aac.js';

class MP4Remuxer {
  constructor(id, media, mediaplay_) {
    this.id = id;
    this.media = media;
    this.mediaplay = mediaplay_;
    this.ISGenerated = false;
    this.PES2MP4SCALEFACTOR = 4;
    this.PES_TIMESCALE = 90000;
    this.MP4_TIMESCALE = this.PES_TIMESCALE / this.PES2MP4SCALEFACTOR;
    this.nextAvcDts = 90300;
    this.H264_TIMEBASE = 4000;
  }

  get passthrough() {
    return false;
  }

  stop() {
  }

  insertDiscontinuity() {
    this._initPTS = this._initDTS = undefined;
  }

  switchLevel() {
    this.ISGenerated = false;
  }
   
  pushVideo(level, sn, videoTrack, timeOffset, contiguous) {    
    this.level = level;
    this.sn = sn;
    let videoData;
    // generate Init Segment if needed
    if (!this.ISGenerated) {
      this.generateVideoIS(videoTrack,timeOffset);
    }    
    if (this.ISGenerated) {
      if (videoTrack.samples.length) { 
        this.remuxVideo(videoTrack,timeOffset,contiguous);   
      }
    }  
  }
 
  remuxVideo(track, timeOffset, contiguous, audioTrackLength) {
    var offset = 8,
      pesTimeScale = this.PES_TIMESCALE,
      pes2mp4ScaleFactor = this.PES2MP4SCALEFACTOR,
      mp4SampleDuration,
      mdat, moof,
      firstPTS, firstDTS,
      nextDTS, 
      inputSamples = track.samples,
      outputSamples = [];
   
    /* concatenate the video data and construct the mdat in place
      (need 8 more bytes to fill length and mpdat type) */
    mdat = new Uint8Array(track.len + (4 * track.nbNalu) + 8);
    let view = new DataView(mdat.buffer);
    view.setUint32(0, mdat.byteLength);
    mdat.set(MP4.types.mdat, 4);   
    var sampleDuration=0;
    let ptsnorm, dtsnorm, mp4Sample, lastDTS;

    for (let i = 0; i < inputSamples.length; i++) {
      let avcSample = inputSamples[i],
          mp4SampleLength = 0,
          compositionTimeOffset;
      // convert NALU bitstream to MP4 format (prepend NALU with size field)
      while (avcSample.units.units.length) {
        let unit = avcSample.units.units.shift();
        view.setUint32(offset, unit.data.byteLength);
        offset += 4;
        mdat.set(unit.data, offset);
        offset += unit.data.byteLength;
        mp4SampleLength += 4 + unit.data.byteLength;
      }
    
      let pts = avcSample.pts - this._initPTS;
      let dts = avcSample.dts - this._initDTS; 
      dts = Math.min(pts,dts);

      if (lastDTS !== undefined) {
        ptsnorm = this._PTSNormalize(pts, lastDTS);
        dtsnorm = this._PTSNormalize(dts, lastDTS);
        sampleDuration = (dtsnorm - lastDTS)  
        if (sampleDuration <= 0) {
          console.log (`invalid sample duration at PTS/DTS: ${avcSample.pts}/${avcSample.dts}|dts norm: ${dtsnorm}|lastDTS: ${lastDTS}:${sampleDuration}`);
          sampleDuration = 1;
        }
      } else {
        var nextAvcDts = this.nextAvcDts, delta;
        ptsnorm = this._PTSNormalize(pts, nextAvcDts);
        dtsnorm = this._PTSNormalize(dts, nextAvcDts);
        if (nextAvcDts) {
          delta = Math.round((dtsnorm - nextAvcDts) );
          if (/*contiguous ||*/ Math.abs(delta) < 100) {
            if (delta) {
              if (delta > 1) {
                  console.log (`AVC:${delta} ms hole between fragments detected,filling it`);
              } else if (delta < -1) {
                console.log (`AVC:${(-delta)} ms overlapping between fragments detected`);
              }
              dtsnorm = nextAvcDts;
              ptsnorm = Math.max(ptsnorm - delta, dtsnorm);
              console.log (`Video/PTS/DTS adjusted: ${ptsnorm}/${dtsnorm},delta:${delta}`);
            }
          }
        }
        this.firstPTS = Math.max(0, ptsnorm);
        this.firstDTS = Math.max(0, dtsnorm);
        sampleDuration = 0.03; 
      }
 
      outputSamples.push({
        size: mp4SampleLength,  
        duration:  this.H264_TIMEBASE, 
        cts: 0,
        flags: {
          isLeading: 0,
          isDependedOn: 0,
          hasRedundancy: 0,
          degradPrio: 0,
          dependsOn : avcSample.key ? 2 : 1,
          isNonSync : avcSample.key ? 0 : 1
        }
      });
     lastDTS = dtsnorm;

    }

    var lastSampleDuration = 0;
    if (outputSamples.length >= 2) {
      lastSampleDuration = outputSamples[outputSamples.length - 2].duration;
      outputSamples[0].duration = lastSampleDuration;
    }
    this.nextAvcDts = dtsnorm + lastSampleDuration;
    let dropped = track.dropped;
    track.len = 0;
    track.nbNalu = 0;
    track.dropped = 0;
    if(outputSamples.length && navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
      //let flags = outputSamples[0].flags; 
      //flags.dependsOn = 2;
      //flags.isNonSync = 0;
    }
    track.samples = outputSamples; 
    moof = MP4.moof(track.sequenceNumber++, dtsnorm  , track);
    track.samples = [];

    let data = {
      id : this.id,
      level : this.level,
      sn : this.sn,
      data1: moof,
      data2: mdat,
      startPTS: ptsnorm, 
      endPTS: ptsnorm, 
      startDTS: dtsnorm, 
      endDTS: dtsnorm, 
      type: 'video',
      nb: outputSamples.length,
      dropped : dropped
    };
    
   this.mediaplay.FragParsingData(data);
    return data;
  }
  
  generateVideoIS(videoTrack,timeOffset) {
    var videoSamples = videoTrack.samples,
        pesTimeScale = this.PES_TIMESCALE,
        tracks = {},
        data = { id : this.id, level : this.level, sn : this.sn, tracks : tracks, unique : false },
        computePTSDTS = (this._initPTS === undefined),
        initPTS, initDTS;

    if (computePTSDTS) {
      initPTS = initDTS = Infinity;
    }
 
    if (videoTrack.sps && videoTrack.pps && videoSamples.length) {
      videoTrack.timescale = 90000;//this.MP4_TIMESCALE;
      tracks.video = {
        container : 'video/mp4',
        codec :  videoTrack.codec,
        initSegment : MP4.initSegment([videoTrack]),
        metadata : {
          width : videoTrack.width,
          height : videoTrack.height
        }
      };
      if (computePTSDTS) { 
        initPTS = Math.min(initPTS,videoSamples[0].pts - this.H264_TIMEBASE);
        initDTS = Math.min(initDTS,videoSamples[0].dts - this.H264_TIMEBASE );
      }
    }

    if(Object.keys(tracks).length) {
        this.mediaplay.FragParsingInitSegment(data);
        this.ISGenerated = true;
        if (computePTSDTS) {
            this._initPTS = initPTS;
            this._initDTS = initDTS;
         }
    } else {
      console.log( "generateVideoIS ERROR==> ");
    }
  }

  generateIS(audioTrack,videoTrack,timeOffset) {
    var audioSamples = audioTrack.samples,
        videoSamples = videoTrack.samples,
        pesTimeScale = this.PES_TIMESCALE,
        tracks = {},
        data = { id : this.id, level : this.level, sn : this.sn, tracks : tracks, unique : false },
        computePTSDTS = (this._initPTS === undefined),
        initPTS, initDTS;

    if (computePTSDTS) {
      initPTS = initDTS = Infinity;
    }
    if (audioSamples.length) {
      audioTrack.timescale = audioTrack.audiosamplerate;
      // MP4 duration (track duration in seconds multiplied by timescale) is coded on 32 bits
      // we know that each AAC sample contains 1024 frames....
      // in order to avoid overflowing the 32 bit counter for large duration, we use smaller timescale (timescale/gcd)
      // we just need to ensure that AAC sample duration will still be an integer (will be 1024/gcd)
      if (audioTrack.timescale * audioTrack.duration > Math.pow(2, 32)) {
        let greatestCommonDivisor = function(a, b) {
            if ( ! b) {
                return a;
            }
            return greatestCommonDivisor(b, a % b);
        };
        audioTrack.timescale = audioTrack.audiosamplerate / greatestCommonDivisor(audioTrack.audiosamplerate,1024);
      }
      console.log ('audio mp4 timescale :'+ audioTrack.timescale);
      tracks.audio = {
        container : 'audio/mp4',
        codec :  audioTrack.codec,
        initSegment : MP4.initSegment([audioTrack]),
        metadata : {
          channelCount : audioTrack.channelCount
        }
      };
      if (computePTSDTS) {
        // remember first PTS of this demuxing context. for audio, PTS + DTS ...
        initPTS = initDTS = audioSamples[0].pts - pesTimeScale * timeOffset;
      }
    }

    if (videoTrack.sps && videoTrack.pps && videoSamples.length) {
      videoTrack.timescale = this.MP4_TIMESCALE;
      tracks.video = {
        container : 'video/mp4',
        codec :  videoTrack.codec,
        initSegment : MP4.initSegment([videoTrack]),
        metadata : {
          width  : videoTrack.width,
          height : videoTrack.height
        }
      };
      if (computePTSDTS) {
        initPTS = Math.min(initPTS,videoSamples[0].pts - pesTimeScale * timeOffset);
        initDTS = Math.min(initDTS,videoSamples[0].dts - pesTimeScale * timeOffset);
      }
    }

    if(Object.keys(tracks).length) {
        this.mediaplay.FragParsingInitSegment(data);
        this.ISGenerated = true;
        if (computePTSDTS) {
            this._initPTS = initPTS;
            this._initDTS = initDTS;
        }
    } else {
     // observer.trigger(Event.ERROR, {type : ErrorTypes.MEDIA_ERROR, id : this.id, details: ErrorDetails.FRAG_PARSING_ERROR, fatal: false, reason: 'no audio/video samples found'});
    }
  }

  _PTSNormalize(value, reference) {
    var offset;
    if (reference === undefined) {
      return value;
    }
    if (reference < value) {
      // - 2^33
      offset = -8589934592;
    } else {
      // + 2^33
      offset = 8589934592;
    }
    /* PTS is 33bit (from 0 to 2^33 -1)
      if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
      PTS looping occured. fill the gap */
    while (Math.abs(value - reference) > 4294967296) {
        value += offset;
    }
    return value;
  }

   remux(level,sn,audioTrack,videoTrack,timeOffset, contiguous) {
    this.level = level;
    this.sn = sn;
    // generate Init Segment if needed
    if (!this.ISGenerated) {
      this.generateAudioVideoIS(audioTrack,videoTrack,timeOffset);
    }

    if (this.ISGenerated) {
      // Purposefully remuxing audio before video, so that remuxVideo can use nextAacPts, which is
      // calculated in remuxAudio.
      if (audioTrack.samples.length) {
        let audioData = this.remuxAudio(audioTrack,timeOffset,contiguous);        
        if (videoTrack.samples.length) {
          let audioTrackLength;
          if (audioData) {
            audioTrackLength = audioData.endPTS - audioData.startPTS;
          }
          this.remuxVideo(videoTrack,timeOffset,contiguous,audioTrackLength);
        }
      } else {
        let videoData;
        if (videoTrack.samples.length) {
          videoData = this.remuxVideo(videoTrack,timeOffset,contiguous);
        }
        if (videoData && audioTrack.codec) {
          this.remuxEmptyAudio(audioTrack, timeOffset, contiguous, videoData);
        }
      }
    }
  }

  generateAudioVideoIS(audioTrack,videoTrack,timeOffset) {
    var audioSamples = audioTrack.samples,
        videoSamples = videoTrack.samples,
        pesTimeScale = this.PES_TIMESCALE,
        tracks = {},
        data = { id : this.id, level : this.level, sn : this.sn, tracks : tracks, unique : false },
        computePTSDTS = (this._initPTS === undefined),
        initPTS, initDTS;

    if (computePTSDTS) {
      initPTS = initDTS = Infinity;
    }
    if (audioTrack.config && audioSamples.length) {
      audioTrack.timescale = audioTrack.audiosamplerate;
      // MP4 duration (track duration in seconds multiplied by timescale) is coded on 32 bits
      // we know that each AAC sample contains 1024 frames....
      // in order to avoid overflowing the 32 bit counter for large duration, we use smaller timescale (timescale/gcd)
      // we just need to ensure that AAC sample duration will still be an integer (will be 1024/gcd)
      if (audioTrack.timescale * audioTrack.duration > Math.pow(2, 32)) {
        let greatestCommonDivisor = function(a, b) {
            if ( ! b) {
                return a;
            }
            return greatestCommonDivisor(b, a % b);
        };
        audioTrack.timescale = audioTrack.audiosamplerate / greatestCommonDivisor(audioTrack.audiosamplerate,1024);
      }

      tracks.audio = {
        container : 'audio/mp4',
        codec :  audioTrack.codec,
        initSegment : MP4.initSegment([audioTrack]),
        metadata : {
          channelCount : audioTrack.channelCount
        }
      };
      if (computePTSDTS) {
        // remember first PTS of this demuxing context. for audio, PTS + DTS ...
        initPTS = initDTS = audioSamples[0].pts - pesTimeScale * timeOffset;
      }
    }

    if (videoTrack.sps && videoTrack.pps && videoSamples.length) {
      videoTrack.timescale = this.MP4_TIMESCALE;
      tracks.video = {
        container : 'video/mp4',
        codec :  videoTrack.codec,
        initSegment : MP4.initSegment([videoTrack]),
        metadata : {
          width : videoTrack.width,
          height : videoTrack.height
        }
      };
      if (computePTSDTS) {
        initPTS = Math.min(initPTS,videoSamples[0].pts - pesTimeScale * timeOffset);
        initDTS = Math.min(initDTS,videoSamples[0].dts - pesTimeScale * timeOffset);
      }
    }

    if(Object.keys(tracks).length) {
	  this.mediaplay.FragParsingInitSegment(data);
      this.ISGenerated = true;
      if (computePTSDTS) {
        this._initPTS = initPTS;
        this._initDTS = initDTS;
      }
    } else {
      //observer.trigger(Event.ERROR, {type : ErrorTypes.MEDIA_ERROR, id : this.id, details: ErrorDetails.FRAG_PARSING_ERROR, fatal: false, reason: 'no audio/video samples found'});
    }
  }

  remuxAudio(track, timeOffset, contiguous) {
    let pesTimeScale = this.PES_TIMESCALE,
        mp4timeScale = track.timescale,
        pes2mp4ScaleFactor = pesTimeScale/mp4timeScale,
        expectedSampleDuration = track.timescale * 1024 / track.audiosamplerate;
    var view,
        offset = 8,
        aacSample, mp4Sample,
        unit,
        mdat, moof,
        firstPTS, firstDTS, lastDTS,
        pts, dts, ptsnorm, dtsnorm,
        samples = [],
        samples0 = [];

    track.samples.sort(function(a, b) {
      return (a.pts-b.pts);
    });
    samples0 = track.samples;

    let nextAacPts = (contiguous ? this.nextAacPts : timeOffset*pesTimeScale);

    // If the audio track is missing samples, the frames seem to get "left-shifted" within the
    // resulting mp4 segment, causing sync issues and leaving gaps at the end of the audio segment.
    // In an effort to prevent this from happening, we inject frames here where there are gaps.
    // When possible, we inject a silent frame; when that's not possible, we duplicate the last
    // frame.
    let firstPtsNorm = this._PTSNormalize(samples0[0].pts - this._initPTS, nextAacPts),
        pesFrameDuration = expectedSampleDuration * pes2mp4ScaleFactor;
    var nextPtsNorm = firstPtsNorm + pesFrameDuration;
    for (var i = 1; i < samples0.length; ) {
      // First, let's see how far off this frame is from where we expect it to be
      var sample = samples0[i],
          ptsNorm = this._PTSNormalize(sample.pts - this._initPTS, nextAacPts),
          delta = ptsNorm - nextPtsNorm;

      // If we're overlapping by more than half a duration, drop this sample
      if (delta < (-0.5 * pesFrameDuration)) {
        //logger.log(`Dropping frame due to ${Math.abs(delta / 90)} ms overlap.`);
        samples0.splice(i, 1);
        track.len -= sample.unit.length;
        // Don't touch nextPtsNorm or i
      }
      // Otherwise, if we're more than half a frame away from where we should be, insert missing frames
      else if (delta > (0.5 * pesFrameDuration)) {
        var missing = Math.round(delta / pesFrameDuration);
        //logger.log(`Injecting ${missing} frame${missing > 1 ? 's' : ''} of missing audio due to ${Math.round(delta / 90)} ms gap.`);
        for (var j = 0; j < missing; j++) {
          var newStamp = samples0[i - 1].pts + pesFrameDuration,
              fillFrame = AAC.getSilentFrame(track.channelCount);
          if (!fillFrame) {
            //logger.log('Unable to get silent frame for given audio codec; duplicating last frame instead.');
            fillFrame = sample.unit.slice(0);
          }
          samples0.splice(i, 0, {unit: fillFrame, pts: newStamp, dts: newStamp});
          track.len += fillFrame.length;
          i += 1;
        }

        // Adjust sample to next expected pts
        nextPtsNorm += (missing + 1) * pesFrameDuration;
        sample.pts = samples0[i - 1].pts + pesFrameDuration;
        i += 1;
      }
      // Otherwise, we're within half a frame duration, so just adjust pts
      else {
        if (Math.abs(delta) > (0.1 * pesFrameDuration)) {
          //logger.log(`Invalid frame delta ${ptsNorm - nextPtsNorm + pesFrameDuration} at PTS ${Math.round(ptsNorm / 90)} (should be ${pesFrameDuration}).`);
        }
        nextPtsNorm += pesFrameDuration;
        sample.pts = samples0[i - 1].pts + pesFrameDuration;
        i += 1;
      }
    }

    while (samples0.length) {
      aacSample = samples0.shift();
      unit = aacSample.unit;
      pts = aacSample.pts - this._initDTS;
      dts = aacSample.dts - this._initDTS;
      //logger.log(`Audio/PTS:${Math.round(pts/90)}`);
      // if not first sample
      if (lastDTS !== undefined) {
        ptsnorm = this._PTSNormalize(pts, lastDTS);
        dtsnorm = this._PTSNormalize(dts, lastDTS);
        mp4Sample.duration = (dtsnorm - lastDTS) / pes2mp4ScaleFactor;
      } else {
        ptsnorm = this._PTSNormalize(pts, nextAacPts);
        dtsnorm = this._PTSNormalize(dts, nextAacPts);
        let delta = Math.round(1000 * (ptsnorm - nextAacPts) / pesTimeScale);
        // if fragment are contiguous, detect hole/overlapping between fragments
        if (contiguous) {
          // log delta
          if (delta) {
            if (delta > 0) {
              //logger.log(`${delta} ms hole between AAC samples detected,filling it`);
              // if we have frame overlap, overlapping for more than half a frame duraion
            } else if (delta < -12) {
              // drop overlapping audio frames... browser will deal with it
              //logger.log(`${(-delta)} ms overlapping between AAC samples detected, drop frame`);
              track.len -= unit.byteLength;
              continue;
            }
            // set PTS/DTS to expected PTS/DTS
            ptsnorm = dtsnorm = nextAacPts;
          }
        }
        // remember first PTS of our aacSamples, ensure value is positive
        firstPTS = Math.max(0, ptsnorm);
        firstDTS = Math.max(0, dtsnorm);
        if(track.len > 0) {
          /* concatenate the audio data and construct the mdat in place
            (need 8 more bytes to fill length and mdat type) */
          mdat = new Uint8Array(track.len + 8);
          view = new DataView(mdat.buffer);
          view.setUint32(0, mdat.byteLength);
          mdat.set(MP4.types.mdat, 4);
        } else {
          // no audio samples
          return;
        }
      }
      mdat.set(unit, offset);
      offset += unit.byteLength;
      //console.log('PTS/DTS/initDTS/normPTS/normDTS/relative PTS : ${aacSample.pts}/${aacSample.dts}/${this._initDTS}/${ptsnorm}/${dtsnorm}/${(aacSample.pts/4294967296).toFixed(3)}');
      mp4Sample = {
        size: unit.byteLength,
        cts: 0,
        duration:0,
        flags: {
          isLeading: 0,
          isDependedOn: 0,
          hasRedundancy: 0,
          degradPrio: 0,
          dependsOn: 1,
        }
      };
      samples.push(mp4Sample);
      lastDTS = dtsnorm;
    }
    var lastSampleDuration = 0;
    var nbSamples = samples.length;
    //set last sample duration as being identical to previous sample
    if (nbSamples >= 2) {
      lastSampleDuration = samples[nbSamples - 2].duration;
      mp4Sample.duration = lastSampleDuration;
    }
    if (nbSamples) {
      // next aac sample PTS should be equal to last sample PTS + duration
      this.nextAacPts = ptsnorm + pes2mp4ScaleFactor * lastSampleDuration;
      //logger.log('Audio/PTS/PTSend:' + aacSample.pts.toFixed(0) + '/' + this.nextAacDts.toFixed(0));
      track.len = 0;
      track.samples = samples;
      moof = MP4.moof(track.sequenceNumber++, firstDTS / pes2mp4ScaleFactor, track);
      track.samples = [];
      let audioData = {
        id : this.id,
        level : this.level,
        sn : this.sn,
        data1: moof,
        data2: mdat,
        startPTS: firstPTS / pesTimeScale,
        endPTS: this.nextAacPts / pesTimeScale,
        startDTS: firstDTS / pesTimeScale,
        endDTS: (dtsnorm + pes2mp4ScaleFactor * lastSampleDuration) / pesTimeScale,
        type: 'audio',
        nb: nbSamples
      };
     
	  this.mediaplay.FragParsingData(audioData);

      return audioData;
    }
    return null;
  }

  remuxEmptyAudio(track, timeOffset, contiguous, videoData) {
    let pesTimeScale = this.PES_TIMESCALE,
        mp4timeScale = track.timescale ? track.timescale : track.audiosamplerate,
        pes2mp4ScaleFactor = pesTimeScale/mp4timeScale,

        // sync with video's timestamp
        startDTS = videoData.startDTS * pesTimeScale + this._initDTS,
        endDTS = videoData.endDTS * pesTimeScale + this._initDTS,

        // one sample's duration value
        sampleDuration = 1024,
        frameDuration = pes2mp4ScaleFactor * sampleDuration,

        // samples count of this segment's duration
        nbSamples = Math.ceil((endDTS - startDTS) / frameDuration),

        // silent frame
        silentFrame = AAC.getSilentFrame(track.channelCount);

    // Can't remux if we can't generate a silent frame...
    if (!silentFrame) {
      //logger.trace('Unable to remuxEmptyAudio since we were unable to get a silent frame for given audio codec!');
      return;
    }

    let samples = [];
    for(var i = 0; i < nbSamples; i++) {
      var stamp = startDTS + i * frameDuration;
      samples.push({unit: silentFrame.slice(0), pts: stamp, dts: stamp});
      track.len += silentFrame.length;
    }
    track.samples = samples;

    this.remuxAudio(track, timeOffset, contiguous);
  }

}

export default MP4Remuxer;
