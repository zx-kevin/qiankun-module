<template>
  <v-ace-editor
    v-model:value="dataForm.textareashow"
    @init="initFail"
    @blur="blurFn"
    :lang="aceConfig.lang"
    :theme="aceConfig.theme"
    :options="aceConfig.options"
    :readonly="aceConfig.readOnly"
    style="height: 37vh"
    class="json-editor"
  />
</template>

<script name="JsonEditor">
import { ref, reactive, defineComponent, watch, toRefs } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import ace from 'ace-builds';
import workerJsonUrl from 'ace-builds/src-noconflict/worker-json?url'; // For vite
ace.config.setModuleUrl('ace/mode/json_worker', workerJsonUrl);

import searchboxUrl from 'ace-builds/src-noconflict/ext-searchbox?url'; // For vite
// console.log(searchboxUrl);
ace.config.setModuleUrl('ace/ext/searchbox', searchboxUrl);
// ace主题包
// import 'ace-builds/src-min-noconflict/theme-kuroir';
import 'ace-builds/src-noconflict/theme-chrome';
// ace语言包
// import 'ace-builds/src-min-noconflict/mode-javascript';
// import 'ace-builds/src-min-noconflict/mode-xml';
import 'ace-builds/src-min-noconflict/mode-json5';
import 'ace-builds/src-min-noconflict/mode-json';

//代码完成
// import 'ace-builds/src-noconflict/ext-language_tools';
export default defineComponent({
  components: { VAceEditor },
  props: {
    value: {
      type: [String, Object],
      default: '',
    },
    // 是否需要在init 的时候 转一下json
    isInitStringify: {
      type: Boolean,
      default: true,
    },
  },

  setup (props, context) {
    console.log();
    // ace.edit().execCommand('find');
    //ace编辑器配置
    const aceConfig = reactive({
      lang: 'json', //解析json
      mode: 'ace/mode/json',
      theme: 'chrome', //主题
      readOnly: false, //是否只读
      options: {
        // enableBasicAutocompletion: true, // 启用基本自动完成
        // enableSnippets: true, // 启用代码段
        // enableLiveAutocompletion: true, // 启用实时自动完成
        tabSize: 4,
        showPrintMargin: false,
        fontSize: 13,
        highlightActiveLine: true,
        useWorker: true,
      },
    });

    //form
    const dataForm = reactive({
      Example: {},
      textareashow: '',
    });
    //init
    const value = toRaw(props.value);
    // console.log(value);
    const initFail = () => {
      props.isInitStringify
        ? (dataForm.textareashow = JSON.stringify(value ? value : dataForm.Example, null, 2))
        : (dataForm.textareashow = value ? value : dataForm.Exampl);
    };
    const blurFn = () => {
      aaa(dataForm.textareashow).then((res) => {
        // console.log(res);
        context.emit('upd', res ? dataForm.textareashow : res);
      });
    };

    // 监听data的数据
    watch(
      () => dataForm.textareashow,
      (val, old) => {
        dataForm.textareashow = val;
        // console.log(val, typeof val, 'textareashow', dataForm.textareashow);
      },
      {
        deep: true, // 深度监听
        immediate: false,
      },
    );

    watch(
      () => props.value,
      (val, old) => {
        dataForm.textareashow = val;
      },
      {
        deep: true, // 深度监听
        immediate: true,
      },
    );

    function aaa (jsonString) {
      return new Promise((res, rej) => {
        //判断字符串是否为json格式
        try {
          var obj = JSON.parse(jsonString);
          if (typeof obj == 'object' && obj) {
            //对字符串进行格式化展示
            res(true);
            return;
            var nbsp = '&nbsp;&nbsp;&nbsp;&nbsp;';
            var num = 0;
            var jsonend = '';
            var array = jsonString.split('');
            for (var i = 0; i < array.length; i++) {
              if (array[i] === '{') {
                num = num + 1;
                jsonend = jsonend + array[i] + '<br/>';
                var temp = num;
                while (temp > 0) {
                  jsonend = jsonend + nbsp;
                  temp = temp - 1;
                }
              } else if (array[i] === '}') {
                num = num - 1;
                jsonend = jsonend + '<br/>';
                var temp = num;
                while (temp > 0) {
                  jsonend = jsonend + nbsp;
                  temp = temp - 1;
                }
                jsonend = jsonend + array[i];
              } else if (array[i] === '[') {
                num = num + 1;
                jsonend = jsonend + array[i] + '<br/>';
                var temp = num;
                while (temp > 0) {
                  jsonend = jsonend + nbsp;
                  temp = temp - 1;
                }
              } else if (array[i] === ']') {
                num = num - 1;
                jsonend = jsonend + '<br/>';
                var temp = num;
                while (temp > 0) {
                  jsonend = jsonend + nbsp;
                  temp = temp - 1;
                }
                jsonend = jsonend + array[i];
              } else if (array[i] === ',') {
                jsonend = jsonend + array[i] + '<br/>';
                var temp = num;
                while (temp > 0) {
                  jsonend = jsonend + nbsp;
                  temp = temp - 1;
                }
              } else {
                jsonend = jsonend + array[i];
              }
            }
            //格式化完成，写入到页面
          } else {
            res(false);
          }
        } catch (error) {
          res(false);
        }
      });
    }

    // 返回值
    return {
      aceConfig,
      dataForm,
      initFail,
      blurFn,
    };
  },
});
</script>

<style lang="scss" scoped>
.json-editor {
  height: 100%;
  position: relative;

  :deep(.CodeMirror) {
    height: auto;
    min-height: 300px;
  }

  :deep(.CodeMirror-scroll) {
    min-height: 300px;
  }
}
</style>
