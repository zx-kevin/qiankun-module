/*
 * @Author: K
 * @Date: 2023-02-22 11:24:53
 * @Descripttion: 决策流组件 - 画布配置
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\config\default.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-14 11:41:31
 */
export const default_config = {
  autoResize: true,
  background: {
    color: '#f5f6f9',
  },
  //  画布平移
  panning: {
    enabled: true,
    modifiers: 'ctrl',
  },
  interacting: {
    nodeMovable: false,
  },
  //  背景网格
  grid: {
    visible: true,
    type: 'doubleMesh',
    args: [
      {
        color: '#eee', // 主网格线颜色
        thickness: 1, // 主网格线宽度
      },
      {
        color: '#ddd', // 次网格线颜色
        thickness: 1, // 次网格线宽度
        factor: 4, // 主次网格线间隔
      },
    ],
  },
  //  键鼠操作
  mousewheel: {
    enabled: true,
    modifiers: ['ctrl'],
  },
  //  连线配置
  connecting: {
    connectionPoint: {
      name: 'bbox',
      args: {
        sticky: true,
      },
    },
    router: {
      name: 'normal',
      args: {},
    },
    connector: {
      name: 'smooth',
      args: {
        direction: 'H',
      },
    },
    allowBlank: false,
    allowNode: false,
    highlight: true,
    createEdge() {
      return this.createEdge({
        attrs: {
          line: {
            stroke: '#8f8f8f',
            strokeWidth: 1,
          },
        },
      });
    },
    //  判断新增边
    validateMagnet({ magnet }) {
      // return magnet.getAttribute('port-group') !== 'top'
      return true;
    },
    //  判断连接是否有效
    validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet }) {
      // // 不能连接自身
      // if (sourceCell === targetCell) return false

      // // 不能重复连线
      // const edges = this.getEdges()
      // const portId = targetMagnet.getAttribute('port')
      // if (edges.find((edge) => edge.getTargetPortId() === portId)) {
      //   return false
      // }

      return true;
    },
  },
  //  高亮样式
  highlighting: {
    nodeAvailable: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#fff',
          stroke: '#31d0c6',
          strokeWidth: 4,
        },
      },
    },
    // 连接桩可以被连接时在连接桩外围围渲染一个包围框
    magnetAvailable: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#fff',
          stroke: '#31d0c6',
          strokeWidth: 4,
        },
      },
    },
    // 连接桩吸附连线时在连接桩外围围渲染一个包围框
    magnetAdsorbed: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#fff',
          stroke: '#31d0c6',
          strokeWidth: 4,
        },
      },
    },
  },
};
