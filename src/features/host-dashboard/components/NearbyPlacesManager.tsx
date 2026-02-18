import { useEffect, useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import supabase from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FamousPlace {
  place_id: number;
  name: string;
  category: string | null;
  city: string;
  primary_image_url: string | null;
}

interface LinkedPlace {
  place_id: number;
  name: string;
  distance_m: number | null;
}

interface NearbyPlacesManagerProps {
  hotelId: number | null;
  hotelCity: string;
  linkedPlaces: LinkedPlace[];
  onLinkedPlacesChange: (places: LinkedPlace[]) => void;
}

export function NearbyPlacesManager({
  hotelId,
  hotelCity,
  linkedPlaces,
  onLinkedPlacesChange,
}: NearbyPlacesManagerProps) {
  const [availablePlaces, setAvailablePlaces] = useState<FamousPlace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [distanceInput, setDistanceInput] = useState("");

  useEffect(() => {
    async function load() {
      if (!hotelCity) return;

      const { data, error } = await supabase
        .from("famous_places")
        .select("place_id, name, category, city, primary_image_url")
        .eq("city", hotelCity.charAt(0).toUpperCase() + hotelCity.slice(1))
        .order("name");

      if (error) {
        console.error(error);
        return;
      }

      setAvailablePlaces((data as FamousPlace[]) ?? []);
    }

    void load();
  }, [hotelCity]);

  const filteredPlaces = availablePlaces.filter(
    (p) =>
      !linkedPlaces.some((lp) => lp.place_id === p.place_id) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  async function handleAdd() {
    if (!selectedPlaceId || !hotelId) return;

    const place = availablePlaces.find((p) => p.place_id === selectedPlaceId);
    if (!place) return;

    const distance = distanceInput ? Number(distanceInput) : null;
    if (distance !== null && (isNaN(distance) || distance < 0)) {
      toast.error("Distance must be a positive number.");
      return;
    }

    const { error } = await supabase.from("hotel_famous_places").insert({
      hotel_id: hotelId,
      place_id: selectedPlaceId,
      distance_m: distance,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to link place.");
      return;
    }

    onLinkedPlacesChange([
      ...linkedPlaces,
      { place_id: selectedPlaceId, name: place.name, distance_m: distance },
    ]);

    setSelectedPlaceId(null);
    setDistanceInput("");
    toast.success("Place linked.");
  }

  async function handleRemove(placeId: number) {
    if (!hotelId) return;

    const { error } = await supabase
      .from("hotel_famous_places")
      .delete()
      .eq("hotel_id", hotelId)
      .eq("place_id", placeId);

    if (error) {
      console.error(error);
      toast.error("Failed to unlink place.");
      return;
    }

    onLinkedPlacesChange(linkedPlaces.filter((p) => p.place_id !== placeId));
    toast.success("Place unlinked.");
  }

  async function handleUpdateDistance(
    placeId: number,
    distance: number | null,
  ) {
    if (!hotelId) return;

    const { error } = await supabase
      .from("hotel_famous_places")
      .update({ distance_m: distance })
      .eq("hotel_id", hotelId)
      .eq("place_id", placeId);

    if (error) {
      console.error(error);
      toast.error("Failed to update distance.");
      return;
    }

    onLinkedPlacesChange(
      linkedPlaces.map((p) =>
        p.place_id === placeId ? { ...p, distance_m: distance } : p,
      ),
    );
  }

  if (!hotelId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Nearby places</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Save the property first to manage nearby places.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Nearby places</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Search places in {hotelCity}</Label>
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredPlaces.length > 0 && (
          <div className="space-y-2">
            <Label>Select place</Label>
            <select
              className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
              value={selectedPlaceId ?? ""}
              onChange={(e) =>
                setSelectedPlaceId(Number(e.target.value) || null)
              }
            >
              <option value="">Choose a place...</option>
              {filteredPlaces.map((place) => (
                <option key={place.place_id} value={place.place_id}>
                  {place.name} {place.category ? `(${place.category})` : ""}
                </option>
              ))}
            </select>
            {selectedPlaceId && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Distance (meters)"
                  value={distanceInput}
                  onChange={(e) => setDistanceInput(e.target.value)}
                  min={0}
                />
                <Button type="button" size="sm" onClick={handleAdd}>
                  <Plus className="mr-1 size-3" />
                  Add
                </Button>
              </div>
            )}
          </div>
        )}

        {linkedPlaces.length > 0 && (
          <div className="space-y-2">
            <Label>Linked places</Label>
            <div className="space-y-2">
              {linkedPlaces.map((place) => (
                <div
                  key={place.place_id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm font-medium">{place.name}</span>
                    <Input
                      type="number"
                      placeholder="Distance (m)"
                      value={place.distance_m ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = val ? Number(val) : null;
                        handleUpdateDistance(place.place_id, num);
                      }}
                      className="w-24"
                      min={0}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(place.place_id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {linkedPlaces.length === 0 && filteredPlaces.length === 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No places found in {hotelCity}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
