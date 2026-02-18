import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import supabase from "@/utils/supabase-browser";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Hotel {
  hotel_id: number;
  name: string;
  city: string;
  country: string;
  price_per_night: number;
}

interface Guest {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function HostBookingCreatePage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState({
    hotel_id: "",
    guest_id: "",
    check_in_date: "",
    check_out_date: "",
    num_guests: 1,
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const { data: userId, error: userErr } =
        await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") {
        console.error(userErr);
        return;
      }

      // Load host's hotels
      const { data: hotelsData, error: hotelsError } = await supabase
        .from("hotels")
        .select("hotel_id, name, city, country, price_per_night")
        .eq("host_id", userId)
        .eq("is_active", true)
        .order("name");

      if (hotelsError) {
        console.error(hotelsError);
        return;
      }

      setHotels(hotelsData || []);

      // Load all users as potential guests (in a real app, you might want to filter this)
      const { data: guestsData, error: guestsError } = await supabase
        .from("users")
        .select("user_id, first_name, last_name, email")
        .order("first_name");

      if (guestsError) {
        console.error(guestsError);
        return;
      }

      setGuests(guestsData || []);
    }

    void load();
  }, []);

  const calculateNights = () => {
    if (!form.check_in_date || !form.check_out_date) return 0;
    const checkIn = new Date(form.check_in_date);
    const checkOut = new Date(form.check_out_date);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateTotalPrice = () => {
    const selectedHotel = hotels.find(h => h.hotel_id.toString() === form.hotel_id);
    if (!selectedHotel) return 0;
    const nights = calculateNights();
    return selectedHotel.price_per_night * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.hotel_id || !form.guest_id || !form.check_in_date || !form.check_out_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(form.check_out_date) <= new Date(form.check_in_date)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setIsSaving(true);

    try {
      const totalPrice = calculateTotalPrice();

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          hotel_id: parseInt(form.hotel_id),
          guest_id: parseInt(form.guest_id),
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          num_guests: form.num_guests,
          total_price: totalPrice,
          status: "confirmed", // Host-created bookings are automatically confirmed
          notes: form.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        toast.error("Failed to create booking");
        return;
      }

      // Create payment record for host-created booking
      if (booking) {
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            booking_id: booking.booking_id,
            amount: totalPrice,
            payment_method: "host_created", // Special method for host-created bookings
            status: "completed",
            payment_date: new Date().toISOString(), // Today's date
          });

        if (paymentError) {
          console.error("Payment creation failed:", paymentError);
          // Don't fail the whole operation, but log the error
        }

        // Send notification to guest about booking creation
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: parseInt(form.guest_id),
            title: "New Booking Created",
            message: `A new booking has been created for you at ${hotels.find(h => h.hotel_id.toString() === form.hotel_id)?.name || 'your destination'}.`,
            type: "booking_created",
            related_booking_id: booking.booking_id,
          });

        if (notificationError) {
          console.error("Notification creation failed:", notificationError);
          // Don't fail the whole operation
        }
      }

      toast.success("Booking created successfully!");
      navigate("/host/dashboard/bookings");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create Custom Booking</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Create a booking for a guest on one of your properties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="hotel">Property *</Label>
              <Select value={form.hotel_id} onValueChange={(value) => setForm(prev => ({ ...prev, hotel_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.hotel_id} value={hotel.hotel_id.toString()}>
                      {hotel.name} - {hotel.city}, {hotel.country} (${hotel.price_per_night}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="guest">Guest *</Label>
              <Select value={form.guest_id} onValueChange={(value) => setForm(prev => ({ ...prev, guest_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.user_id} value={guest.user_id.toString()}>
                      {guest.first_name} {guest.last_name} ({guest.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkin">Check-in Date *</Label>
                <Input
                  id="checkin"
                  type="date"
                  value={form.check_in_date}
                  onChange={(e) => setForm(prev => ({ ...prev, check_in_date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkout">Check-out Date *</Label>
                <Input
                  id="checkout"
                  type="date"
                  value={form.check_out_date}
                  onChange={(e) => setForm(prev => ({ ...prev, check_out_date: e.target.value }))}
                  min={form.check_in_date || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="guests">Number of Guests *</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                value={form.num_guests}
                onChange={(e) => setForm(prev => ({ ...prev, num_guests: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special notes or requirements..."
                rows={3}
              />
            </div>

            {nights > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${hotels.find(h => h.hotel_id.toString() === form.hotel_id)?.price_per_night || 0} × {nights} nights
                  </span>
                  <span className="font-medium text-foreground">
                    ${totalPrice}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${totalPrice}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/host/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}