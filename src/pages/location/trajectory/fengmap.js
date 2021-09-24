import fengmap from 'fengmap';
var map;
var locationMarker;
//textmarker对象
//var tm = null;
//marker图层
var layer = null;
var subwayStation = 1;

export function createFengmap() {
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
  map.on('loadComplete', function () {
    console.log('地图加载完成！');
  });
}

var _update = null;

function renderLocation(data) {
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
      size: 16,
      //marker标注高度
      height: 3,
      /*
      callback: function () {
        //回调函数
        //console.log('定位点marker加载完成！');
        if(tm) {
          tm.name = data.time;
          tm.setPosition(data.x, data.y, 1, 5);
        }
      }
      */
      callback: function () {
        updateCircle(data);
      }
    });
    //添加定位点marker
    map.addLocationMarker(locationMarker);
  } else {
    //移动locationMarker
    locationMarker.moveTo({
      x: data.x,
      y: data.y,
      groupID: 1,
      /*
      callback: function () {
        if(tm) {
          tm.name = data.time;
          tm.setPosition(data.x, data.y, 1, 5);
        }
      }
      */
      callback: function () {
        updateCircle(data);
      }
    });
  }

  /*
  //文字标注
  if (!tm) {
    //获取当前聚焦楼层
    var group = map.getFMGroup(map.focusGroupID);
    //返回当前层中第一个textMarkerLayer,如果没有，则自动创建
    layer = group.getOrCreateLayer('textMarker');
    tm = new fengmap.FMTextMarker({
      //标注x坐标点
      x: data.x,
      //标注y坐标点
      y: data.y,
      //标注值
      name: data.time,
      //文本标注填充色
      //fillcolor: "255,0,0",
      fillcolor: "255,255,255",
      //文本标注字体大小
      fontsize: 16,
      //文本标注边线颜色
      strokecolor: "255,255,0"
    });

    //文本标注层添加文本Marker
    layer.addMarker(tm);
  }
  */
}

function updateCircle(data) {
  var group = map.getFMGroup(map.focusGroupID);
  layer = group.getOrCreateLayer('polygonMarker');
  layer.removeAll();

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
        x: parseFloat(data.x),
        y: parseFloat(data.y)
      },
      //设置半径
      radius: function() {
        var radiusT = 12;
        if (data.precision === 2) {
          radiusT = 17;
        } else if (data.precision === 1) {
          radiusT = 25;
        }
        return radiusT;
      }(),
      //设置段数，默认为40段
      segments: 40
    }
  });
  layer.addMarker(circleMaker);
}

function step(currentItem, setCurrentItem) {
  setCurrentItem({
    play: currentItem.play,
    index: currentItem.index,
    data: currentItem.data,
    speed: currentItem.speed
  });
  return renderLocation(currentItem.data[currentItem.index]);
}

export function updateLocation(currentItem, setCurrentItem) {
  if (_update) {
    clearInterval(_update);
    _update = null;
  }
  step(currentItem, setCurrentItem);
  if(currentItem.play) {
    _update = setInterval(function () {
      currentItem.index++;
      if(currentItem.index > currentItem.data.length - 1) {
        currentItem.index = 0;
      }
      step(currentItem, setCurrentItem);
    }, currentItem.speed);
  }
}

export function updateMap(currentItem, setCurrentItem) {
  var naviResults = [
    {
      groupId: 1,
      points: currentItem.data
    }
  ];

  drawLines(naviResults, {
    lineWidth: 5,
    lineType: fengmap.FMLineType.FULL,
    color: '#FF0000'}
  );

  currentItem.play = true;
  currentItem.index = 0;
  updateLocation(currentItem, setCurrentItem);
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

export function clearMap(currentItem, setCurrentItem) {
  if (_update) {
    clearInterval(_update);
    _update = null;
  }
  map.clearLineMark();
  if (locationMarker) {
    map.removeLocationMarker(locationMarker);
    locationMarker = null;
  }

  setCurrentItem({
    play: false,
    index: 0,
    data: [],
    speed: currentItem.speed
  });

  //删除layer上所有Marker
  if (layer) {
    layer.removeAll();
  }
  /*
  if(tm) {
    tm = null;
  }
  */
}
