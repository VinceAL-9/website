# PSSE Website Migration Documentation

## Overview

This document details the complete migration of the Philippine Society of Software Engineers (PSSE) website from a vanilla HTML/Bootstrap/jQuery stack to a modern React-based architecture.

---

## Technology Stack

### Previous Stack
- HTML5
- Bootstrap 4/5
- jQuery
- Vanilla JavaScript

### New Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI library |
| TypeScript | Strict mode | Type safety |
| Vite | 7.2.6 | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first styling |
| React Router | 6.x | Client-side routing |
| React Icons | - | Icon library (FontAwesome) |

---

## Project Structure

```
psse-react/
├── public/
│   └── images/              # Static images (officers, events, merchandise)
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── features/        # Domain-specific components
│   │   │   ├── EventCard.tsx
│   │   │   ├── OfficerCard.tsx
│   │   │   └── ProductCard.tsx
│   │   └── layout/          # Layout components
│   │       ├── Footer.tsx
│   │       ├── Navbar.tsx
│   │       └── PageLayout.tsx
│   ├── context/
│   │   └── OrderContext.tsx # Order state management
│   ├── data/
│   │   ├── events.ts        # Event data
│   │   ├── merchandise.ts   # Product data
│   │   └── officers.ts      # Officer data
│   ├── hooks/
│   │   └── useScrollAnimation.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── Events.tsx
│   │   ├── Home.tsx
│   │   └── Merchandise.tsx
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx              # Root component with routing
│   ├── index.css            # Global styles & Tailwind config
│   └── main.tsx             # Application entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── eslint.config.js
```

---

## Migrated Pages

### 1. Home Page (`/`)
- Hero section with animated background
- Organization introduction
- Featured upcoming events carousel
- Merchandise preview section
- Call-to-action buttons

### 2. About Page (`/about`)
- Organization history and description
- Mission and Vision statements
- Officer grid with role-based filtering
- Social media links for officers

### 3. Events Page (`/events`)
- Event listing with status indicators (Upcoming, Ongoing, Completed)
- Event cards with date, time, location, and registration info
- Category badges
- Registration buttons with external links

### 4. Merchandise Page (`/merchandise`)
- Product catalog with images
- Category filtering (Apparel, Accessories, Bundles, etc.)
- Size selection for applicable items
- Order modal with form validation
- Order management (view, cancel orders)
- Payment processing simulation

---

## Component Architecture

### Common Components

#### `Button.tsx`
Reusable button component with variants:
- `primary` - Blue accent color
- `secondary` - Dark blue color
- `outline` - Bordered style
- `ghost` - Transparent background

Supports sizes: `sm`, `md`, `lg`

#### `Badge.tsx`
Status indicator component with variants:
- `default`, `primary`, `success`, `warning`, `danger`, `info`

#### `Card.tsx`
Flexible card container with optional hover effects and padding options.

#### `Modal.tsx`
Accessible modal dialog with:
- Click-outside to close
- Escape key handling
- Body scroll lock
- Customizable width

### Feature Components

#### `OfficerCard.tsx`
Displays officer information with:
- Profile image with hover zoom effect
- Name, role, and program
- Social media links (LinkedIn, GitHub, Facebook)

#### `EventCard.tsx`
Event display card featuring:
- Event image
- Status badge (upcoming/ongoing/completed)
- Date, time, location details
- Registration button

#### `ProductCard.tsx`
Merchandise product card with:
- Product image gallery (future-ready)
- Price display with sale pricing
- Size selector
- Add to order functionality
- Stock availability indicator

### Layout Components

#### `Navbar.tsx`
Responsive navigation with:
- Desktop horizontal menu
- Mobile hamburger menu with slide-out panel
- Active link highlighting
- Scroll-aware styling

#### `Footer.tsx`
Site footer containing:
- Organization branding
- Quick navigation links
- Social media links
- Copyright notice

#### `PageLayout.tsx`
Page wrapper providing:
- Consistent page structure
- Navbar and Footer inclusion
- Main content area styling

---

## State Management

### OrderContext
React Context implementation for order management:

```typescript
interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate' | 'status' | 'paymentStatus'>) => void;
  cancelOrder: (orderId: string) => void;
  processPayment: (orderId: string) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
}
```

**Features:**
- LocalStorage persistence
- Unique order ID generation
- Order status tracking (pending, confirmed, completed, cancelled)
- Payment status management (pending, paid, failed)

---

## TypeScript Interfaces

```typescript
// Core data types
interface Officer {
  id: string;
  name: string;
  role: OfficerRole;
  image: string;
  program: string;
  socials: SocialLinks;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: EventCategory;
  registrationLink?: string;
  status: EventStatus;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: ProductCategory;
  sizes?: ProductSize[];
  inStock: boolean;
  featured?: boolean;
}

interface Order {
  id: string;
  items: OrderItem[];
  customerInfo: OrderFormData;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
}
```

---

## Custom Hooks

### `useScrollAnimation`
Intersection Observer-based animation trigger:

```typescript
const { ref, isVisible } = useScrollAnimation({
  threshold: 0.1,
  triggerOnce: true
});
```

### `useScrollAnimationList`
Staggered animation for list items with configurable delay.

---

## Styling

### Tailwind CSS v4 Configuration

Custom theme extensions in `index.css`:

```css
@theme {
  --color-psse-dark: #0A1B39;
  --color-psse-primary: #0A3B80;
  --color-psse-accent: #007BFF;
}
```

### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| PSSE Dark | `#0A1B39` | Headers, footers, dark backgrounds |
| PSSE Primary | `#0A3B80` | Primary buttons, links |
| PSSE Accent | `#007BFF` | CTAs, highlights, interactive elements |

### Custom Animations
- `fade-in-up` - Element fades in while sliding up
- `slide-in-left` - Element slides in from left
- `slide-in-right` - Element slides in from right

---

## Build Configuration

### Vite Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
})
```

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- JSX preserve for React
- Module resolution: bundler

### PostCSS Configuration
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

---

## Data Migration

### Officers Data
Extracted from `app.js` officer arrays and converted to typed TypeScript objects with:
- Unique IDs
- Role categorization (President, Vice President, Secretary, etc.)
- Social media links

### Events Data
Migrated from HTML markup to structured data with:
- Event categorization
- Status tracking
- Registration links

### Merchandise Data
Converted from `app.js` merch data to typed products with:
- Category classification
- Size options
- Pricing (regular and sale)
- Stock status

---

## Routing

React Router v6 implementation:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page |
| `/about` | `About` | Organization info |
| `/events` | `Events` | Event listings |
| `/merchandise` | `Merchandise` | Product catalog |

---

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

---

## Dependencies

### Production
- `react`: ^18.x
- `react-dom`: ^18.x
- `react-router-dom`: ^6.x
- `react-icons`: ^5.x

### Development
- `typescript`: ^5.x
- `vite`: ^7.x
- `tailwindcss`: ^4.x
- `@tailwindcss/postcss`: ^4.x
- `autoprefixer`: ^10.x
- `eslint`: ^9.x
- `@vitejs/plugin-react`: ^4.x

---

## Build Output

Production build generates optimized assets in `dist/`:

```
dist/
├── index.html           (~0.5 KB)
├── assets/
│   ├── index-[hash].css (~30 KB, ~6 KB gzipped)
│   └── index-[hash].js  (~289 KB, ~91 KB gzipped)
```

**Build Statistics:**
- 71 modules transformed
- Build time: ~3.7 seconds

---

## Migration Highlights

1. **Component-Based Architecture**: Replaced monolithic HTML files with reusable React components
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Modern Styling**: Replaced Bootstrap with Tailwind CSS utility classes
4. **State Management**: Replaced jQuery DOM manipulation with React Context
5. **Client-Side Routing**: Replaced multi-page navigation with SPA routing
6. **Build Optimization**: Vite provides fast HMR in development and optimized production builds
7. **Code Organization**: Clear separation of concerns with dedicated folders for components, hooks, context, and data
