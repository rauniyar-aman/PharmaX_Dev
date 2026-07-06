# PharmaX — Online Pharmacy Platform

**PharmaX** is a full-stack online pharmacy web application that lets customers browse, order, and pay for medicines online — with prescription uploads, real-time order tracking, and two Nepali payment gateways — while giving admins complete control over inventory, orders, prescriptions, and customers through a dedicated admin panel.

&nbsp;

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Getting Started](#getting-started)
- [Screenshots](#screenshots)
- [User Roles](#user-roles)
- [Author](#author)

&nbsp;

## Introduction

PharmaX solves the problem of having to physically visit a pharmacy for every medicine purchase. A customer registers, browses the catalogue, adds items to their cart, uploads a prescription if the medicine requires one (Rx), and checks out with eSewa, Khalti, or Cash on Delivery. After placing an order the customer can track it through every stage — Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered.

On the other side, the admin panel gives pharmacy staff full visibility: manage the medicine catalogue and categories, monitor stock levels, verify uploaded prescriptions, process and update orders, view customer accounts, and read revenue/order reports — all from a single dashboard.

The project is built end-to-end as an individual effort to practice production-style full-stack web development: a complete React 19 + Tailwind CSS UI, a RESTful Express.js API, PostgreSQL + Prisma ORM as the data layer, JWT-based authentication, Multer for file uploads, Nodemailer for OTP emails, and live integrations with both the eSewa and Khalti sandbox payment APIs.

&nbsp;

## Features

### For Customers

- Sign up with OTP email verification, sign in, forgot password, and restore deleted account flows
- Browse medicines by category with search and filters
- View detailed medicine page — description, dosage, usage, side effects, expiry, stock status, ratings, and customer reviews
- Add to cart, manage quantities, and save items to a wishlist
- Multi-step checkout — Shipping address → Prescription upload → Payment → Order confirmation
- Pay via **eSewa**, **Khalti**, or **Cash on Delivery**
- Upload prescriptions for Rx medicines at checkout; reuse verified prescriptions on future orders
- Track every order through its full delivery lifecycle
- View complete order history with itemised breakdowns
- Leave star ratings and written reviews for purchased medicines
- Real-time notifications — order updates, prescription status alerts, and promotions
- Profile management — avatar upload/remove, personal info, medical details (DOB, gender, blood group, allergies)
- Saved delivery addresses with optional Google Maps picker
- Notification and account settings, secure password change, and soft account deletion

### For Admins

- Dashboard with live KPIs — total revenue, orders, customers, and medicines at a glance
- Medicine catalogue — add, edit, and view medicines with images, pricing, stock, expiry, and category
- Category management — create, edit, and toggle active/inactive categories
- Inventory management — track stock levels and view a full log of stock movements
- Order management — view all orders and update their status at each stage of delivery
- Customer management — browse all registered customers and view individual profiles
- Prescription verification — review uploaded prescriptions and approve or reject them with a reason
- Delivery management — manage delivery zones and charges
- Reports — order and revenue summaries
- Admin profile and settings management

### Shared

- JWT-based authentication with persistent login session
- Role-based access control (Customer vs Admin) enforced on both frontend routes and backend API endpoints
- Real-time notification polling every 30 seconds
- Fully responsive UI — works on desktop, tablet, and mobile
- Light and dark theme support

&nbsp;

## Architecture

PharmaX follows a clean separation between frontend and backend, with each layer having a single responsibility.

```
Browser (React 19)
    │
    │  HTTP / REST (Axios)
    ▼
Express.js Router
    │
    ▼
Middleware (JWT auth, role guard, Multer upload)
    │
    ▼
Controller  ──────────────────────────────────────────▶  External APIs
    │                                                     (eSewa, Khalti,
    ▼                                                      Nodemailer)
Prisma ORM
    │
    ▼
PostgreSQL Database
```

**Frontend layers**

| Layer | Responsibility |
|---|---|
| Pages | Render UI, call API, display state |
| Contexts (`AuthContext`, `CartContext`, `NotificationsContext`) | Shared cross-page state |
| `lib/api.js` | Single Axios instance with base URL and JWT header |
| React Router DOM | Client-side routing with protected and role-based routes |

**Backend layers**

| Layer | Responsibility |
|---|---|
| Routes (`/src/routes/`) | Map HTTP verbs + paths to controllers |
| Middleware | Verify JWT, enforce role, handle file uploads |
| Controllers (`/src/controllers/`) | Validate input, orchestrate business logic, return responses |
| Prisma Client | Type-safe database queries; the only layer that touches PostgreSQL |
| Utils | Email (OTP), notification helper, standard response formatter |

&nbsp;

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Language | JavaScript (ES2022+) |
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3, Material Symbols Outlined icons |
| Routing | React Router DOM 6 |
| HTTP Client | Axios |
| Maps | Google Maps API (`@react-google-maps/api`) |
| Backend Runtime | Node.js (CommonJS) |
| Backend Framework | Express.js 5 |
| ORM | Prisma 5.22.0 |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (`jsonwebtoken`), bcrypt |
| File Uploads | Multer |
| Email | Nodemailer |
| Payments | eSewa (sandbox), Khalti KPG-2 (sandbox) |
| Min Node Version | 18+ |

&nbsp;

## Project Structure

```
PharmaX_web/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # All database models and relations
│   │   ├── seed.js                # Database seeder
│   │   └── migrations/            # Prisma migration history
│   ├── src/
│   │   ├── config/db.js           # Prisma client singleton
│   │   ├── controllers/           # auth, cart, medicines, orders, payment,
│   │   │                          # prescriptions, user, admin, wishlist,
│   │   │                          # categories, notifications
│   │   ├── middleware/            # auth (JWT), errorHandler, upload (Multer)
│   │   ├── routes/                # One route file per resource
│   │   └── utils/                 # email.js, notify.js, response.js
│   ├── uploads/                   # Multer upload destination (gitignored)
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/                    # Static assets (logo, favicon, icons)
    └── src/
        ├── components/
        │   ├── admin/             # AdminLayout, AdminSidebar
        │   ├── address/           # AddressModal
        │   ├── checkout/          # CheckoutSteps
        │   ├── common/            # AuthLayout, Logo
        │   ├── layout/            # Navbar, Footer
        │   ├── layouts/           # DashboardLayout
        │   ├── map/               # MapPicker
        │   ├── navbar/            # DashboardNavbar
        │   ├── notifications/     # NotificationPanel
        │   ├── buttons/           # Button
        │   ├── forms/             # Input
        │   └── sidebar/           # Sidebar (customer)
        ├── context/               # AuthContext, CartContext,
        │                          # NotificationsContext, ThemeContext
        ├── lib/
        │   ├── api.js             # Axios instance
        │   └── checkoutStore.js   # In-memory staged prescription store
        ├── pages/
        │   ├── admin/             # Dashboard, Medicines, Categories,
        │   │                      # Inventory, Orders, Customers,
        │   │                      # Prescriptions, Delivery, Reports,
        │   │                      # Profile, Settings
        │   ├── auth/              # SignIn, SignUp, OtpVerification,
        │   │                      # ForgotPassword, ResetPassword,
        │   │                      # RestoreAccount
        │   ├── cart/              # Cart
        │   ├── categories/        # Categories
        │   ├── checkout/          # CheckoutShipping, CheckoutPrescription,
        │   │                      # CheckoutPayment, OrderConfirmation,
        │   │                      # PaymentFailed
        │   ├── dashboard/         # Dashboard (customer home)
        │   ├── medicines/         # MedicinesListing, MedicineDetails
        │   ├── orders/            # Orders, OrderDetail, TrackOrder
        │   ├── prescriptions/     # Prescriptions
        │   ├── profile/           # Profile
        │   ├── reviews/           # MyReviews
        │   ├── settings/          # Settings
        │   └── wishlist/          # Wishlist
        ├── styles/index.css       # Global styles + Tailwind directives
        ├── App.jsx                # Route definitions
        └── main.jsx               # React entry point
```

&nbsp;

## Database Models

| Model | Purpose |
|---|---|
| `User` | Customers and admins — profile, medical info, notification preferences |
| `Address` | Saved delivery addresses per user, with optional lat/lng |
| `Category` | Medicine categories with icon and active toggle |
| `Medicine` | Full medicine catalogue — pricing, stock, type (Rx/OTC), ratings |
| `Cart` / `CartItem` | Per-user persistent shopping cart |
| `Prescription` | Uploaded prescription files with verification status |
| `Order` / `OrderItem` | Orders with full status lifecycle and payment tracking |
| `Review` | Star rating + comment per user per medicine (one per pair) |
| `WishlistItem` | Saved medicines per user |
| `Notification` | In-app notifications with read/unread state |
| `SystemSetting` | Key-value store for admin-configurable settings |

&nbsp;

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- A Khalti sandbox merchant account ([test-admin.khalti.com](https://test-admin.khalti.com))
- An eSewa sandbox merchant account
- A Google Maps API key (for address picker)
- An email account for Nodemailer (OTP emails)

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/rauniyar-aman/PharmaX_Dev.git
cd PharmaX_Dev
```

**2. Backend**

```bash
cd backend
npm install
```

Create a `.env` file (use `.env.example` as a reference):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pharmax"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
PORT=5000

EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"

ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFY_URL=https://rc-epay.esewa.com.np/api/epay/transaction/status/

KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_API_URL=https://dev.khalti.com/api/v2

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

Push the database schema and seed initial data:

```bash
npx prisma db push
node prisma/seed.js
```

Start the backend:

```bash
npm run dev
```

**3. Frontend**

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

&nbsp;

## Screenshots

### Authentication

| Sign Up | Sign In | Forgot Password |
|---|---|---|
| ![Sign Up](screenshots/signup.png) | ![Sign In](screenshots/signin.png) | ![Forgot Password](screenshots/forgot-password.png) |

### Customer Panel

| Dashboard | Medicine Listing | Medicine Categories |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Medicine Listing](screenshots/medicines.png) | ![Categories](screenshots/categories.png) |

| Orders | Track Order | Wishlist |
|---|---|---|
| ![Orders](screenshots/orders.png) | ![Track Order](screenshots/track-order.png) | ![Wishlist](screenshots/wishlist.png) |

| Prescriptions |
|---|
| ![Prescriptions](screenshots/prescriptions.png) |

&nbsp;

## User Roles

On sign-up, every user is a **Customer** by default. The **Admin** role is assigned directly in the database. Each role lands on a different dashboard and has access to a different set of features:

| | Customer | Admin |
|---|---|---|
| Browse & buy medicines | ✓ | — |
| Cart, wishlist, checkout | ✓ | — |
| Upload prescriptions | ✓ | — |
| Track orders | ✓ | — |
| Reviews & ratings | ✓ | — |
| Manage medicine catalogue | — | ✓ |
| Manage inventory & stock | — | ✓ |
| Verify prescriptions | — | ✓ |
| Manage orders & customers | — | ✓ |
| View reports | — | ✓ |

&nbsp;

## Author

Built and maintained as an individual project by **Aman Rauniyar**.

If you found this project useful, a ⭐ on the repo is appreciated.
