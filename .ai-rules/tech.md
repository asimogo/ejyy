---
title: 技术栈指南
description: "「e家宜业」项目的技术架构、开发环境和技术选型详细说明"
inclusion: always
---

# 「e家宜业」技术栈指南

## 项目架构概览

「e家宜业」采用前后端分离的多端架构，包含4个主要应用：

```
ejyy/
├── api-server/     # 后端API服务器 (Node.js + TypeScript + Koa)
├── console-web/    # Web管理控制台 (Vue.js 2 + view-design)  
├── owner-mp/       # 业主小程序 (微信小程序原生)
├── property-mp/    # 物业管理小程序 (微信小程序原生)
└── resources/      # 静态资源和数据库文件
```

## 后端技术栈 (api-server/)

### 核心框架
- **Node.js**: >=12.1.0 (运行环境)
- **TypeScript**: ^4.2.3 (开发语言)
- **Koa.js**: ^2.11.0 (Web框架)
- **Knex.js**: ^0.21.12 (数据库ORM)

### 数据存储
- **MySQL**: ^2.18.1 (主数据库)
- **Redis**: ^3.1.2 (会话存储、缓存)
- **MySQL Session Store**: 自定义会话存储

### 第三方服务集成
- **微信生态**:
  - 小程序SDK (业主端和物业端)
  - 公众号SDK
  - 微信支付API
- **阿里云服务**:
  - OSS对象存储 (文件上传)
  - 短信服务 (@alicloud/dysmsapi20170525)
- **其他服务**:
  - 地图服务集成
  - SMTP邮件服务

### 关键中间件和服务
- **WebSocket**: ^7.5.2 (实时通信)
- **定时任务**: node-schedule ^2.0.0
- **文件处理**: node-xlsx ^0.17.1
- **加密解密**: 内置crypto服务
- **日志系统**: chowa-log ^1.0.8

### 开发工具
```bash
# 开发命令
npm run dev    # 启动开发服务器 (nodemon + ts-node)
npm run lint   # TypeScript代码格式化 (prettier)
npm run dist   # 构建生产包 (webpack)
```

### 项目结构
```
api-server/src/
├── app.ts              # 应用入口
├── config.ts           # 配置管理 (.ejyyrc文件解析)
├── constant/           # 常量定义
├── middleware/         # Koa中间件
├── model/             # 数据模型定义
├── module/            # 业务模块
│   ├── mp/           # 小程序相关接口
│   ├── pc/           # Web端接口
│   ├── oa/           # 公众号接口  
│   └── notify/       # 回调通知接口
├── schedule/          # 定时任务
├── service/           # 业务服务层
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
└── wss/              # WebSocket服务
```

## 前端技术栈 (console-web/)

### 核心框架
- **Vue.js**: ^2.6.11 (主框架)
- **view-design**: ^4.4.0 (UI组件库，基于iView)
- **Vue Router**: ^3.2.0 (路由管理)
- **Vuex**: ^3.4.0 (状态管理)

### 开发环境
- **Vue CLI**: ~4.5.0 (构建工具)
- **Webpack**: 内置于Vue CLI
- **Less**: ^2.7.3 (CSS预处理器)
- **ESLint**: ^6.7.2 + Prettier (代码质量)

### 功能性依赖
- **图表**: ECharts ^5.0.0
- **富文本编辑器**: wangeditor ^4.7.6  
- **拖拽功能**: awe-dnd ^0.3.4
- **二维码**: qrcode ^1.4.4, jsqr ^1.4.0
- **文件处理**: spark-md5 ^3.0.1
- **地区数据**: area-data ^5.0.6
- **图片懒加载**: vue-lazyload ^1.3.3

### 开发命令
```bash
# 开发环境 (需要legacy OpenSSL支持)
npm run dev    # NODE_OPTIONS='--openssl-legacy-provider' vue-cli-service serve

# 生产构建
npm run dist   # 包含字体编译 + 构建

# 代码检查
npm run lint   # ESLint + Vue支持

# 字体编译
npm run iconfont  # cwfont compile (自定义字体)
```

### 项目结构
```
console-web/src/
├── main.js           # 应用入口
├── config.js         # 前端配置 (API地址等)
├── assets/           # 静态资源
├── components/       # 通用组件
├── constants/        # 常量定义
├── mixins/          # Vue混入
├── router/          # 路由配置
├── store/           # Vuex状态管理
├── styles/          # 全局样式 (LESS)
├── utils/           # 工具函数
└── views/           # 页面组件
```

## 小程序技术栈

### 业主小程序 (owner-mp/) 和物业小程序 (property-mp/)

#### 技术选型
- **微信小程序原生框架** (非uni-app等跨平台方案)
- **原生JavaScript** (ES6+)
- **微信小程序组件系统**

#### 开发工具
```bash
npm run lint  # prettier格式化JavaScript代码
```

#### 项目结构
```
owner-mp/src/
├── app.js              # 小程序入口
├── app.json            # 小程序配置
├── app.wxss            # 全局样式  
├── config.js           # 配置文件 (API地址等)
├── project.config.json # 开发者工具配置
├── assets/             # 静态资源
├── components/         # 自定义组件库
├── custom-tab-bar/     # 自定义tabBar
├── libs/               # 第三方库
├── pages/              # 页面目录
├── utils/              # 工具函数
└── sitemap.json        # 搜索优化
```

#### 小程序能力集成
- **微信授权登录**
- **微信支付**
- **扫码功能**
- **地理位置**
- **图片上传**
- **消息推送**

## 配置管理

### 后端配置 (.ejyyrc)
项目根目录需要创建YAML格式配置文件：
```yaml
# 数据库配置
mysql:
  host: localhost
  port: 3306
  user: root
  password: ''
  database: ejyy

# Redis配置  
redis:
  host: localhost
  port: 6379
  password: ''

# 微信配置
wechat:
  ump:         # 业主小程序
    appid: ''
    secret: ''
  pmp:         # 物业小程序  
    appid: ''
    secret: ''
  oa:          # 公众号
    appid: ''
    secret: ''
    token: ''
    key: ''
  pay:         # 微信支付
    mch_id: ''
    key: ''
    certPath: ''

# 阿里云服务
aliyun:
  accessKeyId: ''
  accessKeySecret: ''
  oss:
    bucket: ''
    region: ''

# 其他配置
map:
  key: ''      # 地图API密钥
smtp:          # 邮件配置
  host: ''
  user: ''
  password: ''
```

### 前端配置
- **console-web/src/config.js**: Web端API地址配置
- **owner-mp/src/config.js**: 业主小程序API配置  
- **property-mp/src/config.js**: 物业小程序API配置

## 开发环境要求

### 系统要求
- **Node.js**: >=12.1.0
- **npm**: >=6.9.0  
- **MySQL**: 5.7+
- **Redis**: 3.0+

### 开发工具建议
- **后端开发**: VS Code + TypeScript插件
- **前端开发**: VS Code + Vetur插件
- **小程序开发**: 微信开发者工具
- **数据库管理**: MySQL Workbench / Navicat

## 部署说明

### 后端部署
1. 安装依赖: `npm install`
2. 配置.ejyyrc文件
3. 构建项目: `npm run dist`  
4. 启动服务: `node dist/app.js`

### 前端部署
1. 安装依赖: `npm install`
2. 修改config.js配置API地址
3. 构建项目: `npm run dist`
4. 部署dist目录到Web服务器

### 小程序部署
1. 使用微信开发者工具打开项目
2. 修改config.js配置API地址
3. 上传代码到微信平台
4. 提交审核发布

## 重要技术约束

1. **不升级Node.js版本**: 保持在12.x版本范围
2. **不升级Vue版本**: 保持Vue 2.x，避免破坏性变更
3. **不更换UI框架**: 继续使用view-design，避免样式重构
4. **保持微信小程序原生**: 不迁移到其他小程序框架
5. **数据库结构谨慎变更**: 避免破坏现有数据