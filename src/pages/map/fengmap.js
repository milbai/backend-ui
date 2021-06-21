import fengmap from 'fengmap';
import videojs from "video.js";
var myVideo;
var map;
var fenceList, cm100List;

export function createFengmap(callback, setCurrentItem) {
  var fmapID = '1384053067182067713';
  var mapOptions = {
    container: document.getElementById('fengmap'),
    mapServerURL: './fengmap/data/' + fmapID,
    mapThemeURL: './fengmap/data/theme',
    defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
    mapScaleLevelRange: [16, 23],       // 比例尺级别范围， 16级到23级
    // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
    defaultMapScaleLevel: 17,          // 默认比例尺级别设置为19级
    appName: '陈头岗地铁停车场',
    key: '40308d481d2d806bcd2e5fb346c2dc45',
    defaultViewMode: fengmap.FMViewMode.MODE_2D,
    // defaultControlsPose: fengmap.FMDirection.NORTH,
    defaultControlsPose: 0,     //角度值。
  };
  map = new fengmap.FMMap(mapOptions);
  map.openMapById(fmapID, function (error) {
    console.log(error);
  });
  map.on('loadComplete', callback);

  map.on('mapClickNode', function (event) {
    //console.log(event);
    var nodeType = event.nodeType;
    var target = event.target;
    if(!nodeType || !target || (nodeType !== 36 && nodeType !== 31)) {
      setCurrentItem({});
      return;
    }
    if(nodeType === 36) {
      setCurrentItem(fenceList[target.index]);
    } else if(nodeType === 31) {
      setTimeout(function () {
        setCurrentItem(cm100List[target.index]);
        if(cm100List[target.index].productId === "videoMontior") {
          if(myVideo)
            myVideo.dispose();
          myVideo = videojs("myVideo", {});
          myVideo.src({
            src: cm100List[target.index].describe,
            type: 'application/x-mpegURL'
          });
          myVideo.play();
        }
      }, 0);
    }
  });
}

export function addPolygonMarker(data) {
  var group = map.getFMGroup(map.focusGroupID);
  var layer = group.getOrCreateLayer('polygonMarker');
  layer.removeAll();
  fenceList = data;
  //console.log(data);
  const fenceCoords = [
    //月检线
    [
      { x: 12609343.487486389, y: 2634680.7467382923, z: 56 },
      { x: 12609339.252967019, y: 2634651.1668030284, z: 56 },
      { x: 12609706.621351019, y: 2634652.1526199896, z: 56 },
      { x: 12609706.650074564, y: 2634681.1130687636,  z: 56 },
    ],
    //维修线
    [
      { x: 12609257.503689926, y: 2634651.916090568, z: 56 },
      { x: 12609258.790374342, y: 2634636.405447829, z: 56 },
      { x: 12609707.527558396, y: 2634634.2928042985, z: 56 },
      { x: 12609706.033594407, y: 2634652.290200657, z: 56 },
    ],
    //停车日检库A区
    [
      { x: 12609242.913614508, y: 2634621.3513399083, z: 56 },
      { x: 12609239.662802674, y: 2634466.6577441064, z: 56 },
      { x: 12609613.856840886, y: 2634465.754081998, z: 56 },
      { x: 12609613.544191122, y: 2634621.7920239493, z: 56 },
    ],
    //停车日检库B区
    [
      { x: 12609647.203478605, y: 2634622.74148204, z: 56 },
      { x: 12609645.15114645, y: 2634464.339464341, z: 56 },
      { x: 12609998.237355687, y: 2634466.8285023263, z: 56 },
      { x: 12610002.36026345, y: 2634620.025391266, z: 56 },
    ],
    //出场线
    [
      { x: 12610038.671650294, y: 2634635.777639212, z: 56 },
      { x: 12610035.285046501, y: 2634466.6918881186, z: 56 },
      { x: 12610117.767852884, y: 2634470.7921805014, z: 56 },
      { x: 12610110.052573442, y: 2634623.166006285, z: 56 },
    ]
  ];
  for(var i = 0; i < fenceCoords.length; i++) {
    if(data[i]) {
      addPolygonMarker(fenceCoords[i], i);
    }
  }
  function addPolygonMarker(coords, index) {
    var polygonMarker = new fengmap.FMPolygonMarker({
      alpha: .8,             //设置透明度
      color: '#CD5A5A',
      lineWidth: 0,      //设置边框线的宽度
      height: 6,    //设置高度*/
      points: coords //多边形坐标点
    });
    polygonMarker.index = index;
    layer.addMarker(polygonMarker);
  }
}

export function updateMarkers(data) {
  var group = map.getFMGroup(map.focusGroupID);
  var layer = group.getOrCreateLayer('imageMarker');
  layer.removeAll();
  //console.log(data);
  cm100List = data;
  for(var i = 0; i < data.length; i++) {
    var im = new fengmap.FMImageMarker({
      x: parseFloat(data[i].longitude),
      y: parseFloat(data[i].latitude),
      url: './fengmap/images/' + data[i].productId + '.png',
      //设置图片显示尺寸
      size: 32,
      //标注高度，大于model的高度
      height: 4
    });
    im.index = i;
    layer.addMarker(im);
  }
}
