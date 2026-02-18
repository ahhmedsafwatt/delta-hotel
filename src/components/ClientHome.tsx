import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  BedDouble,
  Bath,
  Users,
  Loader2,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import supabase from "@/utils/supabase-browser";
import type { Tables } from "@/types/supabase";
import ThemeToggle from "./ThemeToggle";

type HotelListing = Tables<"hotel_listings">;

export default function ClientHome() {
  const [hotels, setHotels] = useState<HotelListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredHotels, setFilteredHotels] = useState<HotelListing[]>([]);

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      const { data, error } = await supabase.from("hotel_listings").select("*");

      if (error) {
        console.error("Error fetching hotels:", error);
      } else {
        setHotels(data ?? []);
      }
      setLoading(false);
    }
    fetchHotels();
  }, []);

  useEffect(() => {
    let filtered = [...hotels];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.country?.toLowerCase().includes(q),
      );
    }

    filtered = filtered.filter(
      (h) =>
        (h.price_per_night ?? 0) >= priceRange[0] &&
        (h.price_per_night ?? 0) <= priceRange[1],
    );

    setFilteredHotels(filtered);
  }, [searchQuery, hotels, priceRange]);

  const amenitiesArray = (amenities: unknown): string[] => {
    if (Array.isArray(amenities)) return amenities as string[];
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">StayBook</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/host">
                <Button variant="ghost" size="sm">
                  Host Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="text"
                placeholder="Search hotels, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[300px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your hotel search</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label>
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hotel Grid */}
      <main className="p-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredHotels.length} hotels found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hotels found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map((hotel) => (
              <Link key={hotel.hotel_id} to={`/hotel/${hotel.hotel_id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={hotel.primary_image_url ?? ""}
                      alt={hotel.name ?? ""}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">
                        {hotel.average_rating?.toFixed(1) ?? "—"}
                      </span>
                      {hotel.review_count != null && hotel.review_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({hotel.review_count})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="size-3" />
                      <span>
                        {hotel.city}, {hotel.country}
                      </span>
                    </div>

                    {/* Room details */}
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                      <span className="flex items-center gap-1">
                        <BedDouble className="size-3" />
                        {hotel.bedrooms} bed{hotel.bedrooms !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="size-3" />
                        {hotel.bathrooms} bath{hotel.bathrooms !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {hotel.max_guests} guest
                        {hotel.max_guests !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {amenitiesArray(hotel.amenities)
                        .slice(0, 3)
                        .map((amenity) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="text-xs"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      {amenitiesArray(hotel.amenities).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{amenitiesArray(hotel.amenities).length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-semibold text-foreground">
                          ${hotel.price_per_night}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {" "}
                          / night
                        </span>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
