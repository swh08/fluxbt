# FluxBT

[English](#english) | [涓枃](#涓枃)

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
| Package Manager | npm |

### Project Structure

```
fluxbt/
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ app/                    # Next.js App Router pages
鈹?  鈹?  鈹溾攢鈹€ layout.tsx          # Root layout with providers
鈹?  鈹?  鈹溾攢鈹€ page.tsx            # Main application page
鈹?  鈹?  鈹溾攢鈹€ globals.css         # Global styles
鈹?  鈹?  鈹斺攢鈹€ api/                # API routes
鈹?  鈹溾攢鈹€ components/
鈹?  鈹?  鈹溾攢鈹€ ui/                 # shadcn/ui components
鈹?  鈹?  鈹溾攢鈹€ layout/             # Layout components (Sidebar, Topbar)
鈹?  鈹?  鈹溾攢鈹€ dashboard/          # Dashboard page components
鈹?  鈹?  鈹溾攢鈹€ transfers/          # Transfer management components
鈹?  鈹?  鈹溾攢鈹€ servers/            # Server management components
鈹?  鈹?  鈹溾攢鈹€ settings/           # Settings menu component
鈹?  鈹?  鈹溾攢鈹€ theme/              # Theme provider
鈹?  鈹?  鈹斺攢鈹€ background/         # Background image component
鈹?  鈹溾攢鈹€ contexts/               # React contexts (i18n, background)
鈹?  鈹溾攢鈹€ hooks/                  # Custom React hooks
鈹?  鈹溾攢鈹€ lib/                    # Utilities and types
鈹?  鈹斺攢鈹€ messages/               # i18n translation files
鈹溾攢鈹€ public/                     # Static assets
鈹溾攢鈹€ prisma/                     # Database schema
鈹斺攢鈹€ examples/                   # WebSocket examples
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

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables as needed.

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
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push database schema |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:reset` | Reset database |

### Screenshots

The application includes:
- **Sidebar Navigation**: Quick access to Dashboard, Transfers, and Servers
- **Statistics Cards**: Download/upload speeds, ratio, and active torrents
- **Transfer List**: Sortable columns with status, tracker, tags, progress, and actions
- **Mobile-First Design**: Collapsible sidebar and responsive layouts

---

<a name="涓枃"></a>

## 涓枃

### 椤圭洰绠€浠?
FluxBT 鏄竴涓熀浜?Next.js 16 鏋勫缓鐨勭幇浠ｅ寲 BitTorrent 浼犺緭绠＄悊 Web 搴旂敤銆傚畠鎻愪緵浜嗙畝娲併€佸搷搴斿紡鐨勭晫闈紝鐢ㄤ簬鐩戞帶鍜岀鐞嗚法澶氫釜鏈嶅姟鍣ㄧ殑绉嶅瓙浼犺緭銆傚簲鐢ㄥ叿鏈夊疄鏃剁粺璁°€佷紶杈撶鐞嗗拰澶氭湇鍔″櫒鏀寔绛夊姛鑳斤紝鎻愪緵鐩磋鐨勭敤鎴蜂綋楠屻€?
### 鍔熻兘鐗规€?
- **浠〃鐩?*锛氬疄鏃舵樉绀轰笅杞?涓婁紶閫熷害銆佹椿鍔ㄧ瀛愬拰鏈嶅姟鍣ㄧ姸鎬侊紝閰嶆湁浜や簰寮忓浘琛?- **浼犺緭绠＄悊**锛氬畬鏁寸殑绉嶅瓙鍒楄〃锛屽寘鍚姸鎬佽拷韪€佽繘搴︽潯鍜岃缁嗕俊鎭?- **澶氭湇鍔″櫒鏀寔**锛氫粠鍗曚竴鐣岄潰杩炴帴鍜岀鐞嗗涓?BitTorrent 鏈嶅姟鍣?- **鍝嶅簲寮忚璁?*锛氶拡瀵规闈€佸钩鏉垮拰绉诲姩璁惧浼樺寲鐨勫畬鍏ㄥ搷搴斿紡甯冨眬
- **涓婚鏀寔**锛氫寒鑹层€佹殫鑹插拰绯荤粺涓婚锛屾敮鎸佽嚜瀹氫箟鑳屾櫙鍥剧墖
- **鍥介檯鍖?*锛氬唴缃腑鏂囧拰鑻辨枃璇█鏀寔
- **瀹炴椂鏇存柊**锛氬甫鏈夊姩鐢昏瑙夊弽棣堢殑瀹炴椂杩涘害杩借釜

### 鎶€鏈爤

| 绫诲埆 | 鎶€鏈鏋?|
|------|----------|
| 妗嗘灦 | Next.js 16 (App Router) |
| 璇█ | TypeScript |
| 鏍峰紡 | Tailwind CSS 4 |
| UI缁勪欢 | shadcn/ui, Radix UI |
| 鐘舵€佺鐞?| Zustand |
| 鍔ㄧ敾 | Framer Motion |
| 鍥捐〃 | Recharts |
| 鍥炬爣 | Lucide React |
| 鏁版嵁搴?| Prisma ORM |
| 鍖呯鐞嗗櫒 | npm |

### 椤圭洰缁撴瀯

```
fluxbt/
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ app/                    # Next.js App Router 椤甸潰
鈹?  鈹?  鈹溾攢鈹€ layout.tsx          # 鏍瑰竷灞€锛堝惈providers锛?鈹?  鈹?  鈹溾攢鈹€ page.tsx            # 涓诲簲鐢ㄩ〉闈?鈹?  鈹?  鈹溾攢鈹€ globals.css         # 鍏ㄥ眬鏍峰紡
鈹?  鈹?  鈹斺攢鈹€ api/                # API 璺敱
鈹?  鈹溾攢鈹€ components/
鈹?  鈹?  鈹溾攢鈹€ ui/                 # shadcn/ui 缁勪欢
鈹?  鈹?  鈹溾攢鈹€ layout/             # 甯冨眬缁勪欢锛堜晶杈规爮銆侀《鏍忥級
鈹?  鈹?  鈹溾攢鈹€ dashboard/          # 浠〃鐩橀〉闈㈢粍浠?鈹?  鈹?  鈹溾攢鈹€ transfers/          # 浼犺緭绠＄悊缁勪欢
鈹?  鈹?  鈹溾攢鈹€ servers/            # 鏈嶅姟鍣ㄧ鐞嗙粍浠?鈹?  鈹?  鈹溾攢鈹€ settings/           # 璁剧疆鑿滃崟缁勪欢
鈹?  鈹?  鈹溾攢鈹€ theme/              # 涓婚鎻愪緵鑰?鈹?  鈹?  鈹斺攢鈹€ background/         # 鑳屾櫙鍥剧墖缁勪欢
鈹?  鈹溾攢鈹€ contexts/               # React 涓婁笅鏂囷紙鍥介檯鍖栥€佽儗鏅級
鈹?  鈹溾攢鈹€ hooks/                  # 鑷畾涔?React Hooks
鈹?  鈹溾攢鈹€ lib/                    # 宸ュ叿鍑芥暟鍜岀被鍨嬪畾涔?鈹?  鈹斺攢鈹€ messages/               # 鍥介檯鍖栫炕璇戞枃浠?鈹溾攢鈹€ public/                     # 闈欐€佽祫婧?鈹溾攢鈹€ prisma/                     # 鏁版嵁搴撴ā鍨?鈹斺攢鈹€ examples/                   # WebSocket 绀轰緥
```

### 蹇€熷紑濮?
#### 鐜瑕佹眰

- Node.js 18+锛堝唴缃?npm锛?
- npm 10+

#### 瀹夎姝ラ

1. **鍏嬮殕浠撳簱**
   ```bash
   git clone <repository-url>
   cd fluxbt
   ```

2. **瀹夎渚濊禆**
   ```bash
   npm install
   ```

3. **閰嶇疆鐜鍙橀噺**
   ```bash
   cp .env.example .env
   ```
   鏍规嵁闇€瑕侀厤缃幆澧冨彉閲忋€?
4. **鍒濆鍖栨暟鎹簱**
   ```bash
   npm run db:push
   ```

5. **鍚姩寮€鍙戞湇鍔″櫒**
   ```bash
   npm run dev
   ```

6. **鎵撳紑娴忚鍣?*
   璁块棶 `http://localhost:3000`

### 鍙敤鑴氭湰

| 鍛戒护 | 璇存槑 |
|------|------|
| `npm run dev` | 鍚姩寮€鍙戞湇鍔″櫒 |
| `npm run build` | 鏋勫缓鐢熶骇鐗堟湰 |
| `npm run start` | 鍚姩鐢熶骇鏈嶅姟鍣?|
| `npm run lint` | 杩愯 ESLint 妫€鏌?|
| `npm run db:push` | 鎺ㄩ€佹暟鎹簱妯″瀷 |
| `npm run db:generate` | 鐢熸垚 Prisma 瀹㈡埛绔?|
| `npm run db:migrate` | 杩愯鏁版嵁搴撹縼绉?|
| `npm run db:reset` | 閲嶇疆鏁版嵁搴?|

### 搴旂敤鎴浘

搴旂敤鍖呭惈浠ヤ笅鍔熻兘鐣岄潰锛?- **渚ц竟鏍忓鑸?*锛氬揩閫熻闂华琛ㄧ洏銆佷紶杈撳拰鏈嶅姟鍣ㄩ〉闈?- **缁熻鍗＄墖**锛氫笅杞?涓婁紶閫熷害銆佸垎浜巼鍜屾椿鍔ㄧ瀛愭暟
- **浼犺緭鍒楄〃**锛氬彲鎺掑簭鐨勫垪锛屽寘鍚姸鎬併€乀racker銆佹爣绛俱€佽繘搴︾瓑淇℃伅
- **绉诲姩浼樺厛璁捐**锛氬彲鎶樺彔渚ц竟鏍忓拰鍝嶅簲寮忓竷灞€

---

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

