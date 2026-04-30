# API 请求测试

面向业务同学的简单接口调试工具，基于 `Vue 2 + Vuex + Element UI` 实现。

当前版本重点解决的是一条清晰的业务链路：

1. 页面启动后先拉取“可查询接口列表”
2. 选择接口后，自动拉取该接口的查询条件模板
3. 页面根据模板动态生成参数输入框
4. 点击“发送请求”后发起 `POST` 请求
5. 返回结果区优先展示返回报文里的 `list / records / rows`
6. JSON 视图保留服务端原始返回报文

## 当前功能

- 接口下拉选择
- 动态查询条件渲染
- 日期参数默认填充今天
- 必填参数校验
- 请求体控制台打印
- 返回结果表格展示
- 返回结果 JSON 展示
- 前端本地分页
- 嵌套对象 / 数组“查看详情”
- Excel 导出
- 手机 H5 / 微信 H5 基础兼容

## 当前内置 Mock

项目默认内置 4 类 mock，覆盖现在页面的主要展示路径：

- `查询交易详情（不分页示例 Mock）`
- `查询虚拟申购列表（分页示例 Mock）`
- `查询嵌套交易（Mock）`
- `查询超长列表（Mock）`

说明：

- “分页示例 Mock”返回分页字段 + `list`
- “不分页示例 Mock”返回普通头信息 + `list`
- “嵌套交易 Mock”用于验证对象 / 数组嵌套详情弹窗
- “超长列表 Mock”用于验证前端本地分页

## 返回结果展示规则

表格视图：

- 优先识别 `data.list`
- 其次识别 `data.records`
- 其次识别 `data.rows`
- 如果以上都不存在，再回退到对象三列表展示

JSON 视图：

- 始终展示接口原始返回报文

分页规则：

- 当前分页是前端本地分页
- 不会因为翻页重新请求接口
- 主要用于一次返回过长 `list` 的场景

嵌套字段规则：

- 值是对象或数组时，表格显示“查看详情”
- 详情弹窗内继续支持嵌套下钻
- 详情弹窗中的长列表同样支持本地分页

## Excel 导出规则

- 导出文件名：`交易名_时间戳.xlsx`
- 如果字段是对象或数组，会拆成新的 sheet
- 父 sheet 中通过“查看详情”超链接跳转到子 sheet
- 外层 sheet 永远在最左边
- 列宽自适应
- 单元格自动换行
- 超链接兼容 Office / WPS 蓝色下划线展示

微信 H5 说明：

- 微信内置浏览器对文件下载限制较多
- 当前已做降级兼容
- 若部分机型仍无法直接下载，可在浏览器中打开后再下载

## 技术栈

- `Vue 2.6`
- `Vuex 3`
- `Element UI 2`
- `Axios`
- `xlsx-js-style`

## 项目结构

```text
api-manager
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── request.js
│   ├── components/
│   │   ├── ApiInfoCard.vue
│   │   ├── JsonEditor.vue
│   │   ├── PaginationBar.vue
│   │   ├── RequestParamsCard.vue
│   │   ├── ResultCard.vue
│   │   └── SimpleTable.vue
│   ├── mixins/
│   │   └── viewport.js
│   ├── mock/
│   │   ├── mockInterfaces.js
│   │   └── mockResponses.js
│   ├── store/
│   │   ├── index.js
│   │   └── modules/
│   │       ├── apiTester.helpers.js
│   │       └── apiTester.js
│   ├── utils/
│   │   ├── excelExporter.js
│   │   ├── fieldMap.js
│   │   ├── json.js
│   │   ├── nestedData.js
│   │   └── responseParser.js
│   ├── views/
│   │   └── ApiTester.vue
│   ├── App.vue
│   └── main.js
├── 示例数据/
│   ├── 不分页请求.json
│   ├── 分页请求.json
│   └── 接口返回报文.txt
├── vue.config.js
├── package.json
└── README.md
```

## 本地启动

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run serve
```

默认地址：

```text
http://localhost:8081
```

## 构建打包

```bash
npm run build
```

打包输出目录：

```text
dist/
```

`vue.config.js` 已按 Spring Boot 静态资源嵌入方式配置：

```js
module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false
}
```

## Spring Boot 嵌入方式

构建后，将 `dist` 下所有文件复制到：

```text
src/main/resources/static/api-test/
```

访问地址：

```text
http://localhost:8080/api-test/index.html
```

如果希望通过：

```text
http://localhost:8080/api-test/
```

访问，可以在 Spring Boot 中增加转发：

```java
@Controller
public class ApiTestPageController {

    @GetMapping("/api-test")
    public String apiTest() {
        return "redirect:/api-test/";
    }

    @GetMapping("/api-test/")
    public String apiTestIndex() {
        return "forward:/api-test/index.html";
    }
}
```

## 开发环境代理与跨域

开发环境已内置代理配置：

```js
devServer: {
  port: 8081,
  proxy: {
    '/proxy-api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/proxy-api': ''
      }
    }
  }
}
```

说明：

- 本地联调时可以通过 `/proxy-api` 走代理，避免浏览器跨域
- 生产环境如果前后端同域部署，通常不需要额外处理
- 如果前端页面和真实接口仍然跨域，需要由后端开启 CORS，或通过网关 / Nginx / Spring Boot 代理转发

## 内网部署说明

打包后的静态资源不依赖外网 CDN：

- JS / CSS 为本地打包资源
- Element UI 图标字体为本地资源
- Excel 导出依赖已打入本地 chunk

需要访问外网的唯一情况，是接口列表下发的真实请求地址本身指向外网。

## 代码分层说明

为了方便后续接真实接口，当前代码做了下面几层划分：

- `mock/mockInterfaces.js`
  - 维护默认接口下拉清单
- `mock/mockResponses.js`
  - 维护查询条件模板与 mock 返回报文
- `store/modules/apiTester.helpers.js`
  - 维护查询表单、参数构建、校验等纯函数
- `store/modules/apiTester.js`
  - 只负责状态管理和请求编排
- `utils/responseParser.js`
  - 负责把服务端返回结果转换成表格可消费结构
- `utils/excelExporter.js`
  - 负责 Excel 导出与多 sheet 递归展开

## 后续接真实接口时建议

1. 用真实“接口列表查询接口”替换 `mock://interface-list`
2. 用真实“查询条件模板接口”替换 `mock://query-conditions`
3. 保持返回结果里的 `list / records / rows` 结构约定
4. 按交易名补充 `fieldMap.js` 中的字段中文映射
