import {deepClone} from '@/utils/form/utils/convert'
import SignPad from '@/components/DuoJuHe/Form/form/SignPad/index'
import PhoneVerification from '@/components/DuoJuHe/Form/form/PhoneVerification/index'

const componentChild = {}
/**
 * 将./slots中的文件挂载到对象componentChild上
 * 文件名为key，对应JSON配置中的__config__.tag
 * 文件内容为value，解析JSON配置中的__slot__
 */
const slotsFiles = require.context('./slots', false, /\.js$/)
const keys = slotsFiles.keys() || []
keys.forEach(key => {
    const tag = key.replace(/^\.\/(.*)\.\w+$/, '$1')
    const value = slotsFiles(key).default
    componentChild[tag] = value
})

function vModel(dataObject, defaultValue) {
    let config = dataObject.attrs.__config__
    let expand = dataObject.attrs.expand
    // 表单组件特殊处理
    if (config.tag === 'el-upload') {
         let newFileListValue = []
         if (defaultValue){
           defaultValue.forEach(element => {
             newFileListValue.push({name: element.fileName, url: element.url})
           })
         }
        // 增加上传回调事件
        dataObject.attrs['on-success'] = (response, file, fileList) => {
            if (response&&response.errorCode===0){
              this.$emit('upload', response, file, fileList)
            }else {
              this.$message.error(`${response.message}`)
              let index = fileList.indexOf(file);
              fileList.splice(index,1);
              return false
            }
        }
        dataObject.attrs['on-remove'] = (file, fileList) => {
            // eslint-disable-next-line vue/custom-event-name-casing
            this.$emit('deleteUpload', file, fileList)
        }

        dataObject.attrs['file-list'] = newFileListValue

        dataObject.attrs['on-error'] = (file, fileList) => {
          console.log("上传失败了")
        }
        // eslint-disable-next-line no-unused-vars
        dataObject.attrs['on-exceed'] = (files, fileList) => {
            this.$message.error(`最多上传${expand.limit}个文件`)
            return false
        }
        dataObject.attrs['before-upload'] = file => {
            let sizeUnitNum = 1
            // 文件大小判断
            switch (config.sizeUnit) {
                case 'KB':
                    sizeUnitNum = 1024
                    break
                case 'MB':
                    sizeUnitNum = 1024 * 1024
                    break
                case 'GB':
                    sizeUnitNum = 1024 * 1024 * 1024
                    break
            }
            let totalSize = expand.fileSize * sizeUnitNum
            if (file.size > totalSize) {
                this.$message.error(`上传文件大小不能超过${expand.fileSize}${expand.sizeUnit}`)
                return false
            }
        }
    // 分页组件
    } else if (config.tag === 'form-pagination') {
        dataObject.on.prev = val => {
            this.$emit('prev', val)
        }
        dataObject.on.next = val => {
            this.$emit('next', val)
        }
    } else {
        dataObject.props.value = defaultValue

        dataObject.on.input = val => {
            this.$emit('input', val)
        }
    }

}

function mountSlotFlies(h, confClone, children) {
    const childObjs = componentChild[confClone.__config__.tag]
    if (childObjs) {
        Object.keys(childObjs).forEach(key => {
            const childFunc = childObjs[key]
            if (confClone.__slot__ && confClone.__slot__[key]) {
                children.push(childFunc(h, confClone, key, this))
            }
        })
    }
}

function emitEvents(confClone) {
    ['on', 'nativeOn'].forEach(attr => {
        const eventKeyList = Object.keys(confClone[attr] || {})
        eventKeyList.forEach(key => {
            const val = confClone[attr][key]
            if (typeof val === 'string') {
                confClone[attr][key] = event => this.$emit(val, event)
            }
        })
    })
}

function buildDataObject(confClone, dataObject) {
    Object.keys(confClone).forEach(key => {
        const val = confClone[key]
        if (key === '__vModel__') {
            vModel.call(this, dataObject, confClone.__config__.defaultValue)
        } else if (dataObject[key]) {
            dataObject[key] = {...dataObject[key], ...val}
        } else {
            dataObject.attrs[key] = val
        }
    })

    // 清理属性
    clearAttrs(dataObject)
}

function clearAttrs(dataObject) {
    delete dataObject.attrs.__config__
    delete dataObject.attrs.__slot__
    delete dataObject.attrs.__methods__
}

function makeDataObject() {
    return {
        attrs: {},
        props: {},
        nativeOn: {},
        on: {},
        style: {}
    }
}

export default {
    components: {
        SignPad,
        PhoneVerification
    },
    props: {
        conf: {
            type: Object,
            required: true
        }
    },
    render(h) {
        const dataObject = makeDataObject()
        const confClone = deepClone(this.conf)
        const children = this.$slots.default || []
        // 如果slots文件夹存在与当前tag同名的文件，则执行文件中的代码
        mountSlotFlies.call(this, h, confClone, children)

        // 将字符串类型的事件，发送为消息
        emitEvents.call(this, confClone)

        // 将json表单配置转化为vue render可以识别的 “数据对象（dataObject）”
        buildDataObject.call(this, confClone, dataObject)

        return h(this.conf.__config__.tag, dataObject, children)
    }
}