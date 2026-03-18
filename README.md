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
- **Theme Support**: Light, Dark, and System themes with custom background image option
- **Internationalization**: Built-in support for English and Chinese languages
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
| Package Manager | Bun |

### Project Structure

```
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
├── public/                     # Static assets
├── prisma/                     # Database schema
└── examples/                   # WebSocket examples
```

### Getting Started

#### Prerequisites

- Node.js 18+ or Bun
- A package manager (npm, yarn, pnpm, or bun)

#### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fluxbt
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables as needed.

4. **Initialize the database**
   ```bash
   bun run db:push
   # or
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push database schema |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database |

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

FluxBT 是一个基于 Next.js 16 构建的现代化 BitTorrent 传输管理 Web 应用。它提供了简洁、响应式的界面，用于监控和管理跨多个服务器的种子传输。应用具有实时统计、传输管理和多服务器支持等功能，提供直观的用户体验。

### 功能特性

- **仪表盘**：实时显示下载/上传速度、活动种子和服务器状态，配有交互式图表
- **传输管理**：完整的种子列表，包含状态追踪、进度条和详细信息
- **多服务器支持**：从单一界面连接和管理多个 BitTorrent 服务器
- **响应式设计**：针对桌面、平板和移动设备优化的完全响应式布局
- **主题支持**：亮色、暗色和系统主题，支持自定义背景图片
- **国际化**：内置中文和英文语言支持
- **实时更新**：带有动画视觉反馈的实时进度追踪

### 技术栈

| 类别 | 技术框架 |
|------|----------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| UI组件 | shadcn/ui, Radix UI |
| 状态管理 | Zustand |
| 动画 | Framer Motion |
| 图表 | Recharts |
| 图标 | Lucide React |
| 数据库 | Prisma ORM |
| 包管理器 | Bun |

### 项目结构

```
fluxbt/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── layout.tsx          # 根布局（含providers）
│   │   ├── page.tsx            # 主应用页面
│   │   ├── globals.css         # 全局样式
│   │   └── api/                # API 路由
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 组件
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
├── public/                     # 静态资源
├── prisma/                     # 数据库模型
└── examples/                   # WebSocket 示例
```

### 快速开始

#### 环境要求

- Node.js 18+ 或 Bun
- 包管理器 (npm, yarn, pnpm, 或 bun)

#### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd fluxbt
   ```

2. **安装依赖**
   ```bash
   bun install
   # 或
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```
   根据需要配置环境变量。

4. **初始化数据库**
   ```bash
   bun run db:push
   # 或
   npm run db:push
   ```

5. **启动开发服务器**
   ```bash
   bun run dev
   # 或
   npm run dev
   ```

6. **打开浏览器**
   访问 `http://localhost:3000`

### 可用脚本

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器 |
| `bun run build` | 构建生产版本 |
| `bun run start` | 启动生产服务器 |
| `bun run lint` | 运行 ESLint 检查 |
| `bun run db:push` | 推送数据库模型 |
| `bun run db:generate` | 生成 Prisma 客户端 |
| `bun run db:migrate` | 运行数据库迁移 |
| `bun run db:reset` | 重置数据库 |

### 应用截图

应用包含以下功能界面：
- **侧边栏导航**：快速访问仪表盘、传输和服务器页面
- **统计卡片**：下载/上传速度、分享率和活动种子数
- **传输列表**：可排序的列，包含状态、Tracker、标签、进度等信息
- **移动优先设计**：可折叠侧边栏和响应式布局

---

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
