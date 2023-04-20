<template>
  <!-- 未完成 -->
  <div class="common-upload-file" :class="size">
    <el-upload
      v-show="!hide"
      ref="uploadRef"
      :action="baseUrl + action"
      :headers="headers"
      :multiple="multiple"
      :data="data"
      :name="name"
      :withCredentials="withCredentials"
      :drag="drag || size === 'default'"
      :accept="accept"
      :disabled="disabled"
      :limit="limit"
      :file-list="fileList"
      :before-upload="handleBeforeUpload"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :on-progress="handleUploadProgress"
      :show-file-list="false"
      class="upload-file"
    >
      <div v-if="loading && limit === 1" class="loading" :class="size">
        <svg class="icon-loading" aria-hidden="true">
          <use xlink:href="#icon-loading"></use>
        </svg>
      </div>
      <el-icon class="common-icon--upload" v-else><upload-filled /></el-icon>
      <div class="common-upload__text">
        点击{{ size === 'small' ? '上传文件' : '/拖拽上传文件' }}
      </div>
      <div v-if="isShowTip && size != 'small'" class="common-upload__tip">
        支持：{{ fileType.join('、') }}格式
      </div>
    </el-upload>
    <!-- 文件列表 -->
    <!-- 单个 -->
    <ul v-if="limit === 1 && fileList.length" class="upload-preview" :class="size">
      <li class="item" v-for="(file, index) in fileList" :key="file.uid">
        <span class="fileIcon"></span>
        <div class="content">
          <tooltip-text :content="getFileName(file.name)" />
        </div>
        <el-icon class="delete" @click="handleDelete(index)"><CircleCloseFilled /></el-icon>
      </li>
    </ul>
    <!-- 多个 -->
    <ul v-if="limit > 1" class="upload-list" :class="size">
      <li class="item" v-for="(file, index) in fileList" :key="file.uid">
        <div class="left">
          <span class="fileIcon"></span>
          <div class="content">
            <div class="text">
              <tooltip-text :content="getFileName(file.name)" />
            </div>
            <el-progress
              :percentage="parseInt(file.percentage)"
              :format="format"
              :color="file.percentage === 100 ? '#1AC468' : '#2659F6'"
              class="progress"
            />
          </div>
        </div>
        <el-icon class="delete" @click="handleDelete(index)"><CircleCloseFilled /></el-icon>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'UploadFile',
};
</script>

<script setup>
import { getToken } from '@/utils/auth';

const props = defineProps({
  modelValue: [String, Object, Array],
  // 请求 URL
  action: {
    type: String,
    default: '/common/upload',
  },
  // 设置上传请求方法
  method: {
    type: String,
    default: 'post',
  },
  // 是否支持多选文件
  multiple: {
    type: Boolean,
    default: false,
  },
  // 上传时附带的额外参数
  data: {
    type: Object,
    default: () => {},
  },
  // 上传的文件字段名
  name: {
    type: String,
    default: 'file',
  },
  // 支持发送 cookie 凭证信息
  withCredentials: {
    type: Boolean,
    default: false,
  },
  // 是否启用拖拽上传
  drag: {
    type: Boolean,
    default: false,
  },
  // 接受上传的文件类型
  accept: {
    type: String,
    default: '.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.zip,.rar,.mp4',
  },
  // 是否禁用上传
  disabled: {
    type: Boolean,
    default: false,
  },
  // 允许上传文件的最大数量
  limit: {
    type: Number,
  },
  limitHide: {
    type: Boolean,
    default: true,
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 5,
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'default',
  },
  // 返回值
  isFile: {
    type: Boolean,
    default: false,
  },
  onSuccess: {
    type: Function,
    default: (res, file) => ({}),
  },
  delFile: {
    type: Function,
    default: (index) => ({}),
  },
});

const { proxy } = getCurrentInstance();
const emit = defineEmits(['update:modelValue']);
const number = ref(0);
const uploadList = ref([]);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const headers = ref({ Authorization: 'Bearer ' + getToken() });
const fileList = ref([]);
const hide = computed(() => {
  if (typeof props.limit === 'number') {
    return fileList.value.length >= props.limit && props.limitHide;
  } else {
    return false;
  }
});
const fileType = props.accept.split(',');
const loading = ref(false);

const format = (percentage) => (percentage === 100 ? '完成' : `${percentage}%`);

defineExpose({ fileList });

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      let temp = 1;
      // 首先将值转为数组
      let list;
      if (Array.isArray(val)) {
        list = val;
      } else {
        let srcList = [];
        let omit = '';
        props.modelValue.split(',').forEach((item) => {
          const imgtype = item.toLowerCase().split('.');
          const suffix = imgtype[imgtype.length - 1];
          if (fileType.includes('.' + suffix)) {
            item = omit + item;
            omit = '';
            srcList.push(item);
          } else {
            omit += item + ',';
          }
        });
        list = srcList;
      }
      // 然后将数组转为对象数组
      fileList.value = list.map((item) => {
        if (typeof item === 'string') {
          item = { name: item, url: item };
        }
        item.uid = item.uid || new Date().getTime() + temp++;
        item.percentage = item.percentage || 100;
        return item;
      });
    } else {
      fileList.value = [];
      return [];
    }
  },
  { deep: true, immediate: true },
);

// 上传前校检格式和大小
function handleBeforeUpload(file) {
  // 校检文件类型
  if (fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = '.' + fileName[fileName.length - 1];
    const isTypeOk = fileType.includes(fileExt);
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确, 请上传${fileType.join('/')}格式文件!`);
      return false;
    }
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  loading.value = true;
  number.value++;
  return true;
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError('上传文件失败');
}

// 上传时
function handleUploadProgress({ percent }, file, fileListCopy) {
  if (props.limit > 1) fileList.value = fileListCopy;
}

// 上传成功回调
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    let data;
    if (props.isFile) {
      data = res.data.file;
    } else {
      data = res.data;
    }
    uploadList.value.push({
      ...data,
      name: data.name || data.fileName,
      url: data.path || data.filePath,
    });
    uploadedSuccessfully();
    props.onSuccess(res, file);
  } else {
    number.value--;
    loading.value = false;
    proxy.$modal.msgError(res.msg);
    proxy.$refs.uploadRef.handleRemove(file);
    uploadedSuccessfully();
  }
}

// 删除文件
function handleDelete(index) {
  fileList.value.splice(index, 1);
  emit('update:modelValue', listToString(fileList.value));
  props.delFile(index);
}

// 上传结束处理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit('update:modelValue', listToString(fileList.value));
    loading.value = false;
  }
}

// 获取文件名称
function getFileName(name) {
  if (!name) return '';
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1);
  } else if (name.lastIndexOf('.') > -1) {
    return name.slice(0, name.lastIndexOf('/'));
  } else {
    return name;
  }
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  let strs = '';
  separator = separator || ',';
  for (let i in list) {
    if (list[i].url) {
      strs += list[i].url + separator;
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : '';
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable/color.scss';
.common-upload-file {
  width: 100%;
  .upload-file {
    width: 100%;
    height: 100%;
  }
  :deep(.el-upload) {
    width: 100%;
    .el-upload-dragger {
      width: 100%;
      height: 128px;
      background-color: $--fill-color-shallow;
      border-radius: 8px;
      border: 1px dashed $--border-color-default;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      &:hover {
        background-color: $--primary-blue-4;
        border: 1px solid $--primary-blue-default;
      }

      // 图标
      .common-icon--upload {
        font-size: 28px;
        color: $--primary-blue-default;
      }
      // 文字
      .common-upload__text {
        font-size: 16px;
        line-height: 24px;
        color: $--text-color-10;
        margin-top: 11px;
      }
      // 提示
      .common-upload__tip {
        font-size: 12px;
        line-height: 18px;
        color: #bcc1cc;
      }
    }
  }
  &.small {
    :deep(.el-upload) {
      height: 40px;
      background-color: $--fill-color-shallow;
      border-radius: 4px;
      border: 1px dashed $--border-color-default;
      &:hover {
        background-color: $--primary-blue-4;
        border: 1px solid $--primary-blue-default;
      }
      // 图标
      .common-icon--upload {
        font-size: 17px;
        color: $--primary-blue-default;
        margin-right: 9px;
      }
      // 文字
      .common-upload__text {
        font-size: 14px;
        line-height: 22px;
        color: $--text-color-10;
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .upload-preview {
    width: 100%;
    height: 128px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px dashed $--border-color-default;
    display: flex;
    align-items: center;
    &:hover {
      background-color: $--primary-blue-4;
      border: 1px solid $--primary-blue-default;
    }
    &.small {
      height: 100%;
    }
    .item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 11px;
      .fileIcon {
        width: 18px;
        height: 20px;
        background-color: #e24f3b;
      }

      .progress {
        flex: 1;
        padding-left: 13px;
      }
      .content {
        max-width: 80%;
        font-size: 14px;
        color: $--text-color-10;
        display: flex;
        align-items: center;
        padding: 0 13px;
      }
      .delete {
        font-size: 17px;
        color: #bcc1cc;
        cursor: pointer;
      }
    }
  }

  @keyframes loading {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(1turn);
    }
  }
  .loading {
    display: flex;
    align-items: center;
    &.small {
      width: 18px;
      height: 18px;
      margin-right: 11px;
    }
    &.default {
      width: 30px;
      height: 30px;
    }
    .icon-loading {
      width: 100%;
      height: 100%;
      animation: loading 1s ease-out infinite;
    }
  }

  .upload-list {
    .item {
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 10px;
      transition: all 0.5s ease-in-out;
      .left {
        width: calc(100% - 17px);
        display: flex;
        align-items: center;
        .fileIcon {
          width: 20px;
          height: 22px;
          border-radius: 2px;
          background-color: #e24f3b;
        }

        .content {
          width: calc(100% - 20px);
          padding: 0 9px 0 8px;
          .text {
            width: 100%;
            font-size: 12px;
            line-height: 18px;
            color: $--text-color-20;
          }
          .progress {
            flex: 1;
            :deep(.el-progress__text) {
              min-width: 0;
            }
          }
        }
      }
      .delete {
        font-size: 17px;
        color: #bcc1cc;
        cursor: pointer;
      }
    }
  }
}
</style>
