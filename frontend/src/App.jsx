import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Admin Panel
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMedicines from './pages/admin/AdminMedicines'
import AdminAddMedicine from './pages/admin/AdminAddMedicine'
import AdminViewMedicine from './pages/admin/AdminViewMedicine'
import AdminInventoryLog from './pages/admin/AdminInventoryLog'
import AdminCategories from './pages/admin/AdminCategories'
import AdminAddCategory from './pages/admin/AdminAddCategory'
import AdminCategoryDetails from './pages/admin/AdminCategoryDetails'
import AdminInventory from './pages/admin/AdminInventory'
import AdminInventoryDetails from './pages/admin/AdminInventoryDetails'
import AdminProfile from './pages/admin/AdminProfile'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPrescriptions from './pages/admin/AdminPrescriptions'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail'
import AdminReports from './pages/admin/AdminReports'
import AdminDelivery from './pages/admin/AdminDelivery'
import AdminSettings from './pages/admin/AdminSettings'

// Public pages
import Home from './pages/Home'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ForgotPasswordVerify from './pages/auth/ForgotPasswordVerify'
import OtpVerification from './pages/auth/OtpVerification'
import OtpVerified from './pages/auth/OtpVerified'
import ResetPasswordSuccess from './pages/auth/ResetPasswordSuccess'
import RestoreAccount from './pages/auth/RestoreAccount'

// Dashboard layout + pages
import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import MedicinesListing from './pages/medicines/MedicinesListing'
import MedicineDetails from './pages/medicines/MedicineDetails'
import Categories from './pages/categories/Categories'
import Cart from './pages/cart/Cart'

// Checkout
import CheckoutShipping from './pages/checkout/CheckoutShipping'
import CheckoutPrescription from './pages/checkout/CheckoutPrescription'
import CheckoutPayment from './pages/checkout/CheckoutPayment'
import OrderConfirmation from './pages/checkout/OrderConfirmation'
import PaymentFailed from './pages/checkout/PaymentFailed'

// Orders
import Orders from './pages/orders/Orders'
import OrderDetail from './pages/orders/OrderDetail'
import TrackOrder from './pages/orders/TrackOrder'

// Other dashboard pages
import Wishlist from './pages/wishlist/Wishlist'
import Prescriptions from './pages/prescriptions/Prescriptions'
import MyReviews from './pages/reviews/MyReviews'
import Profile from './pages/profile/Profile'
import Settings from './pages/settings/Settings'

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password-verify" element={<ForgotPasswordVerify />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/otp-verified" element={<OtpVerified />} />
      <Route path="/reset-success" element={<ResetPasswordSuccess />} />
      <Route path="/restore-account" element={<RestoreAccount />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="medicines" element={<MedicinesListing />} />
        <Route path="medicines/:id" element={<MedicineDetails />} />
        <Route path="categories" element={<Categories />} />
        <Route path="cart" element={<Cart />} />

        {/* Checkout */}
        <Route path="checkout" element={<Navigate to="checkout/shipping" replace />} />
        <Route path="checkout/shipping" element={<CheckoutShipping />} />
        <Route path="checkout/prescription" element={<CheckoutPrescription />} />
        <Route path="checkout/payment" element={<CheckoutPayment />} />
        <Route path="checkout/confirmation" element={<OrderConfirmation />} />
        <Route path="checkout/failed" element={<PaymentFailed />} />

        {/* Orders */}
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetail />} />
        <Route path="track-order/:orderId" element={<TrackOrder />} />

        {/* Other Pages */}
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="reviews" element={<MyReviews />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="medicines" element={<AdminMedicines />} />
        <Route path="medicines/add" element={<AdminAddMedicine />} />
        <Route path="medicines/:id" element={<AdminViewMedicine />} />
        <Route path="medicines/:id/edit" element={<AdminAddMedicine />} />
        <Route path="medicines/:id/inventory" element={<AdminInventoryLog />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/add" element={<AdminAddCategory />} />
        <Route path="categories/:id" element={<AdminCategoryDetails />} />
        <Route path="categories/:id/edit" element={<AdminAddCategory />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="inventory/:id" element={<AdminInventoryDetails />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="prescriptions" element={<AdminPrescriptions />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<AdminCustomerDetail />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
