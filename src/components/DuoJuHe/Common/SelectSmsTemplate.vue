<template>
  <div>
    <el-drawer
      class="drawerClass"
      :title="smsTemplateTitle"
      :visible.sync="smsTemplateOpen"
      append-to-body
    >
      <el-row>
        <el-col>
          <el-table
            ref="smsTemplateMultipleTable"
            :stripe="true"
            v-loading="smsTemplateLoading"
            :data="smsTemplateDataList"
          >
            <el-table-column label="模板内容" align="left" prop="content" />
            <el-table-column label="模板签名" align="left" prop="templateSign" />
            <el-table-column label="发送渠道" align="left" prop="channelName" />
            <el-table-column
              label="操作"
              align="center"
              width="80px"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  size="default"
                  type="text"
                  icon="el-icon-check"
                  @click="handleSelectSmsTemplate(scope.row)"
                  >使用</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="smsTemplateTotal > 10"
            :total="smsTemplateTotal"
            :page.sync="smsTemplateQueryParams.page"
            :limit.sync="smsTemplateQueryParams.rows"
            @pagination="queryNormalSelectSmsTemplatePageResList"
          />
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
import { queryNormalSelectSmsTemplatePageResList } from '@/api/sms/smsTemplate';
//默认查询参数
let defaultQuerySmsTemplateParams = {
  page: 1,
  rows: 10,
};
export default {
  name: 'SelectSmsTemplate',
  data() {
    return {
      // 遮罩层
      smsTemplateLoading: true,
      // 总条数
      smsTemplateTotal: 0,
      //操作短信渠道
      smsTemplateDataList: [],
      // 日期范围
      smsTemplateDateRange: [],
      // 弹出层标题
      smsTemplateTitle: '短信内容模板',
      // 是否显示新增修改弹出层
      smsTemplateOpen: false,
      // 查询参数
      smsTemplateQueryParams: { ...defaultQuerySmsTemplateParams },
    };
  },
  methods: {
    //返回选择的值
    handleSelectSmsTemplate(row) {
      this.$emit('handleSelectSmsTemplate', row);
      this.smsTemplateOpen = false;
    },
    // 显示窗口
    selectSmsTemplateOpen() {
      this.smsTemplateOpen = true;
      this.queryNormalSelectSmsTemplatePageResList();
    },
    /** 查询短信渠道列表 */
    queryNormalSelectSmsTemplatePageResList() {
      this.smsTemplateLoading = true;
      queryNormalSelectSmsTemplatePageResList(
        this.addDateRange(this.smsTemplateQueryParams, this.smsTemplateDateRange),
      )
        .then((res) => {
          this.smsTemplateDataList = res.data.records;
          this.smsTemplateTotal = res.data.total;
        })
        .finally(() => {
          //关闭加载特效
          this.smsTemplateLoading = false;
        });
    },
    /** 重置按钮操作 */
    resetQuerySmsTemplate(fromId) {
      this.smsTemplateDateRange = [];
      this.resetForm(fromId);
      this.handleQuerySmsTemplate();
    },
    /** 搜索按钮操作 */
    handleQuerySmsTemplate() {
      this.smsTemplateQueryParams.page = 1;
      this.queryNormalSelectSmsTemplatePageResList();
    },
  },
};
</script>

<style>
.drawerClass .el-drawer__body {
  padding: 0 0 10px 0;
}
.drawerClass .el-drawer__header {
  padding: 15px 0 5px 10px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>
