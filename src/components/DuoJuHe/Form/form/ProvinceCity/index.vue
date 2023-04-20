<template>
    <div>
        <el-cascader
            v-model="value"
            :options="options"
            :props="props"
            :placeholder="placeholder"
            clearable
            @change="changeHandle"
        />
    </div>
</template>

<script>
import city from './level.min.json'
export default {
    name: 'ProvinceCity',
    props: {
      value: {
        type: Array,
        default: () => []
      },
      placeholder: {
        type: String,
        default: "请选择"
      }
    },
    data() {
        return {
            //value: this.value,
            options: city,
            props: {
                label: 'n',
                value: 'n',
                children: 'd'
            }
        }
    },
  methods: {
        changeHandle(val) {
            this.$emit('input', val)
        }
    }
}
</script>

