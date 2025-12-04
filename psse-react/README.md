# PSSE Website - React + TypeScript + Vite + Tailwind CSS

Modern React-based website for the **Philippine Society of Software Engineers (PSSE)**. Migrated from vanilla HTML/Bootstrap/jQuery to a modern tech stack.

## Tech Stack

- **React 18** - UI library with functional components and hooks
- **TypeScript** - Type-safe JavaScript with strict mode
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Icons** - Icon library

## Project Structure

```
src/
├── components/
│   ├── common/      # Reusable UI components (Button, Badge, Card, Modal)
│   ├── features/    # Domain-specific components (OfficerCard, EventCard, ProductCard)
│   └── layout/      # Layout components (Navbar, Footer, PageLayout)
├── context/         # React Context (OrderContext)
├── data/            # Static data (officers, events, merchandise)
├── hooks/           # Custom hooks (useScrollAnimation)
├── pages/           # Page components (Home, About, Events, Merchandise)
├── types/           # TypeScript interfaces
├── App.tsx          # Root component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles and Tailwind imports
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Pages

- **Home** (`/`) - Landing page with hero, featured events, merchandise preview
- **About** (`/about`) - Organization information, mission/vision, officers
- **Events** (`/events`) - Upcoming and past events with registration
- **Merchandise** (`/merchandise`) - PSSE merchandise with ordering system

## Features

- 🎨 **Modern UI** - Clean design with PSSE brand colors
- 📱 **Responsive** - Mobile-first design with responsive navigation
- ⚡ **Fast** - Optimized with Vite for quick development and builds
- 🔄 **State Management** - React Context for order management
- 💾 **Persistence** - LocalStorage for cart/order data
- ✨ **Animations** - Scroll-triggered animations with Intersection Observer

## Brand Colors

- **PSSE Dark:** `#0A1B39`
- **PSSE Primary:** `#0A3B80`
- **PSSE Accent:** `#007BFF`
