import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router";

interface HostBookingRow {
  booking_id: number;
  status: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  hotel_name: string | null;
  guest_first_name: string | null;
  guest_last_name: string | null;
}

export default function HostBookingsPage() {
  const [rows, setRows] = useState<HostBookingRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<HostBookingRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const [hotels, setHotels] = useState<Array<{ hotel_id: number; name: string }>>([]);

  useEffect(() => {
    async function load() {
      const { data: userId, error: userErr } =
        await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") return;

      // Load host's hotels for filter
      const { data: hotelsData } = await supabase
        .from("hotels")
        .select("hotel_id, name")
        .eq("host_id", userId)
        .order("name");

      setHotels(hotelsData || []);

      const { data, error } = await supabase
        .from("booking_details")
        .select(
          "booking_id, status, check_in_date, check_out_date, num_guests, total_price, hotel_name, guest_first_name, guest_last_name, hotel_id",
        )
        .in(
          "hotel_id",
          (
            await supabase
              .from("hotels")
              .select("hotel_id")
              .eq("host_id", userId)
          ).data?.map((h) => h.hotel_id) ?? [],
        )
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error(error);
        return;
      }

      const bookingRows = data.map((row) => ({
        booking_id: row.booking_id!,
        status: row.status!,
        check_in_date: row.check_in_date!,
        check_out_date: row.check_out_date!,
        num_guests: row.num_guests!,
        total_price: row.total_price!,
        hotel_name: row.hotel_name,
        guest_first_name: row.guest_first_name,
        guest_last_name: row.guest_last_name,
      }));

      setRows(bookingRows);
      setFilteredRows(bookingRows);
    }

    void load();
  }, []);

  // Filter bookings when filters change
  useEffect(() => {
    let filtered = rows;

    if (statusFilter !== "all") {
      filtered = filtered.filter(row => row.status === statusFilter);
    }

    if (hotelFilter !== "all") {
      const hotelId = parseInt(hotelFilter);
      // Since we don't have hotel_id in the booking details view, we'll filter by hotel_name
      const selectedHotel = hotels.find(h => h.hotel_id === hotelId);
      if (selectedHotel) {
        filtered = filtered.filter(row => row.hotel_name === selectedHotel.name);
      }
    }

    setFilteredRows(filtered);
  }, [rows, statusFilter, hotelFilter, hotels]);

  async function updateStatus(id: number, status: string) {
    // Get current booking status first
    const currentBooking = rows.find(r => r.booking_id === id);
    if (!currentBooking) return;

    // Only allow completing bookings that are confirmed
    if (status === "completed" && currentBooking.status !== "confirmed") {
      return; // Don't allow completing non-confirmed bookings
    }

    // Update booking status
    await supabase
      .from("bookings")
      .update({
        status: status as "pending" | "confirmed" | "completed" | "cancelled",
      })
      .eq("booking_id", id);

    // Send notification for status change
    if (status === "confirmed") {
      // Get guest info for notification
      const { data: bookingDetails } = await supabase
        .from("booking_details")
        .select("guest_id, guest_first_name, guest_last_name, hotel_name")
        .eq("booking_id", id)
        .single();

      if (bookingDetails && bookingDetails.guest_id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: bookingDetails.guest_id,
            title: "Booking Confirmed",
            message: `Your booking at ${bookingDetails.hotel_name} has been confirmed.`,
            type: "booking_confirmed",
            related_booking_id: id,
          });
      }
    }

    // If completing a booking, create a payment record if one doesn't exist
    if (status === "completed") {
      // Check if payment already exists
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("payment_id")
        .eq("booking_id", id)
        .single();

      if (!existingPayment) {
        // Get booking details for payment amount
        const { data: booking } = await supabase
          .from("bookings")
          .select("*")
          .eq("booking_id", id)
          .single();

        if (booking) {
          // Create payment record
          await supabase
            .from("payments")
            .insert({
              booking_id: id,
              amount: booking.total_price,
              payment_method: rows.find(r => r.booking_id === id)?.hotel_name + 'host created', // Special method for host-created payments
              status: "completed",
              payment_date: new Date().toISOString().split('T')[0], // Today's date 
              
            });
        }
      }
    }

    // Update local state
    setRows((prev) =>
      prev.map((row) => (row.booking_id === id ? { ...row, status } : row)),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage reservations across your properties.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/host/dashboard/bookings/new">
            <Plus className="mr-2 size-4" />
            Create booking
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Property</label>
              <Select value={hotelFilter} onValueChange={setHotelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.hotel_id} value={hotel.hotel_id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border bg-[hsl(var(--card))]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-medium">Booking ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.booking_id}>
                  <TableCell className="text-sm font-medium">
                    {row.booking_id} 
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-medium">
                      {row.guest_first_name} {row.guest_last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{row.hotel_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {row.check_in_date} → {row.check_out_date}
                    </div>
                  </TableCell>
                  <TableCell>{row.num_guests}</TableCell>
                  <TableCell className="text-sm font-medium">
                    ${row.total_price}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {row.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(row.booking_id, "confirmed")
                          }
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(row.booking_id, "cancelled")
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {row.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(row.booking_id, "completed")
                          }
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(row.booking_id, "cancelled")
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}
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
