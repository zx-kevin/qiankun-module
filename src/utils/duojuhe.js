/**
 * 通用js方法封装处理
 */

// 日期格式化
export function parseTime(time, pattern) {
	if (arguments.length === 0 || !time) {
		return null
	}
	const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		} else if (typeof time === 'string') {
			time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.[\d]{3}/gm),'');
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	}
	const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key]
		// Note: getDay() returns 0 on Sunday
		if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return timeStr
}

// 表单重置
export function resetForm(refName) {
	if (this.$refs[refName]) {
		this.$refs[refName].resetFields();
	}
}

//按钮是否禁用
export function buttonDisabled(total) {
  return total===0;
}


// 添加日期范围
export function addDateRange(params, dateRange) {
  let search = params;
  search.startTime = "";
  search.endTime = "";
  if (null != dateRange && '' !== dateRange) {
    search.startTime = dateRange[0];
    search.endTime = dateRange[1];
  }
  return search;
}


// 字符串格式化(%s )
export function sprintf(str) {
	var args = arguments, flag = true, i = 1;
	str = str.replace(/%s/g, function () {
		var arg = args[i++];
		if (typeof arg === 'undefined') {
			flag = false;
			return '';
		}
		return arg;
	});
	return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
	if (!str || str == "undefined" || str == "null") {
		return "";
	}
	return str;
}

// 数据合并
export function mergeRecursive(source, target) {
    for (var p in target) {
        try {
            if (target[p].constructor == Object) {
                source[p] = mergeRecursive(source[p], target[p]);
            } else {
                source[p] = target[p];
            }
        } catch(e) {
            source[p] = target[p];
        }
    }
    return source;
};

//无权限提示
export function noPermission(message){
  this.$modal.msgError(message)
};


/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */

export function debounce(func, wait, immediate) {
  // eslint-disable-next-line no-unused-vars
  let timeout, args, context, timestamp, result
  // eslint-disable-next-line no-unused-vars
  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      // eslint-disable-next-line no-unused-vars
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        // eslint-disable-next-line no-unused-vars
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }
}

/**
 * list 转成构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };
  let childrenListMap = {};
  let nodeIds = {};
  let tree = [];
  for (let d of data) {
    let parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (let d of data) {
    let parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

// 深拷贝对象
export function deepClone(obj) {
  const _toString = Object.prototype.toString

  // null, undefined, non-object, function
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // DOM Node
  if (obj.nodeType && 'cloneNode' in obj) {
    return obj.cloneNode(true)
  }

  // Date
  if (_toString.call(obj) === '[object Date]') {
    return new Date(obj.getTime())
  }

  // RegExp
  if (_toString.call(obj) === '[object RegExp]') {
    const flags = []
    if (obj.global) {
      flags.push('g')
    }
    if (obj.multiline) {
      flags.push('m')
    }
    if (obj.ignoreCase) {
      flags.push('i')
    }

    return new RegExp(obj.source, flags.join(''))
  }

  const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : {}

  for (const key in obj) {
    result[key] = deepClone(obj[key])
  }

  return result
}


// 首字母大小
export function titleCase(str) {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str) {
  return str.replace(/-[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}
// 是否是数字
export function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}


function stringify(obj) {
  return JSON.stringify(obj, (key, val) => {
    if (typeof val === 'function') {
      return `${val}`
    }
    return val
  })
}

function parse(str) {
  JSON.parse(str, (k, v) => {
    if (v.indexOf && v.indexOf('function') > -1) {
      return eval(`(${v})`)
    }
    return v
  })
}
//json克隆
export function jsonClone(obj) {
  return parse(stringify(obj))
}

//json简单克隆
export function jsonSimpleClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

//加载提示框
export function vLoading(msg, el) {
  return this.$loading({
    target: el,
    lock: true,
    text: msg || '',
    background: 'rgba(0,0,0, 0)'
  })
}

/**
 * 排序格式化
 * @param queryParams
 * @param column
 */
export function orderByFormat(queryParams, column) {
  //排序方式
  let order = "desc";
  if("ascending"===column.order){
    order = "asc"
  }
  //设置排序字段
  if (column.column.sortBy!==undefined){
    if (column.column.sortBy instanceof Array){
      let orderBy="";
      for(let item of column.column.sortBy){
        orderBy += item +" "+ order + ",";
      }
      //排序方式
      if (orderBy.length > 0) {
        queryParams.orderBy = orderBy.substr(0,orderBy.length - 1);
      }
    }else {
      let sort =column.column.sortBy.toString()
      //排序方式
      queryParams.orderBy = sort +" "+ order;
    }
  }else {
    //排序字段
    let sort = column.prop;
    //排序方式
    queryParams.orderBy = sort +" "+ order;
  }
  console.log("排序方式："+queryParams.orderBy)
}
