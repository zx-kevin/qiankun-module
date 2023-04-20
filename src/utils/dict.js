import useDictStore from '@/store/modules/dict';
import { getDicts } from '@/api/module/system/dict/data';

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = [];
      const dicts = useDictStore().getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else {
        getDicts(dictType).then((resp) => {
          res.value[dictType] = resp.data.map((p) => ({
            label: p.dictLabel,
            value: p.dictValue,
            elTagType: p.listClass,
            elTagClass: p.cssClass,
          }));
          useDictStore().setDict(dictType, res.value[dictType]);
        });
      }
    });
    return toRefs(res.value);
  })();
}

/**
 * 获取字典数据
 */
export function getDictSync(...args) {
  return new Promise(async (resolve, reject) => {
    const res = {};
    for (let index = 0; index < args.length; index++) {
      const dictType = args[index];
      let dicts = (await useDictStore().getDict(dictType)) || [];
      if (!dicts.length) {
        const dictRes = await getDicts(dictType).catch(() => {});
        if (dictRes && dictRes.code === 200) {
          const { data } = dictRes;
          dicts = data.map((p) => ({
            label: p.dictLabel,
            value: p.dictValue,
            elTagType: p.listClass,
            elTagClass: p.cssClass,
          }));
        }
      }
      res[dictType] = dicts;
      useDictStore().setDict(dictType, res[dictType]);
    }
    resolve(res);
  });
}

/**
 * @description: 根据label获取字典值
 * @param {Array | String} dict  目标字典
 * @param {*} label 字典label
 * @return {*}
 */
export function getDict(dict, label) {
  return new Promise(async (resolve) => {
    let dictFormat = [];
    if (typeof dict === 'string') {
      dictFormat = (await getDictSync(dict))?.[dict] || [];
    } else {
      dictFormat = dict;
    }

    resolve(dictFormat?.find((item) => item.label === label)?.value ?? '');
  });
}
