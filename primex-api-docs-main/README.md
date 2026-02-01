# Primexmeta API Documentation

Production-grade API documentation platform for the Primexmeta Travel API.

## Features

- 🚀 **Next.js 14+** with App Router
- ⚡ **Server Actions** for all API operations
- 📝 **MDX** for documentation with custom components
- 🎨 **shadcn/ui** inspired design
- 🌙 **Dark mode** by default
- 📱 **Responsive** layout
- 🔍 **Fast search** with keyboard navigation
- 🎯 **TypeScript** strict mode

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MongoDB (for documentation and users)
- **Content**: MDX (stored in MongoDB)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions (API logix)
│   │   ├── admin/            # Admin dashboard
│   │   ├── docs/             # Dynamic docs routes
│   │   ├── docs-admin/       # CMS for documentation
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── api/              # API components
│   │   ├── docs/             # Layout components
│   │   ├── mdx/              # MDX components
│   │   └── ui/               # shadcn/ui components
│   ├── models/               # MongoDB models (User, Doc, Category)
│   └── lib/                  # Utilities & types
└── public/                   # Static assets
```

## Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Primexmeta API
PRIMEXMETA_API_KEY=your_key
PRIMEXMETA_API_SECRET=your_secret

# Environment
API_ENVIRONMENT=sandbox
```

## Server Actions

All API operations use Server Actions. No REST endpoints are exposed.

```typescript
// Import directly into components
import { searchFlights } from "@/app/actions/flights.actions";

// Use in server components or with useTransition
const results = await searchFlights(request, "sandbox");
```

## Documentation

Documentation is written in MDX with custom components:

```mdx
---
title: Flight Search
category: flights
---

<ApiRequest method="POST" endpoint="/flights/search" body={{ origin: "LHR", destination: "DXB" }} />

<LiveApiPlayground />
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT © Primexmeta

