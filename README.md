# CustoSasho - Custom Graduation Stole Platform

A luxury custom graduation stole ordering platform built with React, Vite, Supabase, and Tailwind CSS. Features elegant black, gold, and kente-inspired design celebrating African heritage.

## Features

### Customer Features
- 🎨 **Interactive Stole Designer** - Real-time preview canvas with customization options
- 📦 **Three Package Tiers** - Basic, Standard, and Premium with different features
- 🎨 **Live Customization**
  - Color selection (Kente-inspired palette)
  - Custom text with multiple fonts
  - Symbols and graphics (Standard & Premium)
  - Fabric selection
  - Metallic thread options (Premium)
- 💾 **Save Draft Designs** - Continue designing later
- 📱 **Fully Responsive** - Beautiful on all devices
- ✨ **Smooth Animations** - Framer Motion throughout

### User Dashboard
- View all orders with status tracking
- Manage saved draft designs
- Quick access to designer

### Admin Dashboard
- Order management with status updates
- Analytics overview
- View all customer orders
- Update order statuses (Pending → Confirmed → In Production → Completed → Delivered)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom gold/kente color scheme
- **Animations**: Framer Motion
- **Routing**: React Router DOM v6
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Deployment**: Vercel-ready with vercel.json

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The database schema has already been created with the following tables:
- `user_profiles` - User information and roles
- `orders` - Customer orders with design data
- `draft_designs` - Saved draft designs

### 3. Create an Admin User (Optional)
After creating a regular account, update the role in the database:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── StolePreview.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── constants.ts
│   └── supabase.ts
├── pages/
│   ├── AboutPage.tsx
│   ├── AdminDashboard.tsx
│   ├── ContactPage.tsx
│   ├── DashboardPage.tsx
│   ├── DesignerPage.tsx
│   ├── GalleryPage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## Package Tiers

### Basic ($89)
- Single color selection
- Custom text (up to 50 characters)
- Standard fonts (3 options)
- Premium satin fabric
- 2-week delivery

### Standard ($149)
- Two color combinations
- Custom text (up to 100 characters)
- Extended font library (8 options)
- Simple graphics and symbols
- Premium satin or silk fabric
- 10-day delivery

### Premium ($249)
- Multi-color combinations (up to 4 colors)
- Unlimited custom text
- Full font library access
- Custom logo upload
- Complex embroidery patterns
- Metallic thread options (gold, silver)
- Luxury velvet or silk fabric
- 1-week rush delivery

## Key Pages

- `/` - Landing page with hero, features, packages, gallery
- `/designer` - Interactive stole designer
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin dashboard (protected, admin only)
<!-- /packages removed; packages are displayed on the landing page and designer flows -->
- `/gallery` - Design gallery
- `/about` - About CustoSasho
- `/contact` - Contact form
- `/login` - User login
- `/register` - User registration

## Authentication

The platform uses Supabase Authentication with email/password. Users can:
- Register new accounts
- Login/logout
- Access protected routes
- Admin users have access to the admin dashboard

## Order Flow

1. Customer selects package tier
2. Designs stole with real-time preview
3. Can save as draft or place order
4. Order is created with status "Pending"
5. Admin updates status through admin dashboard
6. Status flow: Pending → Confirmed → In Production → Completed → Delivered

## Deployment

The project includes a `vercel.json` file configured for Vercel deployment with proper client-side routing support.

```bash
# Deploy to Vercel
vercel
```

## Design System

### Colors
- **Gold**: Primary brand color (#D4AF37)
- **Black**: Background and text
- **Kente Colors**: Red, Green, Blue, Yellow, Orange
- **Gray Scale**: Various shades for UI elements

### Typography
- **Display**: Cinzel (headings, logo)
- **Serif**: Playfair Display (elegant text)
- **Sans**: Inter (body text, UI)

### Animations
All page transitions and interactions use Framer Motion for smooth, professional animations.

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have elevated permissions for order management
- Secure authentication flow with Supabase

## License

MIT
