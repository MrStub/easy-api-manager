# API Manager

面向业务同学的简单接口调试工具，支持请求配置、JSON 参数编辑和响应结果可视化。

## 技术栈

- **Vue 2.6** + **Vuex 3.x** — 前端框架与状态管理
- **Element UI 2.x** — UI 组件库
- **Axios** — HTTP 请求

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 8081）
npm run serve

# 构建生产版本
npm run build
```

## 功能

- **接口选择**：内置获取页面查询条件、获取接口出参字段、查询分红列表三个 Mock 接口，也可自行输入 URL
- **请求配置**：支持 GET/POST 请求方式，JSON 请求体
- **JSON 参数编辑器**：以 JSON 格式编辑请求参数，自动解析为参数列表
- **结果展示**：支持表格视图和原始 JSON 视图切换
- **分页**：对返回的分页数据提供分页导航

## 项目结构

```
api-manager
├── public/
│   └── index.html            # HTML 入口
├── src/
│   ├── api/
│   │   └── request.js         # Axios 实例（15s 超时）
│   ├── components/
│   │   ├── ApiInfoCard.vue    # 接口信息卡片（名称、URL、请求方式）
│   │   ├── JsonEditor.vue     # JSON 编辑器
│   │   ├── PaginationBar.vue  # 分页栏
│   │   ├── RequestParamsCard.vue  # 请求参数卡片
│   │   ├── ResultCard.vue     # 响应结果卡片（表格/JSON 切换）
│   │   └── SimpleTable.vue    # 通用表格组件
│   ├── mock/
│   │   └── mockResponses.js   # Mock 数据（查询条件、字段元数据、分红列表）
│   ├── store/
│   │   ├── index.js           # Vuex Store 入口
│   │   └── modules/
│   │       └── apiTester.js   # 接口测试状态管理（请求、解析、分页）
│   ├── utils/
│   │   ├── fieldMap.js        # 字段名映射
│   │   ├── json.js            # JSON 解析与参数构建
│   │   └── responseParser.js  # 响应数据解析（动态列生成、表格数据提取）
│   ├── views/
│   │   └── ApiTester.vue      # 主页面
│   ├── App.vue
│   └── main.js                # 应用入口（挂载 Vue、Element UI）
├── babel.config.js
├── vue.config.js              # Vue CLI 配置（代理、端口 8081）
└── package.json
```

## 开发说明

开发服务器运行在 `http://localhost:8081`，并通过 `/proxy-api` 前缀将请求代理至 `http://localhost:8080`。Mock 接口以 `mock://` 协议开头，由 `mockResponses.js` 拦截处理。
