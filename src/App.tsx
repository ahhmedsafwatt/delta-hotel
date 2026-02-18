import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import ClientHome from "./components/ClientHome";
import HotelDetail from "./components/HotelDetail";
import { Toaster } from "./components/ui/sonner";
import HostLogin from "./features/host-dashboard/auth/HostLogin";
import HostDashboardLayout from "./features/host-dashboard/layout/HostDashboardLayout";
import HostOverviewPage from "./features/host-dashboard/pages/HostOverviewPage";
import HostPropertiesPage from "./features/host-dashboard/pages/HostPropertiesPage";
import HostPropertyEditPage from "./features/host-dashboard/pages/HostPropertyEditPage";
import HostBookingsPage from "./features/host-dashboard/pages/HostBookingsPage";
import HostFinancialsPage from "./features/host-dashboard/pages/HostFinancialsPage";
import HostBookingCreatePage from "./features/host-dashboard/pages/HostBookingCreatePage";
import RequireHost from "./features/host-dashboard/auth/RequireHost";
import HostReviewsPage from "./features/host-dashboard/pages/HostReviewsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes - Mobile Responsive */}
        <Route path="/" element={<ClientHome />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />

        {/* Host Routes */}
        <Route path="/host" element={<HostLogin />} />
        <Route
          path="/host/dashboard"
          element={
            <RequireHost>
              <HostDashboardLayout />
            </RequireHost>
          }
        >
          <Route index element={<HostOverviewPage />} />
          <Route path="properties" element={<HostPropertiesPage />} />
          <Route
            path="properties/new"
            element={<HostPropertyEditPage mode="create" />}
          />
          <Route
            path="properties/:hotelId/edit"
            element={<HostPropertyEditPage mode="edit" />}
          />
          <Route path="bookings" element={<HostBookingsPage />} />
          <Route path="bookings/new" element={<HostBookingCreatePage />} />
          <Route path="financials" element={<HostFinancialsPage />} />
          <Route path="reviews" element={<HostReviewsPage />} />
          <Route path="reviews" element={<HostReviewsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
