import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, SwitchCamera } from "lucide-react";
import supabase from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface HostHotelRow {
  hotel_id: number;
  name: string;
  city: string;
  country: string;
  price_per_night: number;
  is_active: boolean;
  primary_image_url: string | null;
}

export default function HostPropertiesPage() {
  const [hotels, setHotels] = useState<HostHotelRow[]>([]);

  useEffect(() => {
    async function load() {
      const { data: userId, error: userErr } =
        await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") return;

      const { data, error } = await supabase
        .from("hotels")
        .select(
          "hotel_id, name, city, country, price_per_night, is_active, primary_image_url",
        )
        .eq("host_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setHotels(data as HostHotelRow[]);
    }

    void load();
  }, []);

  async function toggleActive(hotelId: number, next: boolean) {
    setHotels((prev) =>
      prev.map((h) => (h.hotel_id === hotelId ? { ...h, is_active: next } : h)),
    );
    await supabase
      .from("hotels")
      .update({ is_active: next })
      .eq("hotel_id", hotelId);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My properties
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage your listings, availability, and pricing.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/host/dashboard/properties/new">
            <Plus className="mr-2 size-4" />
            Add property
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-[hsl(var(--card))]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price / night</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotels.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]"
                >
                  No properties yet. Create your first listing to start hosting.
                </TableCell>
              </TableRow>
            ) : (
              hotels.map((hotel) => (
                <TableRow key={hotel.hotel_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-12 overflow-hidden rounded-md bg-[hsl(var(--muted))]">
                        {hotel.primary_image_url ? (
                          <img
                            src={hotel.primary_image_url}
                            alt={hotel.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[hsl(var(--muted-foreground))]">
                            <SwitchCamera className="size-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{hotel.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {hotel.city}, {hotel.country}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ${hotel.price_per_night}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={hotel.is_active}
                        onCheckedChange={(checked) =>
                          toggleActive(hotel.hotel_id, checked)
                        }
                      />
                      <Badge variant={hotel.is_active ? "default" : "outline"}>
                        {hotel.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        to={`/host/dashboard/properties/${hotel.hotel_id}/edit`}
                      >
                        Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
