import * as React from 'react';
import fengmap from 'fengmap';
import styles from './css/index.css';

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
//地图是否正在加载中
var isLoading = false;

export default class Map extends React.Component<MapDemoProps,MapDemoState>{
  mapNode : HTMLDivElement
  constructor(props: MallZoomProps) {
    super(props)
    this.state = {
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
      isLoading = false;
      console.log('地图加载完成！');

    });
  }

  render() {
    return <div>
      <div className={styles.mapout}>
        <div className={styles.fengMap} ref={(c) => this.mapNode = c}></div>

      </div>
    </div>
  }
}
