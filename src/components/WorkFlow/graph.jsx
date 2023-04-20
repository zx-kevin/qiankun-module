/*
 * @Author: K
 * @Date: 2023-02-22 09:08:34
 * @Descripttion: 决策流组件
 * @FilePath: \decision_engine_ui\src\components\WorkFlowNew\graph.jsx
 * @LastEditors: K
 * @LastEditTime: 2023-03-22 16:06:30
 */
import { Graph as X6Graph } from '@antv/x6';
import { defineComponent, Fragment, onMounted, provide, inject } from 'vue';
import { getDict, getDictSync } from '@/utils/dict';

import {
  getLibFeatureOptionsApi, //  查询特征库选择框选项
} from '@/api/module/feature';

import * as Config from './config/index';
import Loader from './loader/index';

import Funs from './funs';

export const contextSymbol = String(Symbol('x6ContextSymbol'));
export const useGraphInstance = () => inject(contextSymbol);

// TODO  小功能组件 - 定位/自动排序
export const Graph = defineComponent({
  inheritAttrs: false,
  name: 'X6Graph',
  setup(props, { slots, attrs, expose }) {
    const { container } = props;
    const { type, onEvents, ...other } = attrs;
    const typeVal = type && typeof type === 'string' ? type : 'default';
    //  custom node dict data
    const dictMap = reactive({});
    //  pre options
    const options = Config[`${typeVal}_config`];
    //  custom options
    Object.keys(other).forEach((key) => other[key] === '' && (other[key] = true));
    const containerRef = ref(container);
    const context = shallowReactive({ graph: null });
    provide(contextSymbol, context);
    expose(context);
    onMounted(async () => {
      dictHandler(dictMap);
      if (containerRef.value) {
        //  new graph
        context.graph = new X6Graph({
          container: containerRef.value,
          ...options,
          ...other,
        });
        if (onEvents) context.graph['onEvents'] = onEvents;
        context.graph['dictMap'] = dictMap;
        // loader
        Loader.load(context.graph, typeVal);
      }
    });
    return () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {!container && <div ref={containerRef} style={{ height: '100%' }} />}
        {context.graph && <Fragment>{slots.default ? slots.default() : null}</Fragment>}
        <p
          className="tip"
          style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            fontSize: '14px',
            color: '#a8abb2',
          }}
        >
          按住CTRL，鼠标左键拖拽页面，滚轮控制缩放
        </p>
        <Funs graph={context.graph}></Funs>
      </div>
    );
  },
});

const dictHandler = async (dictMap) => {
  dictMap['conditionNodeEnum'] =
    (await getDict('decision_flow_node_type_enum', '条件节点').catch(() => {})) || '';
  dictMap['decisionAndNodeEnum'] =
    (await getDict('condition_node_enum', '并且节点').catch(() => {})) || '';
  dictMap['decisionOrNodeEnum'] =
    (await getDict('condition_node_enum', '或者节点').catch(() => {})) || '';
  dictMap['decisionArithNodeEnum'] =
    (await getDict('condition_node_enum', '条件表达式节点').catch(() => {})) || '';
  dictMap['decisionResultNodeEnum'] =
    (await getDict('decision_node_enum', '结果节点').catch(() => {})) || '';

  const { operator } = await getDictSync('operator');
  dictMap['operator'] = operator || [];

  //  特征库选项
  dictMap['featuresOptions'] =
    (await getLibFeatureOptionsApi().catch(() => {}))?.data?.map((item) => ({
      ...item,
      key: item.featureId,
      label: item.featureName,
      value: item.featureCode,
    })) || [];
};
