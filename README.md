# AIMC 大赛门户与参赛用户端

上海电气「AI 原生智能工厂创新应用大赛」门户项目，负责官网公开内容、参赛用户认证、报名、需求征集和个人中心。

评审端与管理端已拆分到平级项目 `../aimc-ops-console`，两个项目可以独立开发、构建和部署。

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router + Pinia + Axios
- Element Plus + Tailwind CSS
- pnpm 10

## 本地运行

```bash
pnpm install --frozen-lockfile
pnpm dev
```

默认访问：<http://localhost:47321>

提交前校验：

```bash
pnpm check
```

## 页面范围

| 路径 | 访问范围 | 页面 |
| --- | --- | --- |
| `/` | 公开 | 大赛首页 |
| `/contest` | 公开 | 大赛详情 |
| `/tracks/:key` | 公开 | 赛事方向详情 |
| `/login`、`/register` | 游客 | 登录与注册 |
| `/apply` | 参赛用户 | 项目报名 |
| `/demand` | 参赛用户 | 需求征集 |
| `/dashboard` | 参赛用户 | 个人中心 |

未知地址统一进入 404 页面；管理员和评委账号会跳转到运营后台登录页。

## 环境变量

复制 `.env.example` 为 `.env.local`，按部署环境配置：

```dotenv
VITE_OPS_URL=http://localhost:47322
```

该地址用于管理员、评委登录时跳转到独立运营后台。

## 演示账号

当前仍是纯前端原型，验证码固定为 `123456`。

| 角色 | 手机号 | 密码 |
| --- | --- | --- |
| 参赛用户 | `13700000001` | `User@2026` |

原型数据保存在当前站点的 `localStorage`。门户与运营后台运行在不同源，浏览器数据不会自动互通；接入真实后端后应统一使用服务端账号、赛事数据和权限接口。

## 目录约定

```text
src/
├── api/          # HTTP 客户端与原型 mock
├── components/   # 通用组件与门户组件
├── config/       # 环境配置
├── lib/          # 领域类型、规则和生成逻辑
├── router/       # 门户路由与访问控制
├── stores/       # Pinia 状态
├── styles/       # 全局样式
├── utils/        # 无业务状态的工具函数
└── views/        # 门户与参赛用户页面
```

`node_modules/` 与 `dist/` 都是本地生成目录，不纳入源码交付。

## 生产接入提醒

- 删除 `src/api/http.ts` 中的本地 mock，统一接入后端认证接口。
- 将 `src/stores/app.ts` 中的业务动作替换为真实 API 调用。
- 文件上传改为对象存储，前端只保存文件标识与下载地址。
- 前端路由守卫只改善体验，真实权限必须由后端接口再次校验。
