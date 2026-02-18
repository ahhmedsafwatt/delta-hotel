import { useEffect, useState } from "react";
import { DollarSign, Building2, Clock, Star, Plus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import supabase from "@/utils/supabase-browser";

interface KpiData {
  totalRevenue: number;
  activeListings: number;
  pendingBookings: number;
  averageRating: number | null;
}

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
}

export default function HostOverviewPage() {
  const [kpis, setKpis] = useState<KpiData>({
    totalRevenue: 0,
    activeListings: 0,
    pendingBookings: 0,
    averageRating: null,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function load() {
      const { data: userId, error: userErr } =
        await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") {
        console.error(userErr);
        return;
      }

      // Active listings
      const { count: activeListings } = await supabase
        .from("hotels")
        .select("hotel_id", { count: "exact", head: true })
        .eq("host_id", userId)
        .eq("is_active", true);

      // Pending bookings for host hotels
      const { count: pendingBookings } = await supabase
        .from("bookings")
        .select("booking_id", { count: "exact", head: true })
        .eq("status", "pending")
        .in(
          "hotel_id",
          (
            await supabase
              .from("hotels")
              .select("hotel_id")
              .eq("host_id", userId)
          ).data?.map((h) => h.hotel_id) ?? [],
        );

      // Total revenue (all payments, not just completed)
      const { data: revenueRows } = await supabase
        .from("payments")
        .select("amount, bookings!inner(hotel_id)")
        .in(
          "bookings.hotel_id",
          (
            await supabase
              .from("hotels")
              .select("hotel_id")
              .eq("host_id", userId)
          ).data?.map((h) => h.hotel_id) ?? [],
        );

      const totalRevenue =
        revenueRows?.reduce((sum, row: any) => sum + (row.amount ?? 0), 0) ?? 0;

      const { data: ratings } = await supabase
        .from("reviews")
        .select("rating, hotel_id")
        .in(
          "hotel_id",
          (
            await supabase
              .from("hotels")
              .select("hotel_id")
              .eq("host_id", userId)
          ).data?.map((h) => h.hotel_id) ?? [],
        );

      const averageRating =
        ratings && ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : null;

      setKpis({
        totalRevenue,
        activeListings: activeListings ?? 0,
        pendingBookings: pendingBookings ?? 0,
        averageRating,
      });

      // Recent activity: notifications for host user + recent bookings on their hotels
      const { data: notifications } = await supabase
        .from("notifications")
        .select("notification_id, title, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentBookings } = await supabase
        .from("booking_details")
        .select("booking_id, hotel_name, created_at, status, hotel_id")
        .in(
          "hotel_id",
          (
            await supabase
              .from("hotels")
              .select("hotel_id")
              .eq("host_id", userId)
          ).data?.map((h) => h.hotel_id) ?? [],
        )
        .order("created_at", { ascending: false })
        .limit(5);

      const items: ActivityItem[] = [];

      notifications?.forEach((n) => {
        items.push({
          id: `notification-${n.notification_id}`,
          title: n.title,
          timestamp: n.created_at,
        });
      });

      recentBookings?.forEach((b) => {
        items.push({
          id: `booking-${b.booking_id}`,
          title: `Booking ${b.status} · ${b.hotel_name}`,
          timestamp: b.created_at!,
        });
      });

      items.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

      setActivity(items.slice(0, 6));
    }

    void load();
  }, []);

  const cards = [
    {
      label: "Total revenue",
      value: kpis.totalRevenue.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
      }),
      icon: DollarSign,
    },
    {
      label: "Active listings",
      value: kpis.activeListings.toString(),
      icon: Building2,
    },
    {
      label: "Pending bookings",
      value: kpis.pendingBookings.toString(),
      icon: Clock,
    },
    {
      label: "Average rating",
      value: kpis.averageRating ? kpis.averageRating.toFixed(1) : "–",
      icon: Star,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard overview
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          High-level performance for your properties.
        </p>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  {card.label}
                </CardTitle>
                <div className="flex size-8 items-center justify-center rounded-md bg-[hsl(var(--accent))]">
                  <Icon className="size-4 text-[hsl(var(--accent-foreground))]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <p className="text-sm">{item.title}</p>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="h-12">
          <Link to="/host/dashboard/properties/new">
            <Plus className="mr-2 size-4" />
            Create new property
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link to="/host/dashboard/bookings/new">
            <Calendar className="mr-2 size-4" />
            Create custom booking
          </Link>
        </Button>
      </div>
      </div>
      
      
    </div>
  );
}
