# PSSE Website Bootstrap Conversion Guide

## Overview
This document outlines the conversion of the Philippine Society of Software Engineers (PSSE) website from custom CSS to Bootstrap 5 framework while maintaining the original design and functionality.

## Key Changes Made

### 1. Framework Integration
- **Replaced custom grid system** with Bootstrap's responsive grid (container, row, col classes)
- **Integrated Bootstrap 5 CSS** from CDN for consistent component styling
- **Added FontAwesome** for consistent icon implementation
- **Maintained custom color scheme** through CSS custom properties

### 2. Navigation System
**Original:**
```css
.navbar {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Bootstrap Version:**
```html
<nav class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">
      <i class="fas fa-code me-2"></i>PSSE
    </a>
    <!-- Bootstrap navbar components -->
  </div>
</nav>
```

### 3. Card Components
**Original Custom Cards:**
```css
.officer-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 180px;
}
```

**Bootstrap Cards:**
```html
<div class="card h-100 shadow-sm">
  <div class="card-body text-center">
    <i class="fas fa-user-tie fa-3x text-primary mb-3"></i>
    <h5 class="card-title">President</h5>
  </div>
</div>
```

### 4. Responsive Grid System
**Original Flexbox:**
```css
.core-activities {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}
```

**Bootstrap Grid:**
```html
<div class="row g-4">
  <div class="col-md-6 col-lg-3">
    <!-- Activity card content -->
  </div>
</div>
```

### 5. Hero/Jumbotron Section
- Converted custom jumbotron to Bootstrap hero section
- Maintained background image overlay effect
- Used Bootstrap typography classes (display-4, lead)
- Preserved brand color scheme

## Color Scheme Preservation
The original color palette was maintained through CSS custom properties:
```css
:root {
  --primary-dark: #0A1B39;
  --primary-blue: #0A3B80;
  --accent-blue: #007BFF;
  --background: #f9f9f9;
}
```

## Bootstrap Components Used

### Core Components
- **Navbar**: Fixed navigation with responsive collapse
- **Cards**: For activities, officers, and events
- **Buttons**: Primary and outline variants
- **Badges**: For tech stack display
- **Grid System**: Responsive layout structure

### Utility Classes
- **Spacing**: `mt-4`, `mb-3`, `px-4`, `py-5`
- **Typography**: `fw-bold`, `text-center`, `display-4`
- **Colors**: `text-primary`, `bg-primary`, `text-white`
- **Display**: `d-none d-md-block`, `d-flex`

## Responsive Breakpoints
Bootstrap's responsive system was utilized for:
- **Mobile**: Stack cards vertically
- **Tablet**: 2-column layouts for activities
- **Desktop**: Full multi-column layouts
- **Large screens**: Optimized spacing and sizing

## Performance Benefits
1. **Reduced CSS**: ~50% reduction in custom CSS code
2. **CDN Delivery**: Faster loading through Bootstrap CDN
3. **Browser Compatibility**: Better cross-browser support
4. **Maintenance**: Easier to maintain with standardized classes

## Migration Checklist
- ✅ Navigation converted to Bootstrap navbar
- ✅ Grid system replaced with Bootstrap containers/rows/cols
- ✅ Custom cards converted to Bootstrap card components
- ✅ Button styling unified with Bootstrap classes
- ✅ Responsive design maintained
- ✅ Custom color scheme preserved
- ✅ Icons integrated with FontAwesome
- ✅ JavaScript functionality maintained

## File Structure
```
project/
├── index.html          # Homepage with hero, activities, tech stack
├── about.html          # About page with history and officers (integrated in SPA)
├── events.html         # Events page with competitions (integrated in SPA)
├── style.css          # Custom CSS working with Bootstrap
└── app.js             # JavaScript for navigation and interactions
```

## Usage Instructions
1. Include Bootstrap 5 CSS from CDN
2. Add FontAwesome for icons
3. Link custom CSS file after Bootstrap
4. Initialize JavaScript for interactive features
5. Use Bootstrap utility classes for spacing and layout
6. Maintain custom branding through CSS variables

This conversion provides a more maintainable, responsive, and professional foundation while preserving the original design intent and university organization aesthetic.