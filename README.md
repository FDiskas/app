# 📱 AppLink - Universal App Store Redirection

**AppLink** is a modern, high-performance utility designed to simplify how developers share their mobile applications. One link, one QR code, all platforms.

## 🚀 The Idea

Sharing separate links for the iOS App Store and Google Play Store is cumbersome. AppLink solves this by providing a single **Universal Link** that intelligently redirects users based on their device:

- **iPhone/iPad Users**: Automatically redirected to the Apple App Store.
- **Android Users**: Automatically redirected to the Google Play Store (via `market://` links for instant opening).
- **Desktop Users**: Presented with a beautiful landing page featuring buttons for both stores and a scanable QR code.

## ✨ Key Features

- **Store Search**: Search for any app on the App Store or Google Play directly within the interface.
- **Smart Redirection**: Device-aware routing ensures users land in the right place instantly.
- **Link Health Cleanup**: On link retrieval and redirect, AppLink verifies store availability, tracks failures, marks links as `PARTIAL` when one store is missing, and deletes links only when both iOS and Android targets are unavailable.
- **Dynamic QR Codes**: Instant QR code generation for every universal link created.
- **Local History**: Your recently created links are saved in your browser for quick access.
- **Premium Aesthetics**: Built with a sleek, dark-mode first design using Tailwind CSS and Lucide icons.
- **Type-Safe RPC**: Powered by **oRPC** for seamless, type-safe communication between client and server.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh) (Fast all-in-one JS runtime)
- **Backend**: [Hono](https://hono.dev) (Ultra fast web framework)
- **Frontend**: [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- **Database**: [Prisma 7](https://www.prisma.io) (SQLite)
- **API Layer**: [oRPC](https://orpc.sh) (Type-safe RPC)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)

## 🏁 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up the database:
   ```bash
   bun x prisma db push
   ```

### Development

Run both the server and client in development mode:

```bash
bun dev
```

- **Client**: `http://localhost:5173`
- **Server/API**: `http://localhost:3000`

### Building for Production

```bash
bun run build
```

## 📜 License

MIT
