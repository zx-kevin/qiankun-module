<template>
    <div>
        <div class="node-wrap" v-if="nodeConfig.type!=4">
            <div class="node-wrap-box" :class="(nodeConfig.type==0?'start-node ':'')+(isTried&&nodeConfig.error?'active error':'')">
                <div>
                    <div class="title" :style="'background: rgb('+ ['87, 106, 149','255, 148, 62','50, 150, 250'][nodeConfig.type] +');'">
                        <span class="iconfont" v-show="nodeConfig.type==1"></span>
                        <span class="iconfont" v-show="nodeConfig.type==2"></span>
                        <span v-if="nodeConfig.type==0">{{nodeConfig.nodeName}}</span>
                        <input type="text" class="ant-input editable-title-input" v-if="nodeConfig.type!=0&&isInput">
                        <span class="editable-title" v-if="nodeConfig.type!=0&&!isInput">{{nodeConfig.nodeName}}</span>
                    </div>
                    <div class="content">
                      <div class="text" style="text-align: center" v-if="nodeConfig.type==0">{{$func.arrToStr(flowPermission)?$func.arrToStr(flowPermission):'所有人'}}</div>
                        <div class="text" v-if="nodeConfig.type==1">
                            {{$func.setApproverStr(nodeConfig)}}
                        </div>
                        <div class="text" v-if="nodeConfig.type==2">
                            {{$func.copyerStr(nodeConfig)}}
                        </div>
                    </div>
                    <div class="error_tip" v-if="isTried&&nodeConfig.error">
                        <i class="anticon anticon-exclamation-circle" style="color: rgb(242, 86, 67);"></i>
                    </div>
                </div>
            </div>
            <addNode :childNodeP.sync="nodeConfig.childNode" :showChildNodeP="false"></addNode>
        </div>
        <div class="branch-wrap" v-if="nodeConfig.type==4">
            <div class="branch-box-wrap">
                <div class="branch-box">
                    <div class="col-box" v-for="(item,index) in nodeConfig.conditionNodes" :key="index">
                        <div class="condition-node">
                            <div class="condition-node-box">
                                <div class="auto-judge" :class="isTried&&item.error?'error active':''">
                                    <div class="sort-left" v-if="index!=0" >&lt;</div>
                                    <div class="title-wrapper">
                                        <input type="text" class="ant-input editable-title-input" v-if="isInputList[index]"
                                        v-model="item.nodeName">
                                        <span class="editable-title" v-if="!isInputList[index]">{{item.nodeName}}</span>
                                        <span class="priority-title" >优先级{{item.priorityLevel}}</span>
                                    </div>
                                    <div class="sort-right" v-if="index!=nodeConfig.conditionNodes.length-1" >&gt;</div>
                                    <div class="content">{{$func.conditionStr(nodeConfig,index)}}</div>
                                    <div class="error_tip" v-if="isTried&&item.error">
                                        <i class="anticon anticon-exclamation-circle" style="color: rgb(242, 86, 67);"></i>
                                    </div>
                                </div>
                                <addNode :childNodeP.sync="item.childNode" :showChildNodeP="false"></addNode>
                            </div>
                        </div>
                        <nodeWrapView v-if="item.childNode" :nodeConfig.sync="item.childNode"></nodeWrapView>
                        <div class="top-left-cover-line" v-if="index==0"></div>
                        <div class="bottom-left-cover-line" v-if="index==0"></div>
                        <div class="top-right-cover-line" v-if="index==nodeConfig.conditionNodes.length-1"></div>
                        <div class="bottom-right-cover-line" v-if="index==nodeConfig.conditionNodes.length-1"></div>
                    </div>
                </div>
                <addNode :childNodeP.sync="nodeConfig.childNode" :showChildNodeP="false"></addNode>
            </div>
        </div>
        <nodeWrapView v-if="nodeConfig.childNode" :nodeConfig.sync="nodeConfig.childNode"></nodeWrapView>
    </div>
</template>
<script>
import { mapState} from 'vuex'
export default {
    props: ["nodeConfig", "flowPermission"],
    data() {
        return {
            isInputList: [],
            isInput: false,
        }
    },
    mounted() {
        if (this.nodeConfig.type == 1) {
            this.nodeConfig.error = !this.$func.setApproverStr(this.nodeConfig)
        } else if (this.nodeConfig.type == 2) {
            this.nodeConfig.error = !this.$func.copyerStr(this.nodeConfig)
        } else if (this.nodeConfig.type == 4) {
            for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
                this.nodeConfig.conditionNodes[i].error = this.$func.conditionStr(this.nodeConfig, i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            }
        }
    },
    computed: {
        ...mapState({
          isTried: state => state.workflow.isTried,
          flowPermission1: state => state.workflow.flowPermission1,
          approverConfig1: state => state.workflow.approverConfig1,
          copyerConfig1: state => state.workflow.copyerConfig1,
          conditionsConfig1: state => state.workflow.conditionsConfig1
      }),
    },
    watch: {
        flowPermission1(data) {
            if (data.flag&&data.id === this._uid) {
                this.$emit('update:flowPermission',data.value)
            }
        },
        approverConfig1(data) {
            if (data.flag&&data.id === this._uid) {
                this.$emit('update:nodeConfig',data.value)
            }
        },
        copyerConfig1(data) {
            if (data.flag&&data.id === this._uid) {
                this.$emit('update:nodeConfig',data.value)
            }
        },
        conditionsConfig1(data) {
            if (data.flag&&data.id === this._uid) {
                this.$emit('update:nodeConfig',data.value)
            }
        },
    },
}
</script>
<style scoped src="@/assets/styles/workflow/override-element-ui.css"></style>
<style>
.error_tip {
    position: absolute;
    top: 0px;
    right: 0px;
    transform: translate(150%, 0px);
    font-size: 24px;
}
.promoter_person .el-dialog__body {
    padding: 10px 20px 14px 20px;
}
.selected_list {
    margin-bottom: 20px;
    line-height: 30px;
}
.selected_list span {
    margin-right: 10px;
    padding: 3px 6px 3px 9px;
    line-height: 12px;
    white-space: nowrap;
    border-radius: 2px;
    border: 1px solid rgba(220, 220, 220, 1);
}
.selected_list img {
    margin-left: 5px;
    width: 7px;
    height: 7px;
    cursor: pointer;
}
</style>
