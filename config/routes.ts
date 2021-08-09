export const routes = [
    {
        path: '/user',
        // component: '../layouts/UserLayout',
        routes: [
            {
                name: 'login',
                path: '/user/login',
                component: './user/login2',
            },
        ],
    },
    {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
            {
                path: '/',
                component: '../layouts/BasicLayout',
                Routes: ['src/pages/Authorized'],
                routes: [
                    {
                        path: '/',
                        redirect: '/map',

                    },
                    {
                        name: '电子地图',
                        path: '/map',
                        icon: 'table',
                        tenant: ['admin', 'member'],
                        iconfont: 'icon-tongjifenxi',
                        component: './map'
                    },
                    {
                        name: '定位管理',
                        path: 'location',
                        icon: 'borderOuter',
                        tenant: ['admin', 'member'],
                        iconfont: 'icon-shezhi',
                        // authority: ['location-user', 'location-visitor', 'location-fence', 'location-trajectory', 'access-logger', 'member', 'admin'],
                        routes: [
                            {
                                path: '/location/user',
                                name: '人员信息',
                                iconfont: 'icon-yonghuguanli',
                                icon: 'user',
                                // authority: ['location-user', 'access-logger', 'member', 'admin'],
                                component: './location/users',
                            },
                          {
                            hideInMenu: true,
                            path: '/location/user/detail',
                            name: '绑卡记录',
                            // authority: ['location-user', 'access-logger', 'admin'],
                            component: './location/users/Carddetail',
                          },
                          {
                            hideInMenu: true,
                            path: '/location/user/path',
                            name: '路径规划',
                            // authority: ['location-user', 'access-logger', 'admin'],
                            component: './location/users/Cardpath',
                          },
                          {
                            path: '/location/visitor',
                            name: '访客信息',
                            iconfont: 'icon-erji-zuhuguanli',
                            icon: 'userDelete',
                            // authority: ['location-visitor', 'access-logger', 'admin'],
                            component: './location/visitors',
                          },
                          {
                            hideInMenu: true,
                            path: '/location/visitor/detail',
                            name: '绑卡记录',
                            // authority: ['location-visitor', 'access-logger', 'admin'],
                            component: './location/visitors/Carddetail',
                          },
                          {
                            path: '/location/fence',
                            name: '电子围栏',
                            iconfont: 'icon-hangweiguizeshili',
                            icon: 'block',
                            // authority: ['location-fence', 'access-logger', 'admin'],
                            component: './location/fence',
                          },
                            {
                                path: '/location/trajectory',
                                name: '轨迹查询',
                                iconfont: 'icon-diliweizhi',
                                icon: 'compass',
                                // authority: ['location-trajectory', 'access-logger', 'admin'],
                                component: './location/trajectory',
                            },
                        ]
                    },
                    {
                        name: '统计分析',
                        path: '/analysis',
                        icon: 'dashboard',
                        tenant: ['admin', 'member'],
                        iconfont: 'icon-tongjifenxi',
                        component: './analysis',
                        version: 'pro',
                    },
                    {
                        path: 'system',
                        name: '系统设置',
                        iconfont: 'icon-shezhi',
                        icon: 'setting',
                        tenant: ['member', 'admin'],
                        authority: ['user1', 'permission', 'organization', 'dictionary', 'open-api', 'admin', 'system-config', 'dimension', 'tenant-side-manager', 'tenant-manager'],
                        routes: [
                            {
                                path: '/system/user',
                                name: '用户管理',
                                iconfont: 'icon-yonghuguanli',
                                icon: 'user',
                                authority: ['user1', 'admin'],
                                component: './system/users',
                            },
                            {
                                path: '/system/permission',
                                name: '权限管理',
                                icon: 'key',
                                iconfont: 'icon-quanxianguanli',
                                authority: ['permission', 'admin'],
                                component: './system/permission',
                            },
                            // {
                            //     path: '/system/open-api',
                            //     name: '第三方平台',
                            //     icon: 'share-alt',
                            //     iconfont: 'icon-APIguanli',
                            //     authority: ['open-api', 'admin'],
                            //     version: 'pro',
                            //     component: './system/open-api',
                            // },
                            // {
                            //     path: '/system/org',
                            //     name: '机构管理',
                            //     icon: 'apartment',
                            //     iconfont: 'icon-jigoubianzhi',
                            //     authority: ['organization', 'admin'],
                            //     component: './system/org',
                            // },
                            {
                                path: '/system/role',
                                name: '角色管理',
                                icon: 'usergroup-add',
                                iconfont: 'icon-jiaoseguanli1',
                                authority: ['dimension', 'admin'],
                                component: './system/role',
                            },
                            {
                                path: '/system/config',
                                name: '系统配置',
                                icon: 'tool',
                                iconfont: 'icon-xitongpeizhi',
                                authority: ['system-config', 'admin'],
                                component: './system/config',
                            },
                            // {
                            //     path: '/system/tenant',
                            //     name: '租户管理',
                            //     icon: 'team',
                            //     iconfont: 'icon-erji-zuhuguanli',
                            //     tenant: ['admin'],
                            //     authority: ['tenant-side-manager', 'tenant-manager', 'admin'],
                            //     version: 'pro',
                            //     component: './system/tenant'
                            // },
                            // {
                            //     hideInMenu: true,
                            //     path: '/system/tenant/detail/:id',
                            //     name: '租户详情',
                            //     tenant: ['admin'],
                            //     authority: ['tenant-side-manager', 'tenant-manager', 'admin'],
                            //     version: 'pro',
                            //     component: './system/tenant/detail',
                            // },
                        ],
                    },
                    {
                        path: 'device',
                        name: '设备管理',
                        icon: 'box-plot',
                        tenant: ['admin', 'member'],
                        iconfont: 'icon-device-manage',
                        authority: ['device-product', 'device-instance', 'device-category', 'device-group', 'device-gateway', 'geo-manager', 'firmware-manager', 'device-alarm', 'admin'],
                        routes: [
                            {
                                path: '/device/product',
                                name: '产品管理',
                                icon: 'laptop',
                                iconfont: 'icon-shebei',
                                tenant: ['admin', 'member'],
                                authority: ['device-product', 'admin'],
                                component: './device/product',
                            },
                            {
                                path: '/device/product-category',
                                name: '产品分类',
                                icon: 'appstore',
                                iconfont: 'icon-shebei',
                                tenant: ['admin', 'member'],
                                version: 'pro',
                                authority: ['device-category', 'admin'],
                                component: './device/product-category',
                            },
                            {
                                hideInMenu: true,
                                path: '/device/product/save/:id',
                                name: '产品详情',
                                tenant: ['admin', 'member'],
                                iconfont: 'icon-shebei',
                                authority: ['device-product', 'admin'],
                                component: './device/product/save/Detail',
                            },
                            {
                                hideInMenu: true,
                                path: '/device/product/add',
                                name: '新建产品',
                                tenant: ['admin', 'member'],
                                iconfont: 'icon-shebei',
                                authority: ['device-product', 'admin'],
                                component: './device/product/save/add/index.tsx',
                            },
                            {
                                path: '/device/instance',
                                name: '设备',
                                icon: 'desktop',
                                tenant: ['admin', 'member'],
                                iconfont: 'icon-shebei1',
                                authority: ['device-instance', 'admin'],
                                component: './device/instance',
                            },
                            {
                                hideInMenu: true,
                                path: '/device/instance/save/:id',
                                name: '设备详情',
                                tenant: ['admin', 'member'],
                                iconfont: 'icon-shebei1',
                                authority: ['device-instance', 'admin'],
                                component: './device/instance/editor',
                            },
                            {
                                hideInMenu: true,
                                path: '/device/group',
                                name: '分组',
                                icon: 'gold',
                                tenant: ['admin', 'member'],
                                authority: ['device-group', 'admin'],
                                version: 'pro',
                                iconfont: 'icon-shebeifenzuguanli',
                                component: './device/group',
                            },
                            {
                                // hideInMenu: true,
                                path: '/device/tree',
                                name: '分组',
                                tenant: ['admin', 'member'],
                                authority: ['device-group', 'admin'],
                                version: 'pro',
                                icon: 'gold',
                                component: './device/tree'
                            },
                            {
                                hideInMenu: true,
                                path: '/device/tree/detail',
                                name: '分组详情',
                                authority: ['device-group', 'admin'],
                                component: './device/tree/DeviceTree',
                            },
                            {
                                hideInMenu: true,
                                path: '/device/instance/add',
                                name: '添加设备',
                                tenant: ['admin', 'member'],
                                authority: ['device-instance', 'admin'],
                                iconfont: 'icon-shebeifenzuguanli',
                                component: './device/instance/editor',
                            },
                            {
                                path: '/device/gateway',
                                name: '网关管理',
                                icon: 'global',
                                tenant: ['admin', 'member'],
                                iconfont: 'icon-Group',
                                authority: ['device-gateway', 'admin'],
                                component: './device/gateway',
                            },
                            {
                                path: '/device/location',
                                name: '地理位置',
                                icon: 'compass',
                                tenant: ['admin'],
                                authority: ['geo-manager', 'admin'],
                                version: 'pro',
                                iconfont: 'icon-diliweizhi',
                                component: './device/location',
                            },
                            {
                                path: '/device/firmware',
                                name: '固件升级',
                                icon: 'cloud-sync',
                                tenant: ['admin', 'member'],
                                authority: ['firmware-manager', 'admin'],
                                version: 'pro',
                                iconfont: 'icon-gujianshengji',
                                component: './device/firmware',
                            },
                            {
                                hideInMenu: true,
                                tenant: ['admin', 'member'],
                                path: '/device/firmware/save/:id',
                                name: '固件详情',
                                authority: ['firmware-manager', 'admin'],
                                iconfont: 'icon-gujianshengji',
                                component: './device/firmware/editor',
                            },
                            {
                                path: '/device/alarm',
                                name: '设备告警',
                                icon: 'alert',
                                tenant: ['admin', 'member'],
                                authority: ['device-alarm', 'admin'],
                                component: './device/alarmlog',
                            },
                            {
                                path: '/device/alarm-product',
                                name: '批量设置',
                                icon: 'alert',
                                tenant: ['admin', 'member'],
                                authority: ['device-alarm', 'admin'],
                                component: './device/alarm-product',
                            },
                            {
                                path: '/device/alarm-device',
                                name: '单项设置',
                                icon: 'alert',
                                tenant: ['admin', 'member'],
                                authority: ['device-alarm', 'admin'],
                                component: './device/alarm-device',
                            }
                        ],
                    },
                    {
                        path: 'network',
                        name: '设备接入',
                        iconfont: 'icon-shebei',
                        icon: 'login',
                        authority: ['certificate', 'network-config', 'device-gateway', 'protocol-supports', 'admin'],
                        routes: [
                            // {
                            //     path: '/network/certificate',
                            //     name: '证书管理',
                            //     icon: 'book',
                            //     iconfont: 'icon-zhengshuguanli-',
                            //     authority: ['certificate', 'admin'],
                            //     component: './network/certificate',
                            // },
                            {
                                path: '/network/protocol',
                                name: '协议管理',
                                icon: 'wallet',
                                iconfont: 'icon-xieyiguanli',
                                authority: ['protocol-supports', 'admin'],
                                component: './device/protocol',
                            },
                            {
                                path: '/network/type',
                                name: '网络组件',
                                icon: 'deployment-unit',
                                iconfont: 'icon-zujian',
                                authority: ['network-config', 'admin'],
                                component: './network/type',
                            },
                            {
                                path: '/network/gateway',
                                name: '设备网关',
                                icon: 'cloud-server',
                                iconfont: 'icon-shebei',
                                authority: ['device-gateway', 'admin'],
                                component: './network/gateway',
                            },
                          {
                            path: '/network/access',
                            name: '接入管理',
                            version: 'pro',
                            icon: 'cloud-server',
                            iconfont: 'icon-shebei',
                            authority: ['device-gateway', 'admin'],
                            component: './network/access',
                          },
                        ],
                    },
                    // {
                    //     path: 'notice',
                    //     name: '通知管理',
                    //     iconfont: 'icon-tongzhiguanli',
                    //     icon: 'message',
                    //     tenant: ['admin', 'member'],
                    //     authority: ['template', 'notifier', 'admin'],
                    //     routes: [
                    //         {
                    //             path: '/notice/config',
                    //             name: '通知配置',
                    //             icon: 'alert',
                    //             tenant: ['admin', 'member'],
                    //             iconfont: 'icon-SUI_tongzhipeizhi',
                    //             authority: ['notifier', 'admin'],
                    //             component: './notice/config',
                    //         },
                    //         {
                    //             path: '/notice/template',
                    //             name: '通知模版',
                    //             icon: 'bell',
                    //             tenant: ['admin', 'member'],
                    //             iconfont: 'icon-tongzhiguanli',
                    //             authority: ['template', 'admin'],
                    //             component: './notice/template',
                    //         },
                    //     ],
                    // },
                    // {
                    //     path: 'rule-engine',
                    //     name: '规则引擎',
                    //     icon: 'retweet',
                    //     iconfont: 'icon-guizeyinqing',
                    //     tenant: ['admin'],
                    //     authority: ['rule-instance', 'rule-scene', 'admin'],
                    //     routes: [
                            // {
                            //     path: '/rule-engine/model',
                            //     name: '规则模型',
                            //     icon: 'gateway',
                            //     tenant: ['admin'],
                            //     iconfont: 'icon-xian-buguize-moxing',
                            //     authority: ['rule-model', 'admin'],
                            //     version: 'pro',
                            //     component: './rule-engine/model',
                            // },
                            // {
                            //     path: '/rule-engine/instance',
                            //     name: '规则实例',
                            //     icon: 'block',
                            //     tenant: ['admin'],
                            //     iconfont: 'icon-hangweiguizeshili',
                            //     authority: ['rule-instance', 'admin'],
                            //     version: 'pro',
                            //     component: './rule-engine/instance',
                            // },
                            // {
                            //     path: '/rule-engine/sqlRule',
                            //     name: '数据转发',
                            //     icon: 'rise',
                            //     tenant: ['admin'],
                            //     iconfont: 'icon-datatransfer',
                            //     authority: ['rule-instance', 'admin'],
                            //     component: './rule-engine/sqlRule',
                            // },
                            // {
                            //     path: '/rule-engine/scene',
                            //     name: '场景联动',
                            //     icon: 'codeSandbox',
                            //     authority: ['rule-scene', 'admin'],
                            //     version: 'pro',
                            //     component: './rule-engine/scene'
                            // }
                            // {
                            //   path: '/rule-engine/email',
                            //   name: 'email',
                            //   icon: 'mail',
                            //   component: './rule-engine/email',
                            // },
                            // {
                            //   path: '/rule-engine/sms',
                            //   name: 'sms',
                            //   icon: 'message',
                            //   component: './rule-engine/sms',
                            // },
                    //     ],
                    // },
                    {
                        path: 'data-screen',
                        name: '可视化',
                        icon: 'desktop',
                        tenant: ['admin'],
                        iconfont: 'icon-icon-',
                        version: 'pro',
                        authority: ['big-screen', 'admin', 'vis-configuration'],
                        routes: [
                            {
                                path: '/data-screen/category',
                                name: '分类管理',
                                icon: 'appstore',
                                tenant: ['admin'],
                                iconfont: 'icon-category-search-fill',
                                authority: ['big-screen', 'admin'],
                                version: 'pro',
                                component: './data-screen/category',
                            },
                            {
                                path: '/data-screen/screen',
                                name: '大屏管理',
                                icon: 'fund',
                                tenant: ['admin', 'big-screen'],
                                iconfont: 'icon-screen',
                                authority: ['big-screen', 'admin'],
                                version: 'pro',
                                component: './data-screen/screen',
                            },
                            {
                                path: '/data-screen/configuration',
                                name: '组态管理',
                                icon: 'fund',
                                iconfont: 'icon-screen',
                                authority: ['vis-configuration', 'admin'],
                                version: 'pro',
                                component: './data-screen/visConfiguration',
                            }
                        ]
                    },
                    {
                        path: 'simulator',
                        name: '模拟测试',
                        icon: 'bug',
                        version: 'pro',
                        authority: ['network-simulator', 'admin'],
                        routes: [
                            {
                                path: '/simulator/device',
                                name: '设备模拟器',
                                version: 'pro',
                                icon: 'paper-clip',
                                authority: ['network-simulator', 'admin'],
                                component: './simulator/device',
                            }
                        ]
                    },
                    {
                        path: 'logger',
                        name: '日志管理',
                        icon: 'calendar',
                        iconfont: 'icon-rizhiguanli',
                        authority: ['system-logger', 'access-logger', 'admin'],
                        routes: [
                            {
                                path: '/logger/access',
                                name: '访问日志',
                                icon: 'dash',
                                iconfont: 'icon-yonghufangwenrizhi',
                                authority: ['access-logger', 'admin'],
                                component: './logger/access',
                            },
                            {
                                path: '/logger/system',
                                name: '系统日志',
                                icon: 'ordered-list',
                                iconfont: 'icon-xitongrizhi',
                                authority: ['system-logger', 'admin'],
                                version: 'pro',
                                component: './logger/system',
                            },
                        ],
                    },
                    {
                        path: 'cloud',
                        name: '云云对接',
                        icon: 'cloud',
                        version: 'pro',
                        authority: ['dueros-product', 'aliyun-bridge', 'onenet-product', 'ctwing-product', 'admin'],
                        routes: [
                            {
                                path: '/cloud/duer',
                                name: 'DuerOS',
                                version: 'pro',
                                authority: ['dueros-product', 'admin'],
                                icon: 'cloud',
                                component: './cloud/dueros',
                            },
                            {
                                path: '/cloud/aliyun',
                                name: '阿里云',
                                version: 'pro',
                                authority: ['aliyun-bridge', 'admin'],
                                icon: 'aliyun',
                                component: './cloud/aliyun',
                            },
                            {
                                path: '/cloud/onenet',
                                name: '移动OneNet',
                                version: 'pro',
                                authority: ['onenet-product', 'admin'],
                                icon: 'mobile',
                                component: './cloud/onenet',
                            },
                            {
                                path: '/cloud/ctwing',
                                name: '电信CTWing',
                                version: 'pro',
                                authority: ['ctwing-product', 'admin'],
                                icon: 'phone',
                                component: './cloud/ctwing',
                            }
                        ]
                    },
                    {
                        path: 'media',
                        name: '国标网关',
                        icon: 'youtube',
                        version: 'pro',
                        authority: ['gb28181-gateway','media-channel','media-server','media-stream','gb28181-cascade','admin'],
                        routes: [
                            {
                                path: '/media/basic',
                                name: '基本配置',
                                version: 'pro',
                                authority: ['gb28181-gateway','media-server','admin'],
                                icon: 'video-camera',
                                component: './media/basic',
                            },
                            // {
                            //     path: '/media/media-server',
                            //     name: '流媒体服务',
                            //     version: 'pro',
                            //     authority: ['media-server','admin'],
                            //     icon: 'video-camera',
                            //     component: './media/media-server',
                            // },
                            // {
                            //     path: '/media/gateway',
                            //     name: '信令服务',
                            //     version: 'pro',
                            //     authority: ['gb28181-gateway','admin'],
                            //     icon: 'gateway',
                            //     component: './media/gateway',
                            // },
                            {
                                path: '/media/device',
                                name: '国标设备',
                                version: 'pro',
                                authority: ['media-device','admin'],
                                icon: 'gateway',
                                component: './media/device',
                            },
                            {
                                hideInMenu: true,
                                path: '/media/device/channel/:id',
                                name: '通道列表',
                                version: 'pro',
                                tenant: ['admin', 'member'],
                                iconfont: 'icon-shebei1',
                                component: './media/device/channel',
                            },
                            {
                                path: '/media/reveal',
                                name: '分屏展示',
                                version: 'pro',
                                authority: ['media-stream','admin'],
                                icon: 'appstore',
                                component: './media/reveal',
                            },
                            {
                                path: '/media/cascade',
                                name: '国标级联',
                                version: 'pro',
                                authority: ['gb28181-cascade','admin'],
                                icon: 'cloud-upload',
                                component: './media/cascade',
                            },
                        ]
                    },
                    {
                        path: 'account',
                        name: '个人中心',
                        icon: 'user',
                        hideInMenu: true,
                        routes: [
                            // {
                            //   path: '/account/center',
                            //   name: '个人中心',
                            //   icon: 'smile',
                            //   component: './account/center'
                            // },
                            {
                                path: '/account/settings',
                                name: '个人设置',
                                icon: 'setting',
                                component: './account/settings'
                            },
                            {
                                path: '/account/notification',
                                name: '通知订阅',
                                icon: 'bell',
                                component: './account/notification'
                            }
                        ]
                    },
                    // {
                    //   name: 'paramter',
                    //   path: '/properties',
                    //   inco: 'bar-chart',
                    //   component: './script-demo',
                    // },
                    {
                        name: 'exception',
                        icon: 'smile',
                        path: '/exception',
                        hideInMenu: true,
                        routes: [
                            {
                                path: './500',
                                name: '500',
                                component: './exception/500',
                            },
                            {
                                path: './404',
                                name: '404',
                                component: './exception/404',
                            },
                            {
                                path: './403',
                                name: '403',
                                component: './exception/403',
                            },
                        ],
                    },
                ],
            },
            {
                component: './404',
            },
        ],
    },
];
