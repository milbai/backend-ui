import fengmap from 'fengmap';
var map;
var locationMarker;
export function createFengmap() {
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
  };
  map = new fengmap.FMMap(mapOptions);
  map.openMapById(fmapID, function (error) {
    console.log(error);
  });
  map.on('loadComplete', function () {
    console.log('地图加载完成！');
  });
}

var _mockdata = [];
var _callback;
var _update;
var _freq = 100;
var _index = 0;

function updateLocation(cb) {
  _callback = function () {
    var _data;
    if (_index > _mockdata.length - 1) {
      _index = 0;
    }
    _data = _mockdata[_index];
    _index++;
    return cb(_data)
  };
  _update = setInterval(_callback, _freq);
}

export function updateMap(data) {
  clearMap();
  addMarkerFunc(data);
}

function addMarkerFunc(data) {
  var naviResults = [
    {
      groupId: 1,
      points: []
    }
  ];

  for(var i = data.length - 1; i >= 0 ; i--) {
    var p = JSON.parse(data[i].content);
    if(p.badgePos_x >= 12609225.960729167 && p.badgePos_x <= 12610032.132511862 &&
      p.badgePos_y >= 2634433.8295556237 && p.badgePos_y <= 2634690.610197519)
      naviResults[0].points.push({ x: p.badgePos_x, y: p.badgePos_y, z: 3 });
  }

  drawLines(naviResults, {
    lineWidth: 5,
    lineType: fengmap.FMLineType.FULL,
    color: '#FF0000'}
  );

  _mockdata = naviResults[0].points;

  updateLocation(function (data) {
    if (!locationMarker) {
      locationMarker = new fengmap.FMLocationMarker({
        //x坐标值
        x: data.x,
        //y坐标值
        y: data.y,
        //图片地址
        url: './fengmap/images/bluedot.png',
        //楼层id
        groupID: 1,
        //图片尺寸
        size: 32,
        //marker标注高度
        height: 3,
        callback: function () {
          //回调函数
          console.log('定位点marker加载完成！');
        }
      });
      //添加定位点marker
      map.addLocationMarker(locationMarker);
    } else {
      console.log(data.x);
      //移动locationMarker
      locationMarker.moveTo({
        x: data.x,
        y: data.y,
        groupID: 1
      });
    }
  });
}

function drawLines(results, lineStyle) {
  //创建路径线图层
  var line = new fengmap.FMLineMarker();
  //循环results中坐标点集合，通过坐标点绘制路径线
  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    var gid = result.groupId;
    var points = result.points;
    //创建FMSegment点集，一个点集代表一条折线
    var seg = new fengmap.FMSegment();
    seg.groupId = gid;
    seg.points = points;
    //将FMSegment绘制到线图层上
    line.addSegment(seg);
    //绘制线
    map.drawLineMark(line, lineStyle);
  }
}

export function clearMap() {
  map.clearLineMark();
  if (_update) {
    clearInterval(_update);
    _index = 0;
  }
  if (locationMarker) {
    map.removeLocationMarker(locationMarker);
    locationMarker = null;
  }
}
