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
//定义主题切换变量
var toggleFlag = false;
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

      //显示按钮
      document.getElementById('btnsGroup').style.display = 'block';
      document.getElementById('handleGroup').style.display = 'block';
    });
  }
  /**
   * 释放地图按钮事件
   * */
  disposeMap = () => {
    if (loadComplete) {
      //释放地图
      if (map !== null) {
        //释放地图资源
        map.dispose();
        //重置地图对象
        map = null;
        //更新按钮状态
        loadComplete = false;
        //重置check状态
        this.resetCheckFunc();
        toggleFlag = false;
        document.getElementById('handleGroup').style.display = 'none';
        console.log('地图已释放！');
      }
    } else {
      //重新加载地图
      if (isLoading) {
        return;
      }
      isLoading = true;
      this.openMap();
      console.log('地图重新加载！');
    }
  }
  /**
   * 地图手势操作控制
   * gestureEnableController 控制模型能否旋转、倾斜、缩放、点击、移动等操作
   */
  handleFunc = (obj) => {
    if (!map) return;
    //获取控制类型参数
    var contorType = obj.value;
    if (obj.checked === true) {
      map.gestureEnableController[contorType] = false;
    } else {
      map.gestureEnableController[contorType] = true;
    }
  }
  /**
   * 切换地图主题
   */
  toggleTheme = () => {
    if (!map) return;
    //修改主题属性
    if (!toggleFlag) {
      map.themeName = '2002';
      toggleFlag = true;
    } else {
      map.themeName = '3b91d03288204d02368dd4f68fc1f189';
      toggleFlag = false;
    }
  }
  /**
   * 重置复选框选中状态
   **/
  resetCheckFunc = () => {
    var checkBoxsDom = document.getElementsByTagName('input');
    for (var i = 0; i < checkBoxsDom.length; i++) {
      var item = checkBoxsDom[i];
      if (item.type === 'checkbox' && item.checked === true) {
        item.checked = false;
      }
    }
  }

  render() {
    return <div>
      <div className={styles.mapout}>
        <div className={styles.fengMap} ref={(c) => this.mapNode = c}></div>

        <div id="btnsGroup" className={styles.flexBtnsGroup}>
          <button id="btn" onClick={() => this.disposeMap()}>释放/重新加载地图</button>
          <button id="toggleBtn" onClick={() => this.toggleTheme()}>切换主题</button>
        </div>

        <div id="handleGroup" className={styles.handleGroup}>
          <p><input type="checkbox" name="handleBox" value="enableMapPan" onClick={(e) => this.handleFunc(e.currentTarget)} />禁用平移地图</p>
          <p><input type="checkbox" name="handleBox" value="enableMapPinch" onClick={(e) => this.handleFunc(e.currentTarget)} />禁用缩放地图</p>
          <p><input type="checkbox" name="handleBox" value="enableMapRotate" onClick={(e) => this.handleFunc(e.currentTarget)} />禁用旋转地图</p>
          <p><input type="checkbox" name="handleBox" value="enableMapIncline" onClick={(e) => this.handleFunc(e.currentTarget)} />禁用倾斜地图</p>
        </div>
      </div>
    </div>
  }
}
