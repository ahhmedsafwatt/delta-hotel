import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import ClientHome from "./components/ClientHome";
import HotelDetail from "./components/HotelDetail";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import DashboardOverview from "./components/DashboardOverview";
import HotelManagement from "./components/HotelManagement";
import BookingManagement from "./components/BookingManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes - Mobile Responsive */}
        <Route path="/" element={<ClientHome />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />

        {/* Admin Routes - Desktop Optimized */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="hotels" element={<HotelManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
