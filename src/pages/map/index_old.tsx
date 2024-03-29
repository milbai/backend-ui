import * as React from 'react';
import fengmap from 'fengmap';
import styles from './css/index.css';
import {_update, stopUpdateLocation, updateLocation} from "@/pages/map/js/locSDK";
import { Divider, Switch, InputNumber, DatePicker, Select } from "antd";
const { RangePicker } = DatePicker;
const { Option } = Select;
const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

interface  MapDemoState {
}
interface MapDemoProps {
}

//定义全局map变量
var map: any = null;
//定义地图ID变量
//var fmapID = '1384053067182067713'; // 陈头岗
var fmapID = '1397382550647533570'; // 万顷沙
//定义地图是否加载完成变量
var loadComplete = false;

var layer = null;
var rectangleMarker: any = null;
var circleMaker: any = null;
var polygonMarker: any = null;

//定义定位点marker
var locationMarker: any;

//运行刷新，重置locationMarker
if (locationMarker) {
  locationMarker = null;
}

if (_update) {
  stopUpdateLocation();
}

var current_selected: any = null;

//电子围栏-月检线
var coordsMonth = [
  { x: 12609343.487486389, y: 2634680.7467382923, z: 56 },
  { x: 12609339.252967019, y: 2634651.1668030284, z: 56 },
  { x: 12609706.621351019, y: 2634652.1526199896, z: 56 },
  { x: 12609706.650074564, y: 2634681.1130687636,  z: 56 },
];

//电子围栏-日检线A区
var coordsDailyA = [
  { x: 12609242.913614508, y: 2634621.3513399083, z: 56 },
  { x: 12609239.662802674, y: 2634466.6577441064, z: 56 },
  { x: 12609613.856840886, y: 2634465.754081998, z: 56 },
  { x: 12609613.544191122, y: 2634621.7920239493, z: 56 },
];

//电子围栏-日检线B区
var coordsDailyB = [
  { x: 12609647.203478605, y: 2634622.74148204, z: 56 },
  { x: 12609645.15114645, y: 2634464.339464341, z: 56 },
  { x: 12609998.237355687, y: 2634466.8285023263, z: 56 },
  { x: 12610002.36026345, y: 2634620.025391266, z: 56 },
];

//电子围栏-维修线
var coordsMaintain = [
  { x: 12609257.503689926, y: 2634651.916090568, z: 56 },
  { x: 12609258.790374342, y: 2634636.405447829, z: 56 },
  { x: 12609707.527558396, y: 2634634.2928042985, z: 56 },
  { x: 12609706.033594407, y: 2634652.290200657, z: 56 },
];

export default class Map extends React.Component<MapDemoProps,MapDemoState>{
  mapNode : HTMLDivElement
  constructor(props: MallZoomProps) {
    super(props)
    this.state = {
      color_checked: true
    }
  }
  componentDidMount() {
    this.openMap();
  }
  componentWillUnmount() {
  }

  openMap = () => {
    var mapOptions = {
      container: this.mapNode,
      mapServerURL: './fengmap/data/' + fmapID,
      mapThemeURL: './fengmap/data/theme',
      defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
      mapScaleLevelRange: [16, 23],       // 比例尺级别范围， 16级到23级
      // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
      defaultMapScaleLevel: 17,          // 默认比例尺级别设置为19级
      appName: '陈头岗地铁停车场',
      key: '40308d481d2d806bcd2e5fb346c2dc45',
    };

    //初始化地图对象
    map = new fengmap.FMMap(mapOptions);

    //打开Fengmap服务器的地图数据和主题
    map.openMapById(fmapID, function (error) {
      //打印错误信息
      console.log(error);
    });

    //地图加载完成事件
    map.on('loadComplete', function () {

      //修改地图加载状态
      loadComplete = true;
      console.log('地图加载完成！');
      addPolygonMarker(coordsMonth);
      addPolygonMarker(coordsMaintain);

      addPolygonMarker(coordsDailyA);
      addPolygonMarker(coordsDailyB);
      //document.getElementById('btnsGroup').style.display = 'block';

      // //接驳站-视频
      // addImageMarker(12624580.356833097, 2622714.4953265693+30, require('./images/camera.png'));

      // //事故油田-视频
      // addImageMarker(12624526.260180058, 2623051.4631302427 + 30, require('./images/camera.png'));

      // //供电房-视频
      // addImageMarker(12624517.518862803, 2622865.8147207727 + 30, require('./images/camera.png'));
      // addImageMarker(12624517.518862803 + 100, 2622865.8147207727 + 30, require('./images/camera.png'));

      // addImageMarker(12624603.225404195, 2623086.2421856797 + 30, require('./images/smoker.png'));
      // addImageMarker(12624603.225404195 - 50, 2623086.2421856797 + 30, require('./images/smoker.png'));

      // //远转站-广播
      // addImageMarker(12624872.825635102, 2623137.587430931 + 30, require('./images/broadcast.png'));

    });

    var that = this;
    //地图点击事件，需要在地图加载完成之后操作
    map.on('mapClickNode', function (event) {
      console.log(event);
      var nodeType = event.nodeType;
      var target = event.target;
      if(!nodeType || !target || nodeType != 36) {
        document.getElementById('fence_modal').style.display = 'none';
        return;
      }

      switch (target._points.type) {
        case "rectangle":
          document.getElementById('fence_name').innerHTML = '电子围栏001';
          current_selected = rectangleMarker;
          break;
        case "circle":
          document.getElementById('fence_name').innerHTML = '电子围栏002';
          current_selected = circleMaker;
          break;
        default:
          document.getElementById('fence_name').innerHTML = '电子围栏003';
          current_selected = polygonMarker;
          break;
      }
      setColorState(current_selected.color_checked);
      document.getElementById('fence_modal').style.display = 'block';
    });

    function setColorState(v) {
      that.setColorState(v);
    }

    /**
     * 为第一层的模型添加多边形标注图层
     * */
    function addPolygonMarker(coords: any) {
      //获取当前聚焦楼层
      var group = map.getFMGroup(map.focusGroupID);
      //返回当前层中第一个polygonMarker,如果没有，则自动创建
      layer = group.getOrCreateLayer('polygonMarker');

      createPolygon(coords);
      layer.addMarker(polygonMarker);
    }

    function createPolygon(coords: any) {
      //创建自定义多边形形状PolygonMarker所需的顶点数组

      polygonMarker = new fengmap.FMPolygonMarker({
        alpha: .8,             //设置透明度
        color: '#CD5A5A',
        lineWidth: 0,      //设置边框线的宽度
        height: 6,    //设置高度*/
        points: coords //多边形坐标点
      });

      polygonMarker.color_checked = true;
    }

    /**
     * 创建矩形标注
     * fengmap.FMPolygonMarker 自定义图片标注对象
     * https://developer.fengmap.com/docs/js/v2.7.1/fengmap.FMPolygonMarker.html
     */
    function createRectangleMaker() {
      rectangleMarker = new fengmap.FMPolygonMarker({
        //设置颜色
        color: '#CD5A5A',
        //设置透明度
        alpha: 0.8,
        //设置边框线的宽度
        lineWidth: 0,
        //设置高度
        height: 0,
        //多边形的坐标点集数组
        points: {
          //设置为矩形
          type: 'rectangle',
          //设置此形状的中心坐标
          // center: {
          //   x:12624571.907404978,
          //   y:2622858.668323242
          // },
          //矩形的起始点设置，代表矩形的左上角。优先级大于center。
          startPoint: {
           x: 12624628.96063348,
           y: 2623049.229235602
           },
           offSet: {
             x: -80,
             y: 0
           },
          //设置矩形的宽度
          width: 100,
          //设置矩形的高度
          height: 60
        }
      });
      rectangleMarker.color_checked = true;
    }
    function addImageMarker(p_x: number, p_y: number, image_str: any) {

      var group = map.getFMGroup(map.focusGroupID)
      var layer = group.getOrCreateLayer('imageMarker');

      //图标标注对象，默认位置为该楼层中心点
      let im = new fengmap.FMImageMarker({
        // x: 12624580.356833097,
        // y: 2622714.4953265693,
        x: p_x,
        y: p_y,
        //设置图片路径
        // url: require('./images/camera.png'),
        url: image_str,
        //设置图片显示尺寸
        size: 32,
        //标注高度，大于model的高度
        height: 4
      });

      layer.addMarker(im);
    }
    /**
     * 创建圆形标注
     * */
    function createCircleMaker() {
      circleMaker = new fengmap.FMPolygonMarker({
        //设置颜色
        color: '#CD5A5A',
        //设置透明度
        alpha: .8,
        //设置边框线的宽度
        lineWidth: 0,
        //设置高度
        height: 6,
        //多边形的坐标点集数组
        points: {
          //设置为圆形
          type: 'circle',
          //设置此形状的中心坐标
          center: {
            x:12624571.907404978,
            y:2623058.668323242
          },
          //设置半径
          radius: 50,
          //设置段数，默认为40段
          segments: 40
        }
      });
      circleMaker.color_checked = true;
    }

    /**
     * 这个方法是示例的定位sdk回调，实际根据使用的定位sdk不同，接口名称和方式可能会有差异
     * */
    updateLocation(function (data) {
      if (loadComplete) {
        if (!locationMarker) {
          /**
           * fengmap.FMLocationMarker 自定义图片标注对象，为自定义图层
           * https://developer.fengmap.com/docs/js/v2.7.1/fengmap.FMLocationMarker.html
           */
          locationMarker = new fengmap.FMLocationMarker({
            //x坐标值
            x: data.x,
            //y坐标值
            y: data.y,
            //图片地址
            //url: './images/location2.png',
            url: require('./images/location.png'),
            //楼层id
            groupID: 1,
            //图片尺寸
            size: 48,
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
          //旋转locationMarker
          locationMarker.rotateTo({
            to: data.angle,
            duration: 1
          });
          //移动locationMarker
          locationMarker.moveTo({
            x: data.x,
            y: data.y,
            groupID: 1
          });
        }
      }
    });
  }

  setFence = (b) => {
    if(b) {
      current_selected.color_checked = true;
      this.setColorState(true);
      current_selected.setColor('#CD5A5A', "0.8");
    } else {
      current_selected.color_checked = false;
      this.setColorState(true);
      current_selected.setColor("#3CB371", "0.8");
    }
  }

  setColorState = (v) => {
    this.setState({
      color_checked: current_selected.color_checked
    });
  }

  addWarningMarker = () => {
    var domMarker = new fengmap.FMDomMarker({
      // x: 12624580.356833097,
      // y: 2622714.4953265693,
      x: map.center.x + 1 * Math.random() * 150,
			y: map.center.y + 1 * Math.random() * 150,
      height: 5,
      domWidth: '30',
      domHeight: '30',
      domContent: '<div class="'+styles.domContainer+'"><div class="'+styles.dot+'"></div><div class="'+styles.pulse+'"></div><div class="'+styles.pulseBig+'"></div></div>',
      anchor: fengmap.FMMarkerAnchor.BOTTOM
    });

    let dmLayer = map.getFMGroup(map.focusGroupID).getOrCreateLayer('domMarker');
    dmLayer.addMarker(domMarker);

    console.log('add warning marker');
  }

  render() {
    return <div>
      <div className={styles.mapout}>
        <div className={styles.fengMap} ref={(c) => this.mapNode = c}></div>

        <div className={styles.mapmask}></div>

        <div id="fence_modal" className={styles.fenceModal}>
          电子围栏
          <Divider className={styles.fengge} />
          名称<span id="fence_name" className={styles.vRight}></span>
          <Divider className={styles.fengge} />
          开关<Switch className={styles.vRight} checked={this.state.color_checked} onChange={(b) => this.setFence(b)} />
          <Divider className={styles.fengge} />
          有效期<RangePicker size="small" className={styles.vRightD} />
          <Divider className={styles.fengge} />
          允许进入人员<Select
          mode="multiple"
          allowClear
          style={{ width: '160px', float: 'right' }}
          placeholder="Please select"
          defaultValue={['王小刚']}
        >
          {children}
        </Select>
          <Divider className={styles.fengge} />
          未进入警告<Switch className={styles.vRight} defaultChecked />
          <Divider className={styles.fengge} />
          超时设置<span className={styles.vRight}> 分钟</span><InputNumber size="small" className={styles.vRight} min={1} max={60} defaultValue={15} />
        </div>

        {/* <div id="btnsGroup" className = {styles.btnsGroup}>
          <button onClick={() => this.addWarningMarker()}>模拟报警</button>
	      </div> */}

      </div>
    </div>
  }
}
