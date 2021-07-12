import fengmap from 'fengmap';
const pathCoords = [
  //走廊
  [
    {
      x: 12609730.584668012, y: 2634680.204680953,
      groupID: 1
    },
    {
      x: 12609628.452463193, y: 2634483.8905584496,
      groupID: 1
    }
  ],
  //月检站
  [
    {
      x: 12609729.815250406, y: 2634669.4546577465,
      groupID: 1
    },
    {
      x: 12609350.735470776, y: 2634668.477778039,
      groupID: 1
    }
  ],
  //维修线
  [
    {
      x: 12609730.584668012, y: 2634680.204680953,
      groupID: 1
    },
    {
      x: 12609353.564902872, y: 2634639.0095029576,
      groupID: 1
    }
  ],
  /*我的随便demo
  //路径A
  [
    {
      x: 12609660.80118657,
      y: 2634442.1487091887,
      groupID: 1
    },
    {
      x: 12609402.214538816,
      y: 2634455.7488843687,
      groupID: 1
    }
  ],
  //路径B
  [
    {
      x: 12609825.660507778,
      y: 2634623.0528911646,
      groupID: 1
    },
    {
      x: 12609467.82787416,
      y: 2634634.2942902,
      groupID: 1
    }
  ],
  //路径C
  [
    {
      x: 12609660.80118657,
      y: 2634442.1487091887,
      groupID: 1
    },
    {
      x: 12609467.82787416,
      y: 2634634.2942902,
      groupID: 1
    }
  ],
  */
];
//定义全局map变量
var map = null;
//定义路径规划对象
var naviAnalyser = null;
/**
 * 定义点击次数变量
 * 第一次获取起点，第二次获取终点，获取终点之后用户必须再次点击计算路线按钮才能开始拾取新的起点和终点
 * */
var clickCount = 0;
//判断起点是否是同一处坐标
var lastCoord = null;
//起终点坐标
var coords = [];
//定义markert图层数组
var layers = [];
export var naviData = null;
export function createFengmap(data) {
  var fmapID = '1384053067182067713';
  var mapOptions = {
    container: document.getElementById('fengmap'),
    mapServerURL: './fengmap/data/' + fmapID,
    mapThemeURL: './fengmap/data/theme',
    defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
    mapScaleLevelRange: [16, 23],       // 比例尺级别范围， 16级到23级
    // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
    defaultMapScaleLevel: 17,          // 默认比例尺级别设置为19级
    //是否对不聚焦图层启用透明设置 默认为true
    focusAlphaMode: false,
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
  map.on('loadComplete', function () {
    console.log('地图加载完成！');
    /**
     * fengmap.FMNaviAnalyser 是可分析最短路径、最快路径并返回分析结果的路径类
     * https://developer.fengmap.com/docs/js/v2.7.1/fengmap.FMNaviAnalyser.html
     **/
    naviAnalyser = new fengmap.FMNaviAnalyser(map);
    if(data.pathName) {
      drawNaviLine(data.pathName);
    }
  });

  /**
   * 地图点击事件
   * 第一次点击选取为起点，第二次点击选取为终点，再次点击路径规划按钮重新选取起点、终点
   * */
  /*
  map.on('mapClickNode', function (event) {
    if (event.target && event.target.nodeType == fengmap.FMNodeType.MODEL && naviAnalyser) {
      //封装点击坐标，模型中心点坐标
      var coord = {
        x: event.target.mapCoord.x,
        y: event.target.mapCoord.y,
        groupID: event.target ? event.target.groupID : 1
      };
      //第一次点击
      if (clickCount === 0) {
        //记录点击坐标
        lastCoord = coord;
        //设置起点坐标
        coords[0] = coord;

        //添加起点imageMarker
        addMarker(coord, 'start');
      } else if (clickCount === 1) {
        //第二次点击，添加终点并画路线
        //判断起点和终点是否相同
        if (lastCoord.x === coord.x && lastCoord.y === coord.y) {
          return;
        }

        //设置终点坐标
        coords[1] = coord;
        //添加终点imageMarker
        addMarker(coord, 'end');

        //设置完起始点后，调用此方法画出导航线
        drawNaviLine();
      } else {
        //第三次点击，重新开始选点进行路径规划
        //重置路径规划
        resetNaviRoute();

        //记录点击坐标
        lastCoord = coord;
        //设置起点坐标
        coords[0] = coord;
        //添加起点imageMarker
        addMarker(coord, 'start');
      }
      clickCount++;
    }
  });
  */
}

/**
 * 画导航线
 * https://developer.fengmap.com/docs/js/v2.7.1/fengmap.FMNaviAnalyser.html
 * */
export function drawNaviLine(pathName) {
  if(pathName) {
    //重置路径规划
    resetNaviRoute();

    coords = pathCoords[function () {
      switch (pathName) {
        case '走廊':
          return 0;
        case '月检站':
          return 1;
        case '维修线':
          return 2;
        default:
          return 0;
      }
    }()];
    addMarker(coords[0], 'start');
    addMarker(coords[1], 'end');
    clickCount = 2;
  } else {
    console.log(coords);
  }

  //根据已加载的fengmap.FMMap导航分析，判断路径规划是否成功
  var analyzeNaviResult = naviAnalyser.analyzeNavi(coords[0].groupID, coords[0], coords[1].groupID, coords[1],
    fengmap.FMNaviMode.MODULE_SHORTEST);
  if (fengmap.FMRouteCalcuResult.ROUTE_SUCCESS != analyzeNaviResult) {
    return;
  }

  naviData = {
    startPointX: coords[0].x,
    startPointY: coords[0].y,
    endPointX: coords[1].x,
    endPointY: coords[1].y,
    pathPoints: []
  };

  //获取路径分析结果对象，所有路线集合
  var results = naviAnalyser.getNaviResults();

  //初始化线图层
  var line = new fengmap.FMLineMarker();
  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    //楼层id
    var gid = result.groupId;
    //路径线点集合
    var points = result.getPointList();
    for(var j = 0; j < points.length; j++) {
      naviData.pathPoints.push(points[j]);
    }
    var points3d = [];
    points.forEach(function (point) {
      points3d.push({
        //x坐标点
        'x': point.x,
        //y坐标点
        'y': point.y,
        //线标注高度
        'z': 1
      });
    });

    /**
     * fengmap.FMSegment点集，一个点集代表一条折线
     * https://developer.fengmap.com/docs/js/v2.7.1/fengmap.FMSegment.html
     * */
    var seg = new fengmap.FMSegment();
    seg.groupId = gid;
    seg.points = points3d;
    line.addSegment(seg);
  }

  naviData.pathPoints = JSON.stringify(naviData.pathPoints);

  //配置线型、线宽、透明度等
  var lineStyle = {
    //设置线的宽度
    lineWidth: 6,
    //设置线的透明度
    alpha: 0.8,
    //设置线的类型为导航线
    lineType: fengmap.FMLineType.FMARROW,
    //设置线动画,false为动画
    noAnimate: true
  };

  //画线
  map.drawLineMark(line, lineStyle);
}

/**
 * 重置路径规划
 **/
function resetNaviRoute() {
  //清空导航线
  clearNaviLine();
  //清空起点、终点marker
  deleteMarker();
  //重置地图点击次数
  clickCount = 0;
  //重置上一次点击坐标对象
  lastCoord = null;
}

/**
 * 清空导航线
 * */
function clearNaviLine() {
  //清空导航数据
  naviData = null;
  //清空导航线
  map.clearLineMark();
}

/**
 * 添加起点终点marker
 * coord: 模型中心点坐标
 * type: start-起点坐标， end-终点坐标
 * */
function addMarker(coord, type) {
  //获取目标点层
  var group = map.getFMGroup(coord.groupID);
  //创建marker，返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
  var layer = group.getOrCreateLayer('imageMarker');
  //判断该楼层layer是否存在，清除marker时需要将所有楼层marker都清除
  let isExistLayer = layers.some(function (item, index, array) {
    return item.groupID === coord.groupID;
  });
  if (!isExistLayer) {
    layers.push(layer);
  }
  var markerUrl = '';
  if (type === 'start') {
    markerUrl = './fengmap/images/start.png';
  } else {
    markerUrl = './fengmap/images/end.png';
  }
  //图标标注对象，默认位置为该楼层中心点
  var im = new fengmap.FMImageMarker({
    x: coord.x,
    y: coord.y,
    //设置图片路径
    url: markerUrl,
    //设置图片显示尺寸
    size: 32,
    //marker标注高度
    height: 2
  });
  //添加imageMarker
  layer.addMarker(im);
}

/**
 * 清空图片marker事件
 * */
function deleteMarker() {
  //删除layer上所有Marker
  layers.forEach(function (layer, index) {
    if (layer) {
      layer.removeAll();
    }
  });
}
