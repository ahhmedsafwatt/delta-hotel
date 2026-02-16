import { useNavigate, Link, Outlet, useLocation } from "react-router";
import {
  Hotel,
  Building2,
  Calendar,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { storageService } from "../data/mockData";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    storageService.logout();
    toast.success("Logged out successfully");
    navigate("/admin");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin/dashboard" },
    { icon: Building2, label: "Hotels", path: "/admin/dashboard/hotels" },
    { icon: Calendar, label: "Bookings", path: "/admin/dashboard/bookings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:block">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Hotel className="size-8 text-blue-600" />
            <div>
              <h1 className="font-semibold text-lg">StayBook</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar for mobile */}
        <header className="bg-white border-b p-4 lg:hidden flex items-center justify-between">
          <h1 className="font-semibold">Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="size-5" />
          </Button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
