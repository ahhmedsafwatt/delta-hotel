import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Calendar,
  Check,
  BedDouble,
  Bath,
  Landmark,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import supabase from "@/utils/supabase-browser";
import type { Tables } from "@/types/supabase";
import ThemeToggle from "./ThemeToggle";

type Hotel = Tables<"hotels">;
type NearbyPlace = Tables<"hotel_nearby_places">;

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (!id) return;

    async function fetchHotelData() {
      setLoading(true);

      // Fetch hotel details
      const { data: hotelData, error: hotelError } = await supabase
        .from("hotels")
        .select("*")
        .eq("hotel_id", Number(id))
        .single();

      if (hotelError) {
        console.error("Error fetching hotel:", hotelError);
        setLoading(false);
        return;
      }

      setHotel(hotelData);

      // Fetch rating from hotel_listings view
      const { data: listingData } = await supabase
        .from("hotel_listings")
        .select("average_rating, review_count")
        .eq("hotel_id", Number(id))
        .single();

      if (listingData) {
        setAverageRating(listingData.average_rating);
        setReviewCount(listingData.review_count ?? 0);
      }

      // Fetch nearby places
      const { data: placesData } = await supabase
        .from("hotel_nearby_places")
        .select("*")
        .eq("hotel_id", Number(id));

      setNearbyPlaces(placesData ?? []);
      setLoading(false);
    }

    fetchHotelData();
  }, [id]);

  const amenitiesArray = (amenities: unknown): string[] => {
    if (Array.isArray(amenities)) return amenities as string[];
    return [];
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = hotel ? hotel.price_per_night * nights : 0;

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

    // TODO: Replace with Supabase booking insertion
    toast.success("Booking request submitted successfully!");

    setGuestName("");
    setGuestEmail("");
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Hotel Details
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="pb-6">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96">
          <img
            src={hotel.primary_image_url ?? ""}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">
              {averageRating?.toFixed(1) ?? "—"}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Hotel Info */}
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              {hotel.name}
            </h2>
            <div className="flex items-center gap-1 text-muted-foreground mb-4">
              <MapPin className="size-4" />
              <span>
                {hotel.address}, {hotel.city}, {hotel.country}
              </span>
            </div>
            {hotel.description && (
              <p className="text-muted-foreground">{hotel.description}</p>
            )}
          </div>

          {/* Room specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 border border-border">
              <BedDouble className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {hotel.bedrooms} Bedroom{hotel.bedrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 border border-border">
              <Bath className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {hotel.bathrooms} Bathroom{hotel.bathrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 border border-border">
              <Users className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {hotel.max_guests} Guest{hotel.max_guests !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesArray(hotel.amenities).map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  <span className="text-sm text-foreground">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Famous Places */}
          {nearbyPlaces.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-foreground">
                Nearby Attractions
              </h3>
              <div className="space-y-2">
                {nearbyPlaces.map((place) => (
                  <div
                    key={place.place_id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <Landmark className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {place.name}
                      </p>
                      {place.category && (
                        <Badge variant="outline" className="text-xs mt-0.5">
                          {place.category}
                        </Badge>
                      )}
                    </div>
                    {place.distance_m != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {place.distance_m >= 1000
                          ? `${(place.distance_m / 1000).toFixed(1)} km`
                          : `${place.distance_m} m`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Form */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-3xl font-semibold text-foreground">
                  ${hotel.price_per_night}
                </span>
                <span className="text-muted-foreground"> / night</span>
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
                  <Users className="size-4 text-muted-foreground" />
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={hotel.max_guests}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              {nights > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${hotel.price_per_night} × {nights} nights
                    </span>
                    <span className="font-medium text-foreground">
                      ${hotel.price_per_night * nights}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${totalPrice}</span>
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
