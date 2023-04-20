<template>
  <div class="tinymce-container editor-container">
    <textarea class="tinymce-textarea" :id="id"></textarea>
  </div>
</template>
<script>
import { nextTick } from 'vue';
import videoplay from '@/assets/images/videoplay.png';
import { plugins, toolbar } from './config';
import { getToken, getAppApiUrl } from '@/utils/auth';
let num = 1;
import './zh_CN';
export default {
  name: 'Tinymce',
  props: {
    id: {
      type: String,
      default: () => {
        num === 10000 && (num = 1);
        return `tinymce${+new Date()}${num++}`;
      },
    },
    value: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 200,
    },
    branding: {
      type: Boolean,
      default: false,
    },
    menubar: {
      default: '',
    },
  },
  data() {
    return {
      hasChange: false,
      hasInit: false,
    };
  },
  watch: {
    value(val) {
      if (!this.hasChange && this.hasInit) {
        nextTick(() => tinymce.get(this.id).setContent(val));
      }
    },
  },
  mounted() {
    const _this = this;
    //token
    let token = getToken();
    //请求地址
    let uploadUrl = getAppApiUrl() + '/sysCommon/upload/imageSingleUploadToFileAbsolutePath';
    // require('./zh_CN');
    tinymce.init({
      selector: `#${this.id}`,
      language: 'zh_CN',
      width: '100%',
      height: 200,
      body_class: 'panel-body',
      object_resizing: false,
      toolbar_drawer: true,
      plugins,
      toolbar,
      menubar: false,
      branding: this.branding,
      end_container_on_empty_block: true,

      autoresize_bottom_margin: 50,
      autoresize_min_height: this.height, //编辑区域的最小高度
      autoresize_on_init: true,

      nonbreaking_force_tab: true,
      font_formats:
        '微软雅黑=微软雅黑,Microsoft YaHei;宋体=宋体,SimSun;黑体=黑体, SimHei;隶书=隶书, SimLi;楷体=楷体,楷体_GB2312, SimKai;andale mono=andale mono;arial=arial, helvetica,sans-serif;arial black=arial black,avant garde;comic sans ms=comic sans ms;impact=impact,chicago;Arial=Arial;Verdana=Verdana;Georgia=Georgia;Times New Roman=Times New Roman;Trebuchet MS=Trebuchet MS;Courier New=Courier New;Impact=Impact;Comic Sans MS=Comic Sans MS;Calibri=Calibri',
      fontsizeFormats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt',
      default_link_target: '_blank',
      link_title: false,
      media_url_resolver: function (data, resolve) {
        try {
          let videoUri = encodeURI(data.url);
          let embedHtml = `<p>
                  <span
                    class="mce-object mce-object-video"
                    data-mce-selected="1"
                    data-mce-object="video"
                    data-mce-p-width="100%"
                    data-mce-p-height="auto"
                    data-mce-p-controls="controls"
                    data-mce-p-controlslist="nodownload"
                    data-mce-p-allowfullscreen="true"
                    data-mce-p-src=${videoUri} >
                    <video poster=${videoplay} src=${data.url} muted autoplay="autoplay" width="100%" height="auto" controls="controls">
                      <source src=${data.url}>
                    </video>
                  </span>
                </p>
                <p style="text-align: left;"></p>`;
          resolve({ html: embedHtml });
        } catch (e) {
          resolve({ html: '' });
        }
      },

      images_upload_handler: function (blobInfo, succFun, failFun) {
        var xhr, formData;
        var file = blobInfo.blob(); // 转化为易于理解的file对象
        xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('token', token);
        xhr.onload = function () {
          let json;
          if (xhr.status !== 200) {
            failFun('HTTP Error: ' + xhr.status);
            return;
          }
          json = JSON.parse(xhr.responseText);
          if (!json || typeof json.data != 'string') {
            failFun('Invalid JSON: ' + xhr.responseText);
            return;
          }
          succFun(json.data);
        };
        formData = new FormData();
        formData.append('file', file, file.name); // 此处与源文档不一样
        xhr.send(formData);
      },
      init_instance_callback: (editor) => {
        if (_this.value) {
          editor.setContent(_this.value);
        }
        _this.hasInit = true;
        editor.on('NodeChange Change KeyUp', () => {
          this.hasChange = true;
          this.$emit('input', editor.getContent({ format: 'raw' }));
        });
      },
      setup(editor) {
        editor.addButton('h2', {
          title: '小标题', // tooltip text seen on mouseover
          text: '小标题',
          onclick() {
            editor.execCommand('mceToggleFormat', false, 'h2');
          },
          onPostRender() {
            const btn = this;
            editor.on('init', () => {
              editor.formatter.formatChanged('h2', (state) => {
                btn.active(state);
              });
            });
          },
        });
        editor.addButton('p', {
          title: '正文',
          text: '正文',
          onclick() {
            editor.execCommand('mceToggleFormat', false, 'p');
          },
          onPostRender() {
            const btn = this;
            editor.on('init', () => {
              editor.formatter.formatChanged('p', (state) => {
                btn.active(state);
              });
            });
          },
        });
        editor.on('joinimageuploadstart', function (e) {
          _this.$message({ duration: 0, message: '正在上传图片...' });
        });
        editor.on('joinimageuploadend', function (e) {
          _this.$message.closeAll();
        });
        editor.on('joinimageuploaderror', function (e) {
          _this.$message({ duration: 0, message: e.errMsg });
          setTimeout(function () {
            _this.$message.closeAll();
          }, 3000);
        });
      },
    });
  },
  destroyed() {
    tinymce.get(this.id).destroy();
  },
};
</script>
<style scoped>
.tinymce-container {
  position: relative;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 15px;
  top: 18px;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
