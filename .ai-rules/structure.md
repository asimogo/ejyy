---
title: 项目结构指南
description: "「e家宜业」项目的目录结构、代码组织和开发规范"
inclusion: always
---

# 「e家宜业」项目结构指南

## 项目整体结构

```
ejyy/
├── .git/                    # Git版本控制
├── .ai-rules/              # AI开发指导文件
├── api-server/             # 后端API服务器
├── console-web/            # Web管理控制台
├── owner-mp/               # 业主小程序
├── property-mp/            # 物业管理小程序
├── resources/              # 静态资源和数据库文件
├── .ejyyrc                 # 后端配置文件 (需要创建)
├── .gitignore             # Git忽略文件
├── CLAUDE.md              # AI开发指导
├── LICENSE                # AGPL v3开源协议
└── README.MD              # 项目说明文档
```

## 后端服务器结构 (api-server/)

### 目录组织
```
api-server/
├── src/                    # TypeScript源代码
│   ├── app.ts             # 应用程序入口点
│   ├── config.ts          # 配置文件解析和管理
│   ├── constant/          # 常量定义
│   │   ├── achieve.ts     # 成就相关常量
│   │   ├── community.ts   # 社区相关常量
│   │   ├── complain.ts    # 投诉相关常量
│   │   ├── fee.ts         # 费用相关常量
│   │   ├── fitment.ts     # 装修相关常量
│   │   ├── notice.ts      # 通知相关常量
│   │   └── ...            # 其他业务常量
│   ├── middleware/        # Koa中间件
│   │   ├── model.ts       # 数据模型注入中间件
│   │   ├── ip.ts          # IP地址记录中间件
│   │   ├── header.ts      # HTTP头处理中间件
│   │   ├── watcher.ts     # 请求监控中间件
│   │   └── init.ts        # 初始化中间件
│   ├── model/             # 数据模型定义
│   │   └── index.ts       # Knex数据库实例
│   ├── module/            # 业务模块 (按端分组)
│   │   ├── mp/           # 小程序相关接口
│   │   │   ├── index.ts   # 小程序路由入口
│   │   │   ├── auth/      # 认证相关
│   │   │   ├── service/   # 服务请求
│   │   │   └── ...        # 其他小程序功能
│   │   ├── pc/           # Web端接口
│   │   │   ├── index.ts   # Web端路由入口
│   │   │   ├── user/      # 用户管理
│   │   │   ├── community/ # 社区管理
│   │   │   └── ...        # 其他Web功能
│   │   ├── oa/           # 微信公众号接口
│   │   │   ├── index.ts   # 公众号路由入口
│   │   │   └── ...        # 公众号相关功能
│   │   └── notify/        # 第三方回调接口
│   │       ├── index.ts   # 回调路由入口
│   │       ├── wechat/    # 微信回调
│   │       └── ...        # 其他回调
│   ├── schedule/          # 定时任务
│   │   ├── index.ts       # 任务调度入口
│   │   ├── community.ts   # 社区相关任务
│   │   └── ...            # 其他定时任务
│   ├── service/           # 业务服务层
│   │   ├── access.ts      # 权限服务
│   │   ├── community.ts   # 社区服务
│   │   ├── fee.ts         # 费用服务
│   │   ├── pay.ts         # 支付服务
│   │   ├── wechat.ts      # 微信服务
│   │   ├── workflow.ts    # 工作流服务
│   │   └── ...            # 其他业务服务
│   ├── store/             # 数据存储
│   │   └── mysql-session.ts # MySQL会话存储
│   ├── types/             # TypeScript类型定义
│   │   ├── content.ts     # 内容类型
│   │   ├── model.ts       # 模型类型
│   │   └── ...            # 其他类型定义
│   ├── utils/             # 工具函数
│   │   ├── crypto.ts      # 加密解密
│   │   ├── validator.ts   # 数据验证
│   │   ├── uploader.ts    # 文件上传
│   │   └── ...            # 其他工具
│   └── wss/               # WebSocket服务
│       └── index.ts       # WebSocket处理
├── node_modules/          # 依赖包 (git忽略)
├── dist/                  # 构建输出 (git忽略)
├── package.json           # NPM配置
├── tsconfig.json          # TypeScript配置
└── webpack.config.js      # Webpack构建配置
```

### 模块别名配置
```javascript
// package.json中的模块别名
"_moduleAliases": {
  "~": "src/"
}
```
在代码中可以使用`~/service/xxx`代替相对路径。

### 关键文件说明

#### 应用入口 (app.ts)
- Koa应用初始化
- 中间件注册顺序
- 路由模块挂载
- WebSocket服务启动
- 定时任务启动

#### 配置管理 (config.ts)
- .ejyyrc配置文件解析
- 默认配置合并
- 数据库连接配置
- 微信等第三方服务配置

#### 数据库约定
- BLOB类型字段名为'content'的自动解析为JSON
- 所有时间戳使用bigint(13)存储毫秒时间戳
- 主键统一使用bigint(20)
- 字符编码统一使用utf8mb4

## Web控制台结构 (console-web/)

### 目录组织
```
console-web/
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── main.js           # Vue应用入口
│   ├── App.vue           # 根组件
│   ├── config.js         # 前端配置
│   ├── assets/           # 静态资源
│   │   ├── fonts/        # 字体文件
│   │   ├── images/       # 图片资源
│   │   └── icons/        # 图标资源
│   ├── components/       # 通用组件
│   │   ├── common/       # 基础组件
│   │   ├── layout/       # 布局组件
│   │   ├── charts/       # 图表组件
│   │   └── ...           # 其他组件分类
│   ├── constants/        # 前端常量
│   │   ├── options.js    # 选项配置
│   │   └── ...           # 其他常量
│   ├── mixins/           # Vue混入
│   │   ├── common.js     # 通用混入
│   │   └── ...           # 特定功能混入
│   ├── router/           # Vue Router配置
│   │   └── index.js      # 路由定义
│   ├── store/            # Vuex状态管理
│   │   ├── index.js      # Store入口
│   │   └── modules/      # 模块化Store
│   ├── styles/           # 样式文件
│   │   ├── base.less     # 基础样式
│   │   ├── theme.less    # 主题样式
│   │   └── ...           # 其他样式文件
│   ├── utils/            # 工具函数
│   │   ├── request.js    # HTTP请求封装
│   │   ├── auth.js       # 认证工具
│   │   ├── storage.js    # 存储工具
│   │   └── ...           # 其他工具
│   └── views/            # 页面组件
│       ├── login/        # 登录页面
│       ├── dashboard/    # 仪表板
│       ├── community/    # 社区管理
│       ├── user/         # 用户管理
│       ├── property/     # 物业管理
│       └── ...           # 其他页面模块
├── node_modules/         # 依赖包 (git忽略)
├── dist/                 # 构建输出 (git忽略)
├── package.json          # NPM配置
├── vue.config.js         # Vue CLI配置
└── .eslintrc.js          # ESLint配置
```

### 关键配置文件

#### 前端配置 (config.js)
```javascript
export const HOST_NAME = '';      // API服务器地址
export const ASSET_HOST = '';     // 资源文件地址
export const MAP_KEY = '';        // 地图API密钥
export const TOKEN_ID = 'EJYY_PC_TOKEN';    // 用户token存储键
export const USER_ID = 'EJYY_PC_USER_ID';   // 用户ID存储键
```

#### Vue CLI配置特点
- 使用Legacy OpenSSL Provider (兼容老版本Node.js)
- 集成cwfont字体编译工具
- Less预处理器支持
- ESLint + Prettier代码规范

## 小程序结构

### 业主小程序 (owner-mp/) 和 物业小程序 (property-mp/)

```
小程序目录/
├── src/                   # 源代码
│   ├── app.js            # 小程序入口逻辑
│   ├── app.json          # 小程序全局配置
│   ├── app.wxss          # 小程序全局样式
│   ├── config.js         # 小程序配置文件
│   ├── assets/           # 静态资源
│   │   ├── icons/        # 图标资源
│   │   └── images/       # 图片资源
│   ├── components/       # 自定义组件
│   │   ├── common/       # 通用组件
│   │   ├── layout/       # 布局组件
│   │   └── ...           # 其他组件分类
│   ├── custom-tab-bar/   # 自定义tabBar
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── libs/             # 第三方库
│   │   └── ...           # 引入的第三方代码
│   ├── pages/            # 页面目录
│   │   ├── index/        # 首页
│   │   ├── user/         # 用户相关
│   │   ├── service/      # 服务相关
│   │   └── ...           # 其他页面
│   ├── utils/            # 工具函数
│   │   ├── request.js    # 网络请求封装
│   │   ├── storage.js    # 本地存储
│   │   ├── auth.js       # 认证相关
│   │   └── ...           # 其他工具
│   └── sitemap.json      # 搜索优化配置
├── project.config.json   # 开发者工具项目配置
├── project.private.config.json # 私有项目配置
└── package.json          # 依赖配置
```

### 小程序配置约定

#### 配置文件 (config.js)
```javascript
export const API_HOST = '';        // API服务器地址
export const ASSETS_HOST = '';     // 资源服务器地址  
export const TOKEN_NAME = 'EJYY-TOKEN';   // token存储键名
export const USER_ID = 'USER_ID';         // 用户ID存储键名
export const VERSION = '1.1.10';          # 版本号
```

#### 页面结构约定
每个页面包含4个文件：
- `.js` - 页面逻辑
- `.json` - 页面配置
- `.wxml` - 页面结构
- `.wxss` - 页面样式

## 静态资源目录 (resources/)

```
resources/
├── db.sql                # 数据库结构文件
├── default.png           # 默认图片
├── images/               # 图片资源库
│   ├── building/         # 建筑相关图片
│   ├── service/          # 服务相关图片
│   └── ...               # 其他分类图片
└── 固定资产导入模板.xlsx  # Excel模板文件
```

## 开发规范

### 文件命名约定
- **后端文件**: 使用小写字母和下划线 (snake_case)
- **前端文件**: 使用小写字母和连字符 (kebab-case)
- **组件文件**: 使用大写字母开头的驼峰 (PascalCase)
- **工具函数**: 使用小写字母驼峰 (camelCase)

### 目录结构原则
1. **按功能模块分组**: 相关功能放在同一目录
2. **分层清晰**: model、service、controller分离
3. **通用组件独立**: common目录存放可复用代码
4. **配置集中管理**: 配置文件统一存放和命名

### 代码组织规范
1. **导入顺序**: 第三方库 -> 项目内部模块 -> 相对路径文件
2. **函数排序**: 主函数在前，辅助函数在后
3. **注释规范**: 重要业务逻辑必须添加注释
4. **错误处理**: 统一的错误处理机制

### Git提交规范
- 提交信息使用中文
- 遵循格式: `类型: 简短描述`
- 类型包括: 新增、修复、更新、重构等

## 关键配置文件位置

### 后端配置
- `/Users/asimo/ejyy/.ejyyrc` - 主配置文件 (需要手动创建)
- `/Users/asimo/ejyy/api-server/src/config.ts` - 配置解析逻辑

### 前端配置
- `/Users/asimo/ejyy/console-web/src/config.js` - Web端配置
- `/Users/asimo/ejyy/owner-mp/src/config.js` - 业主小程序配置
- `/Users/asimo/ejyy/property-mp/src/config.js` - 物业小程序配置

### 构建配置
- `/Users/asimo/ejyy/api-server/webpack.config.js` - 后端打包配置
- `/Users/asimo/ejyy/console-web/vue.config.js` - 前端构建配置

这种结构设计保证了代码的可维护性和扩展性，同时遵循了各技术栈的最佳实践。