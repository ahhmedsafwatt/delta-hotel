import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Star, Users, Calendar, Check } from "lucide-react";
import type { Hotel } from "../types";
import { storageService } from "../data/mockData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);

  // Booking form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const hotels = storageService.getHotels();
    const foundHotel = hotels.find((h) => h.id === id);
    setHotel(foundHotel || null);
  }, [id]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const totalPrice = hotel ? hotel.price * nights : 0;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName || !guestEmail || !checkIn || !checkOut) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    const newBooking = {
      id: `b${Date.now()}`,
      hotelId: hotel!.id,
      hotelName: hotel!.name,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "pending" as const,
      createdAt: new Date().toISOString().split("T")[0],
    };

    storageService.addBooking(newBooking);
    toast.success("Booking request submitted successfully!");

    // Reset form
    setGuestName("");
    setGuestEmail("");
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
  };

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">Hotel Details</h1>
        </div>
      </header>

      <main className="pb-6">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{hotel.rating}</span>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Hotel Info */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">{hotel.name}</h2>
            <div className="flex items-center gap-1 text-gray-600 mb-4">
              <MapPin className="size-4" />
              <span>
                {hotel.location}, {hotel.city}, {hotel.country}
              </span>
            </div>
            <p className="text-gray-700">{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {hotel.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-3xl font-semibold">${hotel.price}</span>
                <span className="text-gray-600"> / night</span>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="checkin">Check-in</Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkout">Check-out</Label>
                  <Input
                    id="checkout"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guests">Guests</Label>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-gray-500" />
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              {nights > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ${hotel.price} × {nights} nights
                    </span>
                    <span className="font-medium">${hotel.price * nights}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                <Calendar className="size-4 mr-2" />
                Request Booking
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
