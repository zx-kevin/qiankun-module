export const  featureLink = (target = {}, options = []) => {
  const typeMap = {
    gen: 'useFeatureCode',
    sql: 'sqlVariabel',
    api: 'sourceVariable',
  };
  const result = [];
  const list = JSON.parse(target[typeMap[target.featureType]] || '[]');
  if (!list.length) return result;
  const filter = options.filter((item) => list.includes(item.featureCode));
  result.push(...filter);
  filter.forEach((item) => result.push(...featureLink(item, options)));

  return result;
};