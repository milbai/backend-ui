import fengmap from 'fengmap';
import videojs from "video.js";
//var myVideo;
var map;
var fenceList = [], cm100List;
var selected = null;
var devicesData = {};
var alarmDevices = {};
var subwayStation = 1;
const fenceCoords = [
  //月检线
  [
    { x: 12609690.697, y: 2634633.375, z: 56 },
    { x: 12609690.697, y: 2634689.016, z: 56 },
    { x: 12609340.636, y: 2634689.016, z: 56 },
    { x: 12609340.636, y: 2634635.375, z: 56 },
  ],

  //维修线
  // [
  //   { x: 12609257.503689926, y: 2634651.916090568, z: 56 },
  //   { x: 12609258.790374342, y: 2634636.405447829, z: 56 },
  //   { x: 12609707.527558396, y: 2634634.2928042985, z: 56 },
  //   { x: 12609706.033594407, y: 2634652.290200657, z: 56 },
  // ],

  //停车日检库B区
  [
    { x: 12609242.913, y: 2634621.351, z: 56 },
    { x: 12609242.913, y: 2634466.657, z: 56 },
    { x: 12609613.856, y: 2634466.657, z: 56 },
    { x: 12609613.856, y: 2634621.351, z: 56 },
  ],

  //停车日检库A区
  [
    { x: 12609647.203, y: 2634623.741, z: 56 },
    { x: 12609647.203, y: 2634464.339, z: 56 },
    { x: 12609998.237, y: 2634464.339, z: 56 },
    { x: 12609998.237, y: 2634620.741, z: 56 },
  ],

  //出场线
  [
    { x: 12610038.671650294, y: 2634635.777639212, z: 56 },
    { x: 12610035.285046501, y: 2634466.6918881186, z: 56 },
    { x: 12610117.767852884, y: 2634470.7921805014, z: 56 },
    { x: 12610110.052573442, y: 2634623.166006285, z: 56 },
  ],

];
export function setAlarms(alarms) {
  alarmDevices = alarms;
}

export function createFengmap(callback, setCurrentItem, getTGSG_state) {

  var fmapID = '';
  var mapOptions = {};
  if (subwayStation === 1) {
    fmapID = '1384053067182067713'; // 陈头岗
    mapOptions = {
      container: document.getElementById('fengmap'),
      mapServerURL: './fengmap/data/' + fmapID,
      mapThemeURL: './fengmap/data/theme',
      defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
      mapScaleLevelRange: [16, 23],       // 比例尺级别范围， 16级到23级
      // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
      defaultMapScaleLevel: 18,          // 默认比例尺级别设置为19级
      appName: '陈头岗地铁停车场',
      key: '40308d481d2d806bcd2e5fb346c2dc45',
      // 把地图转成俯视图的效果
      defaultViewMode: fengmap.FMViewMode.MODE_2D,
      defaultControlsPose: 0,     //角度值。
      defaultViewCenter: { x: 12609603.113274425, y: 2634539.7186213997 },
    };
  } else if (subwayStation === 2) {
    fmapID = '1422111691233742850'; // 陇枕
    mapOptions = {
      container: document.getElementById('fengmap'),
      mapServerURL: './fengmap/data/' + fmapID,
      mapThemeURL: './fengmap/data/theme',
      defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
      mapScaleLevelRange: [6, 23],       // 比例尺级别范围， 16级到23级
      // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
      defaultMapScaleLevel: 15,          // 默认比例尺级别设置为19级
      appName: '陈头岗地铁停车场',
      key: '40308d481d2d806bcd2e5fb346c2dc45',
      // 把地图转成俯视图的效果
      defaultViewMode: fengmap.FMViewMode.MODE_2D,
      defaultControlsPose: 0,     //角度值。
    };

  } else {
    fmapID = '1397382550647533570'; // 万顷沙
    mapOptions = {
      container: document.getElementById('fengmap'),
      mapServerURL: './fengmap/data/' + fmapID,
      mapThemeURL: './fengmap/data/theme',
      defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
      mapScaleLevelRange: [6, 23],       // 比例尺级别范围， 16级到23级
      // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
      defaultMapScaleLevel: 15,          // 默认比例尺级别设置为19级
      appName: '陈头岗地铁停车场',
      key: '40308d481d2d806bcd2e5fb346c2dc45',
      // 把地图转成俯视图的效果
      defaultViewMode: fengmap.FMViewMode.MODE_2D,
      defaultControlsPose: 0,     //角度值。
    };
  }


  map = new fengmap.FMMap(mapOptions);
  map.openMapById(fmapID, function (error) {
    console.log(error);
  });
  map.on('loadComplete', callback);

  map.on('mapClickNode', function (event) {
    //console.log(event);
    var nodeType = event.nodeType;
    var target = event.target;

    if(target && target.index && cm100List && cm100List[target.index] && selected !==  cm100List[target.index].id) {
      closevideo();
    }

    if(!nodeType || !target || (nodeType !== 36 && nodeType !== 31) || (nodeType === 36 && target.index === -1)) {
      if(selected) {
        selected = null;
        updateMarkers(cm100List);
      }
      setCurrentItem({});
      return;
    }
    if(nodeType === 36) {
      if(selected) {
        selected = null;
        updateMarkers(cm100List);
      }
      setCurrentItem(fenceList[target.index]);
    } else if(nodeType === 31) {
      setTimeout(function () {
        if(selected !==  cm100List[target.index].id) {
          selected = cm100List[target.index].id;
          updateMarkers(cm100List);
        }
        setCurrentItem(cm100List[target.index]);
        /*
        if(cm100List[target.index].productId === "videoMonitor") {
          if(myVideo)
            myVideo.dispose();
          myVideo = videojs("myVideo", {});
          myVideo.src({
            src: cm100List[target.index].describe,
            type: 'application/x-mpegURL'
          });
          myVideo.play();
        }
        */
        if(cm100List[target.index].productId === "TGSG-190") {
          getTGSG_state(cm100List[target.index].id);
        }
      }, 0);
    }
  });
}

function closevideo() {
  var iframe = document.getElementsByTagName('iframe')[0];
  if(iframe && iframe.contentWindow && iframe.contentWindow.document.getElementById('closevideo')) {
    iframe.contentWindow.document.getElementById('closevideo').click();
  }
}

function updatePolygonMarker() {
  var group = map.getFMGroup(map.focusGroupID);
  var layer = group.getOrCreateLayer('polygonMarker');
  layer.removeAll();

  //画围栏
  for(var i = 0; i < fenceCoords.length; i++) {
    if(fenceList[i]) {
      addPolygonMarker(fenceCoords[i], i);
    }
  }
  function addPolygonMarker(coords, index) {
    var polygonMarker = new fengmap.FMPolygonMarker({
      alpha: 0,             //设置透明度
      color: '#CD5A5A',
      lineColor: '#FFFFFF',
      lineWidth: 3,      //设置边框线的宽度
      height: 6,    //设置高度*/
      points: coords //多边形坐标点
    });
    polygonMarker.index = index;
    layer.addMarker(polygonMarker);
  }

  //画蓝牙圆圈
  var list = devicesData['1'];
  if(!list)
    return;
  for(var j = 0; j < list.length; j++) {
    createCircleMaker(list[j]);
  }
  function createCircleMaker(item) {

    var circleMaker = new fengmap.FMPolygonMarker({
      //设置颜色
      color: '#3CF9DF',
      //设置透明度
      alpha: .3,
      //设置边框线的宽度
      lineWidth: 1,
      //设置高度
      height: 6,
      //多边形的坐标点集数组
      points: {
        //设置为圆形
        type: 'circle',
        //设置此形状的中心坐标
        center: {
          x: parseFloat(item.longitude),
          y: parseFloat(item.latitude)
        },
        //设置半径
        radius: function() {
          var radiusT = 12;
          if (item.precision === 2) {
            radiusT = 17;
          } else if (item.precision === 1) {
            radiusT = 25;
          }
          return radiusT;
        }(),
        //设置段数，默认为40段
        segments: 40
      }
    });
    circleMaker.index = -1;
    layer.addMarker(circleMaker);
  }
}

export function setFenceData(data) {
  fenceList = data;
  updatePolygonMarker();
}

export function setDevicesData(data) {
  devicesData[data.type] = data.data;
  var arr = [];
  for(let key in devicesData) {
    arr = arr.concat(devicesData[key]);
  }
  cm100List = arr;
  updatePolygonMarker();
  updateMarkers(cm100List);
}

function updateMarkers(data) {
  var group = map.getFMGroup(map.focusGroupID);
  var layer = group.getOrCreateLayer('imageMarker');
  layer.removeAll();
  //console.log(data);
  //cm100List = data;
  for(var i = 0; i < data.length; i++) {
    var im = new fengmap.FMImageMarker({
      x: parseFloat(data[i].longitude),
      y: parseFloat(data[i].latitude),
      url: function(){
        var url = './fengmap/images/' + data[i].productId;
        if(alarmDevices[data[i].id]) {
          url += '_alarm';
        }
        if(selected === data[i].id) {
          url += '_select';
        }
        url += '.png';
        return url;
      }(),
      //设置图片显示尺寸
      //size: selected === data[i].id ? 48 : 32,
      size: selected === data[i].id ? 32 : 24,
      size: function(){
        var s = selected === data[i].id ? 48 : 32;
        if (data[i].productId === 'CM100-GB') {
          s = selected === data[i].id ? 32 : 24;
        }

        return s;
      }(),
      //标注高度，大于model的高度
      height: 4
    });
    im.index = i;
    layer.addMarker(im);
  }
}
