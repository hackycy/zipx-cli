# zipx-cli

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

一个简单、快速、支持 include / exclude Glob 过滤的目录压缩 CLI / 库。

底层基于 tinyglobby + JSZip：极速文件匹配 + 高压缩率。开箱即用：默认把 `dist` 打成 `archive.zip`。

## ✨ 特性

- 🔍 支持 Glob 包含 / 排除（含隐藏文件）
- 🗂 保留相对目录结构
- 💨 tinyglobby 极速匹配
- 🧪 ESM 为主，TypeScript 类型完善
- 🧰 同时支持命令行与程序调用

## 📦 安装

全局（仅 CLI）：

```bash
pnpm add -g zipx-cli
# 或
npm i -g zipx-cli
```

项目内（CLI + 代码调用）：

```bash
pnpm add -D zipx-cli
```

## 🖥️ 命令行使用

```bash
zipx [options]
```

| 选项 | 别名 | 默认值 | 说明 |
|------|------|--------|------|
| `--target <dir>` | `-t` | `dist` | 要压缩的目录；可重复或用逗号分隔以指定多个目录（会一起打包） |
| `--no-namespace` |  | `false` | 多目录时不加前缀（默认会加前缀：按目录相对 cwd 的路径），可能造成同名文件覆盖 |
| `--output <file>` | `-o` | `archive` | 输出文件名（可不带 .zip） |
| `--include <patterns...>` | `-i` | `**/*` | 仅包含的 Glob 模式 |
| `--exclude <patterns...>` | `-e` | `-` | 需要排除的 Glob 模式 |
| `--help` |  |  | 查看帮助 |

示例：

```bash
# 压缩 dist -> archive.zip
zipx

# 指定目录与输出名
zipx -t build -o release

# 多目录一起打包
# 重复传参
zipx -t dist -t public -o release
# 逗号分隔
zipx -t dist,public -o release

# 多目录但不加前缀（平铺合并）
zipx -t dist,public --no-namespace -o release

# 只包含 js 与 map
zipx -i "**/*.js" "**/*.js.map"

# 排除测试与 map 文件
zipx -e "**/*.test.*" "**/*.map"

# 组合示例
zipx -t dist -o artifacts/app -i "**/*" -e "**/*.log" "**/*.md"
```

结果：当前工作目录生成 `archive.zip`（或你指定的名称）。

## ⚙️ 配置文件

在项目根目录创建 `zipx.config.(ts|js|mjs|cjs)`：

```ts
import { defineConfig } from 'zipx-cli'

export default defineConfig({
  // 单目录
  target: 'dist',
  output: 'artifacts/app',
  include: ['**/*'],
  exclude: ['**/*.log', '**/*.map'],
})

// 或：多目录
export default defineConfig({
  target: ['dist', 'public'],
  output: 'artifacts/app',
  // 关闭命名空间（默认 true）
  namespace: false,
})
```

命令行参数优先级高于配置文件。

## 🧩 编程式调用

```ts
import { compress } from 'zipx-cli'

await compress({
  // 单目录
  target: 'dist',
  output: 'release', // 生成 release.zip
  include: ['**/*.js'],
  exclude: ['**/*.test.js'],
})

// 多目录
await compress({
  target: ['dist', 'public'],
  output: 'release',
  // 关闭命名空间（默认 true）
  namespace: false,
})
```

### 类型定义

```ts
interface ZipxOptions {
  cwd?: string
  target?: string | string[] // 默认: dist；数组则代表多个目录一起压缩
  output?: string // 默认: archive （若无 .zip 自动补全）
  include?: string[] // 默认: ['**/*']
  exclude?: string[]
  namespace?: boolean // 多目录时是否加前缀，默认 true；false 则平铺合并（可能覆盖同名文件）
}
```

## 🤝 贡献

欢迎 PR，本地开发：

```bash
pnpm i
pnpm dev
pnpm test
```

## 📄 许可证

[MIT](./LICENSE) License © [hackycy](https://github.com/hackycy)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/zipx-cli?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/zipx-cli
[npm-downloads-src]: https://img.shields.io/npm/dm/zipx-cli?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/zipx-cli
[bundle-src]: https://img.shields.io/bundlephobia/minzip/zipx-cli?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=zipx-cli
[license-src]: https://img.shields.io/github/license/hackycy/zipx-cli.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/hackycy/zipx-cli/blob/main/LICENSE
