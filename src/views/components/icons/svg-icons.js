// const req = require.context('../../../assets/icons/svg', false, /\.svg$/)
// const requireAll = requireContext => requireContext.keys()

// const re = /\.\/(.*)\.svg/

// const svgIcons = requireAll(req).map(i => {
//   return i.match(re)[1]
// })

import json from '@/assets/icons/iconfont.json';
const map = json.glyphs.map((item) => item.font_class);

export default map;
