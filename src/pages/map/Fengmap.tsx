import * as React from 'react';
import fengmap from 'fengmap';
import styles from './css/index.css';
import { Divider } from "antd";
var subwayStation = 1;

interface  MapDemoState {
}
interface MapDemoProps {
  data: any
}

export default class Fengmap extends React.Component<MapDemoProps,MapDemoState>{
  mapNode : HTMLDivElement
  constructor(props: MallZoomProps) {
    super(props)
    this.state = {
      current_selected: {}
    }
  }
  componentDidMount() {
    this.openMap();
  }
  componentWillUnmount() {
  }

  openMap = () => {
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

    var map = new fengmap.FMMap(mapOptions);
    map.openMapById(fmapID, function (error: any) {
      console.log(error);
    });
    map.on('loadComplete', function () {
      console.log('地图加载完成！');
      const fenceCoords = [
        //月检线
        [
          // { x: 12609343.487486389, y: 2634680.7467382923, z: 56 },
          // { x: 12609339.252967019, y: 2634651.1668030284, z: 56 },
          { x: 12609363.487486389, y: 2634680.7467382923, z: 56 },
          { x: 12609359.252967019, y: 2634651.1668030284, z: 56 },
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
        if(that.props.data[i]) {
          addPolygonMarker(fenceCoords[i], i);
        }
      }
    });

    var that = this;
    map.on('mapClickNode', function (event) {
      console.log(event);
      var nodeType = event.nodeType;
      var target = event.target;
      if(!nodeType || !target || nodeType != 36) {
        document.getElementById('fence_modal').style.display = 'none';
        return;
      }
      that.setState({
        current_selected: that.props.data[target.index]
      });
      document.getElementById('fence_modal').style.display = 'block';
    });

    function addPolygonMarker(coords: any, index: any) {
      var group = map.getFMGroup(map.focusGroupID);
      var layer = group.getOrCreateLayer('polygonMarker');
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
  };

  render() {
    return <div>
      <div className={styles.mapout}>
        <div className={styles.fengMap} ref={(c) => this.mapNode = c}></div>
        <div className={styles.mapmask}></div>

        <div id="fence_modal" className={styles.fenceModal}>
          名称<span className={styles.vRight}>{this.state.current_selected.name}</span>
          <Divider className={styles.fengge} />
          区域<span className={styles.vRight}>{this.state.current_selected.area}</span>
          <Divider className={styles.fengge} />
          开始时间<span className={styles.vRight}>{this.state.current_selected.begin}</span>
          <Divider className={styles.fengge} />
          结束时间<span className={styles.vRight}>{this.state.current_selected.end}</span>
          <Divider className={styles.fengge} />
          离开报警<span className={styles.vRight}>{this.state.current_selected.outsideAlarm}</span>
          <Divider className={styles.fengge} />
          离开超时<span className={styles.vRight}>{this.state.current_selected.outsideTimeout}</span>
          <Divider className={styles.fengge} />
          未进入报警<span className={styles.vRight}>{this.state.current_selected.insideAlarm}</span>
          <Divider className={styles.fengge} />
          进入超时<span className={styles.vRight}>{this.state.current_selected.insideTimeout}</span>
          <Divider className={styles.fengge} />
          可进入员工<span className={styles.vRight}>{this.state.current_selected.employees}</span>
        </div>
      </div>
    </div>
  }
}
