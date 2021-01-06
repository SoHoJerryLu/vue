<template>
  <div class="box">
    <div class="left">
      <div>
        <button @click="restoreMap">复位地图</button>
        <button id="draw" @click="drawFence">绘制围栏</button>
      </div>
      <el-tree
        ref="tree"
        :data="locData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        class="cityTree"
      >
      </el-tree>
    </div>
    <div id="map" ref="rootmap">
    </div>
  </div>
  <!-- <offline-map></offline-map> -->
</template>

<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Icon from 'ol/style/Icon'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Feature from 'ol/Feature'
import XYZ from 'ol/source/XYZ'
import Vector from 'ol/source/Vector'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import HeatmapLayer from 'ol/layer/Heatmap'
import Polygon from 'ol/geom/Polygon'
import Draw from 'ol/interaction/Draw'
import { createBox } from 'ol/interaction/Draw'

import data from '../../../static/Location/location.json'

export default {
  props: {
    mapPointList: {
      type: Array,
      default: function() {
        return [[117.031637,36.676403],[117.033637,36.676403],[117.035637,36.676403],[117.026637,36.676403]]
      }
    }
  },
  data() {
    return {
      appointLocation: [117.031637,36.676403],
      locData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      mysvg: null, // 锚点图像
      map: null, // 地图层
      heatLayer: null, // 热力图层
      // trailLayer: null, // 轨迹图层
      fenceLayer: null, // 围栏图层
      interactionDraw: null // 围栏绘图交互类
    }
  },
  mounted() {
    this.locData = data;
    this.init()
  },
  methods: {
    init() {
      const that = this
      // -------------------锚点svn图像-------------------------------
      this.mysvg = new Image()
      const svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="30px" height="30px" viewBox="0 0 30 30" enable-background="new 0 0 30 30" xml:space="preserve">' +
                  '<path fill="#156BB1" d="M22.906,10.438c0,4.367-6.281,14.312-7.906,17.031c-1.719-2.75-7.906-12.665-7.906-17.031S10.634,2.531,15,2.531S22.906,6.071,22.906,10.438z"/>' +
                    '<circle fill="#FFFFFF" cx="15" cy="10.677" r="3.291"/></svg>'
      this.mysvg.src = 'data:image/svg+xml,' + escape(svg)
      // -------------------------------------------------------------

      // -------------------初始化地图层-------------------------------
      const offlineSource = new XYZ({
        // url: '../../../static/Tiles/{z}/{x}/{y}.png' // 离线图片
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png' // 在线图片
      })

      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: offlineSource
          })
        ],
        view: new View({
          projection: 'EPSG:4326', // 使用这个坐标系
          center: this.appointLocation,
          zoom: 16
        })
      })
      // -------------------------------------------------------------

      // -------------------初始化热力图层-----------------------------
      this.heatLayer = new HeatmapLayer({
        source: new Vector(),
        blur: 20, // 模糊尺寸
        radius: 20 // 热点半径
      })
      this.map.addLayer(this.heatLayer)
      // -------------------------------------------------------------

      // -------------------初始化轨迹图层-----------------------------
      this.trailLayer = new VectorLayer({
        source: new Vector()
      })
      this.map.addLayer(this.trailLayer)
      // -------------------------------------------------------------

      // -------------------初始化围栏图层-----------------------------
      this.fenceLayer = new VectorLayer({
        source: new Vector(),
        style: new Style({
          stroke: new Stroke({
            color: 'red',
            width: 5
          })
        })
      })
      this.map.addLayer(this.fenceLayer)

      // 添加绘图交互类
      this.interactionDraw = new Draw({
        type: 'Circle',
        source: this.fenceLayer.getSource(),
        maxPoints: 2,
        freehand: false,
        geometryFunction: createBox()
      })
      // 绘图交互类事件: 开始绘图，保证只有一个图，再次绘制图形会清除之前的图
      this.interactionDraw.on('drawstart', function(e) {
        that.fenceLayer.getSource().clear()
      }
      )
      // 绘图交互类事件: 结束绘图，获取所有边界点
      this.interactionDraw.on('drawend', function(e) {
        const rawArray = e.feature.values_.geometry.orientedFlatCoordinates_
        const results = []
        for (let i = 0; i < rawArray.length / 2 - 1; i++) {
          results.push([rawArray[i], rawArray[i + 1]])
        }
        console.log(results)
      })
      // -------------------------------------------------------------

      this.drawTrail(that.mapPointList);
    },

    // 功能: 绘制轨迹
    drawTrail(mapPointList) {
      const that = this;
      // 清除轨迹图层的轨迹
      this.trailLayer.getSource().clear();
      // 复位地图，地图中心点设为轨迹点第一个点的位置
      that.map.getView().setCenter(mapPointList.length == 0 || mapPointList == null ? [117.031637, 36.676403] : mapPointList[0]);

      // 热力点
      for (let i = 0; i < mapPointList.length; i++) {
        const anchor = new Feature({
          geometry: new Point(mapPointList[i])
        })
        // anchor.setStyle(new Style({
        //   image: new Icon({
        //     img: that.mysvg, // 设置Image对象
        //     imgSize: [30, 30] // 及图标大小
        //   })
        // }))
        this.heatLayer.getSource().addFeature(anchor)
      }
      // 点
      for (let i = 0; i < mapPointList.length; i++) {
        const anchor = new Feature({
          geometry: new Point(mapPointList[i])
        })
        anchor.setStyle(new Style({
          image: new Icon({
            img: that.mysvg, // 设置Image对象
            imgSize: [30, 30] // 及图标大小
          })
        }))
        this.trailLayer.getSource().addFeature(anchor)
      }
      // 线
      var line = new Feature({
        geometry: new LineString(mapPointList)
      })
      line.setStyle(new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        })
      }))
      this.trailLayer.getSource().addFeature(line)
    },

    locFormat(locArray) {
      return [Number(locArray[0]), Number(locArray[1])];
    },

    // 功能: 地图复位
    restoreMap() {
      this.map.getView().setCenter(this.appointLocation);
    },

    // 功能: 开启围栏绘制
    drawFence() {
      const that = this
      const draw_dom = document.getElementById('draw')

      if (draw_dom.innerText == '取消绘制') {
        draw_dom.innerText = '绘制地图'
        that.map.removeInteraction(this.interactionDraw)
      } else {
        draw_dom.innerText = '取消绘制'
        that.map.addInteraction(this.interactionDraw)
      }
    },

    // 树组件点击事件
    handleNodeClick(data) {
      if (data.center.split(',').length > 1) {
        this.appointLocation = this.locFormat(data.center.split(','));
        this.map.getView().setCenter(this.appointLocation);
      }
    }
  }
}
</script>

<style>
/*隐藏ol的一些自带元素*/
.ol-attribution,.ol-zoom { display: none;}
.box {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}
.left {
  display: flex;
  flex-direction: column;
}
.cityTree {
  height: 100%;
  width: 100%;
  overflow: scroll;
}
#map{
  height:100%;
  width:100%;
}
</style>
