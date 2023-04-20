/*
 * @Author: K
 * @Date: 2023-02-22 18:19:20
 * @Descripttion: 路由 - 决策集
 * @FilePath: \decision_engine_ui\src\router\module\decision.js
 * @LastEditors: K
 * @LastEditTime: 2023-03-21 17:24:46
 */
import Layout from '@/layout';

export default [
  {
    path: '/decision/rule/create',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/rule/create'),
        name: 'decisionRuleCreate',
        meta: { title: '新增规则', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/rule/:decisionNo/update',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/rule/update'),
        name: 'decisionRuleUpdate',
        meta: { title: '修改规则', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/tree/:decisionNo/update',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/tree/update'),
        name: 'decisionTreeUpdate',
        meta: { title: '修改决策树', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/tree/create',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/tree/create'),
        name: 'decisionTreeCreate',
        meta: { title: '新增决策树', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/table/create',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/table/create'),
        name: 'decisionTableCreate',
        meta: { title: '新增决策表', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/table/:decisionNo/update',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/table/create'),
        name: 'decisionTableUpdate',
        meta: { title: '修改决策表', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/score/create',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/card/create'),
        name: 'decisionCardCreate',
        meta: { title: '新增评分卡', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/score/:decisionNo/update',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/card/create'),
        name: 'decisionCardUpdate',
        meta: { title: '修改评分卡', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/ml/create',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/ml/detail'),
        name: 'decisionMlCreate',
        meta: { title: '新增机器模型', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/ml/:decisionNo/update',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/ml/detail'),
        name: 'decisionMlUpdate',
        meta: { title: '修改机器模型', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/list/create',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/list/detail'),
        name: 'decisionListCreate',
        meta: { title: '新增名单库', activeMenu: '/decision' },
      },
    ],
  },
  {
    path: '/decision/list/:decisionNo/update',
    component: Layout,
    hidden: true,
    permissions: ['*:*:*'],
    children: [
      {
        path: '',
        component: () => import('@/views/module/decision/list/detail'),
        name: 'decisionListUpdate',
        meta: { title: '修改名单库', activeMenu: '/decision' },
      },
    ],
  },
];
