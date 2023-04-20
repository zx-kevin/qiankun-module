
const workflow = defineStore(
  'im-workflow',
  {
    state: () => ({
      projectId: '',
      isTried: false,
      promoterDrawer: false,
      flowPermission1: {},
      approverDrawer: false,
      approverConfig1: {},
      copyerDrawer: false,
      copyerConfig1: {},
      conditionDrawer: false,
      conditionsConfig1: {
        conditionNodes: [],
      },
    }),

    actions: {
      setProjectId (payload) {
        this.projectId = payload
      },
      setIsTried (payload) {
        this.isTried = payload
      },
      setPromoter (payload) {
        this.promoterDrawer = payload
      },
      setFlowPermission (payload) {
        this.flowPermission1 = payload
      },
      setApprover (payload) {
        this.approverDrawer = payload
      },
      setApproverConfig (payload) {
        this.approverConfig1 = payload
      },
      setCopyer (payload) {
        this.copyerDrawer = payload
      },
      setCopyerConfig (payload) {
        this.copyerConfig1 = payload
      },
      setCondition (payload) {
        this.conditionDrawer = payload
      },
      setConditionsConfig (payload) {
        this.conditionsConfig1 = payload
      },
    },
  })

export default workflow
