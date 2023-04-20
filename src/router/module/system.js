import Layout from '@/layout';

export default [
  {
    path: '/system/org/detail/:orgId(\\d+)',
    component: Layout,
    hidden: true,
    permissions: ['system:org:detail'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/system/org/detail'),
        name: 'OrgDetail',
        meta: { title: '组织管理详情', activeMenu: '/system/org/detail' },
      },
    ],
  },

  {
    path: '/system/people/detail/:peopleId(\\d+)',
    component: Layout,
    hidden: true,
    permissions: ['system:people:detail'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/system/people/detail'),
        name: 'PeopleDetail',
        meta: { title: '个体管理详情', activeMenu: '/system/people/detail' },
      },
    ],
  },
];
