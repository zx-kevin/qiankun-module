<template>
  <div>
    <el-drawer
      class="drawerClass"
      :title="smsChannelTitle"
      :visible.sync="smsChannelOpen"
      append-to-body
    >
      <el-row>
        <el-col>
          <!--        <el-form :model="smsChannelQueryParams" ref="smsChannelQueryForm" :inline="true"  label-width="68px">
          <el-form-item label="服务商名" prop="ispName">
            <el-input v-model="smsChannelQueryParams.ispName" placeholder="请输入服务商名" size="small" clearable style="width: 150px"/>
          </el-form-item>
          <el-form-item label="渠道名称" prop="channelName">
            <el-input v-model="smsChannelQueryParams.channelName" placeholder="请输入渠道名称" size="small" clearable style="width: 150px"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"  size="default" icon="el-icon-search" @click="handleQuerySmsChannel">搜索</el-button>
            <el-button icon="el-icon-refresh" size="default" @click="resetQuerySmsChannel('smsChannelQueryForm')">重置</el-button>
          </el-form-item>
        </el-form>-->
          <el-table
            ref="smsChannelMultipleTable"
            :stripe="true"
            v-loading="smsChannelLoading"
            :data="smsChannelDataList"
          >
            <el-table-column label="渠道名称" align="left" prop="channelName" />
            <el-table-column label="服务商名" align="left" prop="ispName" width="120px" />
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
                  @click="handleSelectSmsChannel(scope.row)"
                  >选择</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="smsChannelTotal > 10"
            :total="smsChannelTotal"
            :page.sync="smsChannelQueryParams.page"
            :limit.sync="smsChannelQueryParams.rows"
            @pagination="queryNormalSelectSmsChannelPageResList"
          />
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
import { queryNormalSelectSmsChannelPageResList } from '@/api/sms/smsChannel';
//默认查询参数
let defaultQuerySmsChannelParams = {
  ispName: undefined,
  startTime: undefined,
  endTime: undefined,
  channelName: undefined,
  ispStatusCode: 'NORMAL',
  statusCode: 'NORMAL',
  page: 1,
  rows: 10,
};
export default {
  name: 'SelectSmsChannel',
  data() {
    return {
      // 遮罩层
      smsChannelLoading: true,
      // 总条数
      smsChannelTotal: 0,
      //操作短信渠道
      smsChannelDataList: [],
      // 日期范围
      smsChannelDateRange: [],
      // 弹出层标题
      smsChannelTitle: '短信发送渠道',
      // 是否显示新增修改弹出层
      smsChannelOpen: false,
      // 查询参数
      smsChannelQueryParams: { ...defaultQuerySmsChannelParams },
    };
  },
  methods: {
    //返回选择的值
    handleSelectSmsChannel(row) {
      this.$emit('handleSelectSmsChannel', row);
      this.smsChannelOpen = false;
    },
    // 显示窗口
    selectSmsChannelOpen() {
      this.smsChannelOpen = true;
      this.queryNormalSelectSmsChannelPageResList();
    },
    /** 查询短信渠道列表 */
    queryNormalSelectSmsChannelPageResList() {
      this.smsChannelLoading = true;
      queryNormalSelectSmsChannelPageResList(
        this.addDateRange(this.smsChannelQueryParams, this.smsChannelDateRange),
      )
        .then((res) => {
          this.smsChannelDataList = res.data.records;
          this.smsChannelTotal = res.data.total;
        })
        .finally(() => {
          //关闭加载特效
          this.smsChannelLoading = false;
        });
    },
    /** 重置按钮操作 */
    resetQuerySmsChannel(fromId) {
      this.smsChannelDateRange = [];
      this.resetForm(fromId);
      this.handleQuerySmsChannel();
    },
    /** 搜索按钮操作 */
    handleQuerySmsChannel() {
      this.smsChannelQueryParams.page = 1;
      this.queryNormalSelectSmsChannelPageResList();
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
