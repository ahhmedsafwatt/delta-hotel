import { Outlet, NavLink, useNavigate } from "react-router";
import {
  Menu,
  LogOut,
  Hotel,
  Calendar,
  Wallet,
  Star,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase-browser";
import ThemeToggle from "@/components/ThemeToggle";
import type { Tables } from "@/types/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { label: "Overview", to: "/host/dashboard", icon: Home },
  { label: "My properties", to: "/host/dashboard/properties", icon: Hotel },
  { label: "Bookings", to: "/host/dashboard/bookings", icon: Calendar },
  { label: "Financials", to: "/host/dashboard/financials", icon: Wallet },
  { label: "Reviews", to: "/host/dashboard/reviews", icon: Star },
];

export default function HostDashboardLayout() {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user , setuser] = useState<Tables<"users"> | null>(null);
  useEffect(() => {
    async function loadUser() {
      const { data: userId, error: userErr } =
        await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") return;
      const { data: userData, error: userDataErr } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (userDataErr || !userData) {
        console.error(userDataErr);
        return;
      }
      setuser(userData)
    }
    loadUser();
  }, []); 



  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/host");
  }

  const sidebarContent = (
    <div className="flex fixed w-60 top-0 h-full flex-col border-r bg-card">
      <div
        className="flex items-center gap-2 border-b px-4 py-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
          <Hotel className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">StayBook</p>
          <p className="text-sm font-semibold">Host dashboard</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/host/dashboard"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")
              }
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t px-4 py-4">
        <Button
          variant="outline"
          className="w-full justify-center"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">{sidebarContent}</aside>

      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2 z-30 md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-fit">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:justify-end">
          <div className="flex flex-1 items-center gap-3 md:justify-end">
            <ThemeToggle />
            <div className="hidden text-sm text-muted-foreground md:block">
              
              
                {user ? <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage>
                      {user.profile_photo_url ? user.profile_photo_url : ``}
                    </AvatarImage>
                    <AvatarFallback>
                      {user.first_name ? user.first_name[0] : "U"}
                      {user.last_name ? user.last_name[0] : "N"}
                    </AvatarFallback>
                  </Avatar>

                <span>{user.first_name} {user.last_name}</span>
              
              </div>: "Loading user..."}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
