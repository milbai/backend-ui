import fengmap from 'fengmap';
var map;

export function createFengmap() {
  var fmapID = '1384053067182067713';
  var mapOptions = {
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
  map = new fengmap.FMMap(mapOptions);
  map.openMapById(fmapID, function (error) {
    console.log(error);
  });
  map.on('loadComplete', function () {
    console.log('地图加载完成！');
  });
}

export function updateMarkers(data) {
  var group = map.getFMGroup(map.focusGroupID);
  var layer = group.getOrCreateLayer('imageMarker');
  layer.removeAll();
  layer.addMarker(new fengmap.FMImageMarker({
    x: parseFloat(data.longitude),
    y: parseFloat(data.latitude),
    url: './fengmap/images/' + data.productId + '.png',
    //设置图片显示尺寸
    size: 32,
    //标注高度，大于model的高度
    height: 4
  }));
}
