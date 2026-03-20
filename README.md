# FluxBT

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

### Overview

FluxBT is a modern BitTorrent transfer manager web application built with Next.js 16. It provides a clean, responsive interface for monitoring and managing torrent transfers across multiple servers. The application features real-time statistics, transfer management, and multi-server support with an intuitive user experience.

### Features

- **Dashboard**: Real-time overview of download/upload speeds, active torrents, and server status with interactive charts
- **Transfer Management**: Comprehensive torrent list with status tracking, progress bars, and detailed information
- **Multi-Server Support**: Connect and manage multiple BitTorrent servers from a single interface
- **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile devices
- **Theme Support**: Light, Dark, and System themes with a custom background image option
- **Internationalization**: Built-in support for English and Chinese
- **Real-time Updates**: Live progress tracking with animated visual feedback

### Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui, Radix UI |
| State Management | Zustand |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Prisma ORM |
| Package Manager | npm |

### Project Structure

```text
fluxbt/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Main application page
│   │   ├── globals.css         # Global styles
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (Sidebar, Topbar)
│   │   ├── dashboard/          # Dashboard page components
│   │   ├── transfers/          # Transfer management components
│   │   ├── servers/            # Server management components
│   │   ├── settings/           # Settings menu component
│   │   ├── theme/              # Theme provider
│   │   └── background/         # Background image component
│   ├── contexts/               # React contexts (i18n, background)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and types
│   └── messages/               # i18n translation files
├── prisma/                     # Database schema
├── public/                     # Static assets
└── scripts/                    # Local npm helper scripts
```

### Getting Started

#### Prerequisites

- Node.js 18+ with npm
- npm 10+

#### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fluxbt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   ```bash
   cp .env.example .env
   ```
   Then replace `NEXTAUTH_SECRET` in `.env` with your own random secret.

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:reset` | Reset the database |

### Screenshots

The application includes:

- **Sidebar Navigation**: Quick access to Dashboard, Transfers, and Servers
- **Statistics Cards**: Download/upload speeds, ratio, and active torrents
- **Transfer List**: Sortable columns with status, tracker, tags, progress, and actions
- **Mobile-First Design**: Collapsible sidebar and responsive layouts

---

<a name="中文"></a>

## 中文

### 项目简介

FluxBT 是一个基于 Next.js 16 构建的现代化 BitTorrent 传输管理 Web 应用。它提供了简洁、响应式的界面，用于监控和管理多个服务器上的种子传输。当前项目已经具备仪表盘、传输管理、多服务器视图和国际化界面等核心前端能力。

### 功能特性

- **仪表盘**：实时展示下载/上传速度、活动种子数量和服务器状态，并提供图表视图
- **传输管理**：提供完整的种子列表、状态追踪、进度条和详情面板
- **多服务器支持**：可以在同一个界面中切换和查看多个 BitTorrent 服务器
- **响应式设计**：对桌面端、平板端和移动端都做了适配
- **主题支持**：支持亮色、暗色和系统主题，并支持自定义背景图片
- **国际化**：内置中英文双语支持
- **实时更新体验**：通过动画和视觉反馈增强状态变化的可读性

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| UI 组件 | shadcn/ui, Radix UI |
| 状态管理 | Zustand |
| 动画 | Framer Motion |
| 图表 | Recharts |
| 图标 | Lucide React |
| 数据库 | Prisma ORM |
| 包管理器 | npm |

### 项目结构

```text
fluxbt/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── layout.tsx          # 根布局与 providers
│   │   ├── page.tsx            # 主应用页面
│   │   ├── globals.css         # 全局样式
│   │   └── api/                # API 路由
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── layout/             # 布局组件（侧边栏、顶栏）
│   │   ├── dashboard/          # 仪表盘页面组件
│   │   ├── transfers/          # 传输管理组件
│   │   ├── servers/            # 服务器管理组件
│   │   ├── settings/           # 设置菜单组件
│   │   ├── theme/              # 主题提供者
│   │   └── background/         # 背景图片组件
│   ├── contexts/               # React 上下文（国际化、背景）
│   ├── hooks/                  # 自定义 React Hooks
│   ├── lib/                    # 工具函数和类型定义
│   └── messages/               # 国际化翻译文件
├── prisma/                     # 数据库模型
├── public/                     # 静态资源
└── scripts/                    # 本地 npm 辅助脚本
```

### 快速开始

#### 环境要求

- Node.js 18+（含 npm）
- npm 10+

#### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd fluxbt
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **创建环境变量**
   ```bash
   echo DATABASE_URL=\"file:./db/custom.db\" > .env
   ```

4. **初始化数据库**
   ```bash
   npm run db:push
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **打开浏览器**
   访问 `http://localhost:3000`

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run db:push` | 将 Prisma 模型同步到数据库 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:migrate` | 运行 Prisma 迁移 |
| `npm run db:reset` | 重置数据库 |

### 界面概览

项目当前主要包含以下界面能力：

- **侧边栏导航**：快速访问仪表盘、传输和服务器页面
- **统计卡片**：展示下载/上传速度、分享率和活动种子数
- **传输列表**：支持按状态、Tracker、标签和进度查看任务
- **移动优先设计**：提供可折叠侧边栏和响应式布局

---

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
