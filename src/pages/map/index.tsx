import * as React from 'react';
import fengmap from 'fengmap';
import styles from './css/index.css';
import {_update, stopUpdateLocation, updateLocation} from "@/pages/location/fence/js/locSDK";
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
var map = null;
//定义地图ID变量
var fmapID = '1356807379731935234';
//定义地图是否加载完成变量
var loadComplete = false;

var layer = null;
var rectangleMarker = null;
var circleMaker = null;

//定义定位点marker
var locationMarker;

//运行刷新，重置locationMarker
if (locationMarker) {
  locationMarker = null;
}

if (_update) {
  stopUpdateLocation();
}

var current_selected;

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

  /**
   * 打开地图
   * */
  openMap = () => {
    /**
     * 初始化参数，默认使用在线数据，从蜂鸟视图数据服务器加载模型数据
     * https://developer.fengmap.com/docs/js/v2.7.1/fengmap.FMMap.html
     **/
    var mapOptions = {
      //必要，地图容器
      container: this.mapNode,
      //默认主题名称
      defaultThemeName: '3b91d03288204d02368dd4f68fc1f189',
      //必要，地图应用名称，通过蜂鸟云后台创建
      //appName: '蜂鸟研发SDK_2_0',
      //必要，地图应用密钥，通过蜂鸟云后台获取
      //key: '57c7f309aca507497d028a9c00207cf8'
      mapScaleLevelRange: [16, 23],       // 比例尺级别范围， 16级到23级
      // mapScaleRange: [200, 4000]      // 自定义比例尺范围，单位（厘米）
      defaultMapScaleLevel: 18,          // 默认比例尺级别设置为19级
      appName: 'TestSubway',
      key: 'df8d1ac1bada373505fcb0ce2a84b011'
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
      addPolygonMarker();
      document.getElementById('btnsGroup').style.display = 'block';

      addImageMarker1();
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
          document.getElementById('fence_name').innerHTML = '电子围栏00２';
          current_selected = circleMaker;
          break;
        default:
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
    function addPolygonMarker() {
      //获取当前聚焦楼层
      var group = map.getFMGroup(map.focusGroupID);
      //返回当前层中第一个polygonMarker,如果没有，则自动创建
      layer = group.getOrCreateLayer('polygonMarker');

      //创建矩形标注
      createRectangleMaker();
      layer.addMarker(rectangleMarker);

      //创建圆形标注
      // createCircleMaker();
      // layer.addMarker(circleMaker);
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
        height: 5,
        //多边形的坐标点集数组
        points: {
          //设置为矩形
          type: 'rectangle',
          //设置此形状的中心坐标
          center: {
            x:12624571.907404978,
            y:2622858.668323242
          },
          //矩形的起始点设置，代表矩形的左上角。优先级大于center。
          /*startPoint: {
           x: 1.2961583E7,
           y: 4861865.0
           },*/
          //设置矩形的宽度
          width: 200,
          //设置矩形的高度
          height: 420
        }
      });
      rectangleMarker.color_checked = true;
    }

    function addImageMarker1() {

      layer = group.getOrCreateLayer('imageMarker');

      //图标标注对象，默认位置为该楼层中心点
      var gpos = group.mapCoord;
      let im = new fengmap.FMImageMarker({
        x: map.center.x + 1 * Math.random() * 200,
        y: map.center.y + 1 * Math.random() * 200,
        //设置图片路径
        url: require('./images/camera.jpg'),
        //设置图片显示尺寸
        size: 32,
        //标注高度，大于model的高度
        height: 4
      });

      layer.addMarker(im);
      im.show
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

  addImageMarker = () => {
    //获取当前聚焦楼层
    var group = map.getFMGroup(map.focusGroupID);

    /*//实例化方法1：自定义图片标注层
     layer = new fengmap.FMImageMarkerLayer();
     //添加图片标注层到模型层
     group.addLayer(layer);*/

    //实例化方法2：
    //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
    layer = group.getOrCreateLayer('imageMarker');

    //图标标注对象，默认位置为该楼层中心点
    var gpos = group.mapCoord;
    let im = new fengmap.FMImageMarker({
        x: map.center.x + 1 * Math.random() * 100,
			  y: map.center.y + 1 * Math.random() * 100,
        //设置图片路径
        url: require('./images/alarm.gif'),
        //设置图片显示尺寸
        size: 32,
        //标注高度，大于model的高度
        height: 4
    });

    /**
     * imageMarker添加自定义属性
     **/
    im.selfAttr = '自定义属性selfAttr';

    layer.addMarker(im);
}

  render() {
    return <div>
      <div className={styles.mapout}>
        <div className={styles.fengMap} ref={(c) => this.mapNode = c}></div>

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

        <div id="btnsGroup" className = {styles.btnsGroup}>
          <button onClick={() => this.addWarningMarker()}>模拟报警</button>
	      </div>

      </div>
    </div>
  }
}
