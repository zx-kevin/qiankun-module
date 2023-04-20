<template>
  <div class="lum-dialog-mask">
    <el-dialog
      :title="title"
      v-model="open"
      width="800px"
      append-to-body
      @close="$emit('close', 0)"
    >
      <el-row>
        <!-- <img :src="options.img" alt="" /> -->
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url" :style="options.previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              选择
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- <el-container class="lum-dialog-box">
      <el-header class="header" height="50px">
        <p>选择头像</p>
        <p class="tools">
          <el-icon @click="$emit('close', 0)"><Close /></el-icon>
        </p>
      </el-header>
      <el-main class="main">
        <el-container class="full-height">
          <el-aside width="400px">
            <div class="cropper-box">
              <vue-cropper
                ref="cropper"
                mode="cover"
                :img="option.img"
                :output-size="option.size"
                :output-type="option.outputType"
                :info="true"
                :full="option.full"
                :fixed="fixed"
                :fixed-number="fixedNumber"
                :can-move="option.canMove"
                :can-move-box="option.canMoveBox"
                :fixed-box="option.fixedBox"
                :original="option.original"
                :auto-crop="option.autoCrop"
                :auto-crop-width="option.autoCropWidth"
                :auto-crop-height="option.autoCropHeight"
                :center-box="option.centerBox"
                :high="option.high"
                @real-time="realTime"
              />
              <input
                type="file"
                id="uploads"
                ref="fileInput"
                accept="image/png, image/jpeg, image/jpg"
                style="display: none"
                @change="uploadImg($event, 1)"
              />
            </div>
            <div class="tools tools-flex">
              <el-button size="small" plain icon="el-icon-upload" @click="clickUpload"
                >上传图片
              </el-button>
              <el-button size="small" plain icon="el-icon-refresh" @click="refreshCrop"
                >刷新
              </el-button>
              <el-button size="small" plain icon="el-icon-refresh-left" @click="rotateLeft"
                >左转
              </el-button>
              <el-button size="small" plain icon="el-icon-refresh-right" @click="rotateRight"
                >右转
              </el-button>
            </div>
          </el-aside>
          <el-main class="no-padding">
            <div class="cropper-box">
              <div class="preview-img">
                <img v-if="previews" :src="previews.url" :style="previews.img" />
              </div>
            </div>
            <div class="tools">
              <el-button type="primary" size="small" @click="uploadService"> 保存图片 </el-button>
            </div>
          </el-main>
        </el-container>
      </el-main>
    </el-container> -->
  </div>
</template>
<script setup>
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import { avatarFileApi } from '@/api/module/chat/im/chatGroup.js';
const { proxy } = getCurrentInstance();

const props = defineProps(['detail']);
const open = ref(true);
const visible = ref(false);
const title = ref('修改头像');

//图片裁剪数据
const options = reactive({
  img: dataURLtoFile(props.detail.groupAvatar, '头像'), // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: 'png', // 默认生成截图为PNG格式
  previews: {}, //预览数据
});
// let urls = window.URL.createObjectURL(options.img);
console.log(options.img);
// options.img = urls;
// base64转文件
function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
// 图片预览
var reader = new FileReader();
reader.onload = function (evt) {
  console.log(evt);
  let src = evt.target.result;
  console.log(src);
};
reader.readAsDataURL(options.img);
// let data = previewImg(options.img);
// console.log(data);
/** 编辑头像 */
function editCropper() {
  open.value = true;
}
/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true;
}
/** 覆盖默认上传行为 */
function requestUpload() {}
/** 向左旋转 */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft();
}
/** 向右旋转 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight();
}
/** 图片缩放 */
function changeScale(num) {
  num = num || 1;
  proxy.$refs.cropper.changeScale(num);
}
/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf('image/') == -1) {
    proxy.$modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。');
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      options.img = reader.result;
    };
  }
}
/** 上传图片 */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob((data) => {
    let formData = new FormData();
    formData.append('file', data);
    avatarFileApi(formData).then((response) => {
      proxy.$modal.msgSuccess('修改成功');
      this.$emit('close', 1);
    });
  });
}
function base64ToImageFn({ avatar }) {
  // console.log(groupAvtar);
  let src = `data:image/png;base64,${avatar}`;
  // console.log(src);
  return src;
}
/** 实时预览 */
function realTime(data) {
  options.previews = data;
}
</script>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>

<!-- 
import { VueCropper } from 'vue-cropper';
import { imageSingleUpload } from '@/api/common/fileUpload';

export default {
  name: 'AvatarCropper',
  components: {
    VueCropper,
  },
  data() {
    return {
      cusPreviewsImg: '',
      previews: {},
      option: {
        img: '',
        size: 1,
        full: false,
        outputType: 'png',
        canMove: true,
        fixedBox: true,
        original: false,
        canMoveBox: true,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 200,
        autoCropHeight: 150,
        centerBox: false,
        high: true,
      },
      fixed: true,
      fixedNumber: [1, 1],
    };
  },
  setup() {},
  methods: {
    clickUpload() {
      this.$refs.fileInput.click();
    },
    clearCrop() {
      if (!this.cusPreviewsImg) return false;
      this.$refs.cropper.clearCrop();
    },
    refreshCrop() {
      if (!this.cusPreviewsImg) return false;
      this.$refs.cropper.refresh();
    },
    rotateLeft() {
      if (!this.cusPreviewsImg) return false;
      this.$refs.cropper.rotateLeft();
    },
    rotateRight() {
      if (!this.cusPreviewsImg) return false;
      this.$refs.cropper.rotateRight();
    },
    // 实时预览函数
    realTime(data) {
      this.previews = data;
      this.$refs.cropper.getCropBlob((img) => {
        this.cusPreviewsImg = img;
      });
    },

    // 上传回调事件
    uploadImg(e, num) {
      let file = e.target.files[0];
      if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
        this.$message('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种');
        return false;
      }

      let reader = new FileReader();
      reader.onload = (e) => {
        let data = window.URL.createObjectURL(new Blob([e.target.result]));
        if (num === 1) {
          this.option.img = data;
        } else if (num === 2) {
          this.example2.img = data;
        }
      };
      // 转化为base64
      //reader.readAsDataURL(file)
      // 转化为blob
      reader.readAsArrayBuffer(file);
    },

    // 上传图片到服务器
    uploadService() {
      if (this.cusPreviewsImg == '') return;

      let formData = new FormData();
      formData.append('file', this.cusPreviewsImg);
      imageSingleUpload(formData)
        .then((res) => {
          if (res && res.code === 200) {
            this.$emit('close', 1, res.data.fileAbsolutePath);
          }
        })
        .catch(() => {
          this.$message('文件上传失败,请稍后再试...');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.lum-dialog-box {
  height: 550px;
  max-width: 800px;

  .main {
    .cropper-box {
      height: 360px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;

      .preview-img {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 4px #ccc;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .tools {
      height: 40px;
      margin-top: 20px;
      text-align: center;

      button {
        border-radius: 1px;
      }
    }

    .tools-flex {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style> -->
