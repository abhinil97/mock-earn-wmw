# Vite + React + TypeScript + shadcn/ui

A minimal Vite project with React, TypeScript, and shadcn/ui support.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Build for production:
```bash
pnpm build
```

## Features

- ⚡️ Vite 6 - Next Generation Frontend Tooling
- ⚛️ React 18 - A JavaScript library for building user interfaces
- 🎨 Tailwind CSS 4 (beta) - Utility-first CSS framework
- 🎭 shadcn/ui - Beautifully designed components
- 📘 TypeScript - Typed JavaScript at Any Scale
- 🔧 ESLint - Pluggable linting utility

## Adding shadcn/ui Components

To add shadcn/ui components, use:

```bash
pnpm dlx shadcn@latest add button
```

Replace `button` with any component you want to add (e.g., `card`, `dialog`, `dropdown-menu`, etc.).

## Project Structure

```
.
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   ├── App.tsx        # Main App component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles with Tailwind
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── components.json    # shadcn/ui configuration
```
