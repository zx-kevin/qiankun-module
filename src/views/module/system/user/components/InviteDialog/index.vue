<template>
  <el-dialog title="邀请加入组织" v-model="visible" align-center>
    <div class="invite-dialog" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="60px" inline>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="角色" prop="roleIds">
              <el-select
                v-model="form.roleIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择角色"
                filterable
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select> </el-form-item
          ></el-col>

          <el-col :span="8">
            <el-form-item label="部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                filterable
                placeholder="请选择部门"
                check-strictly
              /> </el-form-item
          ></el-col>

          <el-col :span="8"
            ><el-form-item label="岗位" prop="postIds">
              <el-select
                v-model="form.postIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select> </el-form-item
          ></el-col>
        </el-row>
      </el-form>

      <div v-if="address" class="link">
        <p>{{ address }}</p>
        <el-button plain type="primary" @click="handleClip">复制</el-button>
      </div>
    </div>

    <template #footer>
      <el-button size="large" @click="visible = false">取 消</el-button>
      <el-button size="large" type="primary" plain @click="handleLink" :disabled="loading"
        >生成邀请连接</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import {
  createLinkApi, // 创建邀请链接
} from '@/api/module/system/user';
import { async } from '@antv/x6/lib/registry/marker/main';
import { ElMessage } from 'element-plus';

const emit = defineEmits();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  //  角色选项
  roleOptions: {
    type: Array,
    default: () => [],
  },
  //  部门选项
  deptOptions: {
    type: Array,
    default: () => [],
  },
  //  岗位选项
  postOptions: {
    type: Array,
    default: () => [],
  },
});
const rules = {
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
};
const { modelValue } = toRefs(props);

const loading = ref(false);
const visible = computed({
  get() {
    return modelValue.value;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
const form = reactive({});
const formRef = ref();
const address = ref('');

watch(form, () => (address.value = ''), { deep: true });
watch(
  visible,
  () => {
    setTimeout(() => {
      formRef.value && formRef.value.resetFields();
    });
    address.value = '';
  },
  { immediate: true },
);

async function handleLink() {
  const valid = await formRef.value.validate().catch(() => {});
  if (!valid) return;

  loading.value = true;

  const res = await createLinkApi(form)
    .catch(() => {})
    .finally(() => (loading.value = false));
  if (!res || res.code !== 200) return;

  const { inviteCode } = res.data;
  const hostname = window.location.host;
  const protocol = window.location.protocol;
  address.value = `${protocol}//${hostname}/invite/${inviteCode}`;
}

async function handleClip() {
  try {
    await navigator.clipboard.writeText(address.value);
    ElMessage.success('复制成功');
  } catch (e) {
    console.log('复制失败', e);
    ElMessage.error('复制失败');
  }
}
</script>

<style lang="scss" scoped>
.invite-dialog {
  .link {
    padding: 15px;
    border-radius: 10px;
    background-color: #c6e2ff;
    margin-top: 10px;
    color: #606266;
    display: flex;
    justify-content: space-between;
    line-height: 30px;

    p {
      flex: 1;
      word-break: break-all;
    }

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
