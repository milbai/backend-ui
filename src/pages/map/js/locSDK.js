/**
 * 这是一个模拟的定位sdk，用来定期返回位置更新,仅用作参考。
 * */
var _mockdata = [
  {x:12619619.5302 + 5052,y:2621837.57344 + 1121,angle:-18.7316},
  {x:12619621.8002 + 5052,y:2621844.3059 + 1121,angle:70.5842},
  {x:12619618.4709 + 5052,y:2621845.486 + 1121,angle:70.5842},
  {x:12619613.8585 + 5052,y:2621847.1211 + 1121,angle:70.5843},
  {x:12619609.5198 + 5052,y:2621848.65904 + 1121,angle:70.5843},
  {x:12619605.7921 + 5052,y:2621849.9804 + 1121,angle:70.5843},
  {x:12619601.4842 + 5052,y:2621851.5075 + 1121,angle:-19.6214},
  {x:12619602.78 + 5052,y:2621855.16286 + 1121,angle:-19.6214},
  {x:12619604.1663 + 5052,y:2621859.07372 + 1121,angle:-19.6214},
  {x:12619605.6941 + 5052,y:2621863.38373 + 1121,angle:-19.6214},
  {x:12619607.4449 + 5052,y:2621868.32275 + 1121,angle:-19.6214},
  {x:12619608.8883 + 5052,y:2621872.3947 + 1121,angle:-19.6214},
  {x:12619610.6506 + 5052,y:2621877.3664 + 1121,angle:69.5213},
  {x:12619606.0665 + 5052,y:2621879.0882 + 1121,angle:69.5213}
];
var _callback;
export var _update;
var _updateInternal;
var _freq = 800;
var _index = 0;

/**
 * 模拟更新位置，按照时间间隔更新位置信息。
 * @param {*} 回调函数
 */
export function updateLocation(cb) {
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

/**
 * 停止位置更新
 */
export function stopUpdateLocation() {
  clearInterval(_update);
  console.log('update stoped.');
}



