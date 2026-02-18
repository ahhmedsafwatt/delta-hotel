import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import supabase from "@/utils/supabase-browser";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { HotelImageManager } from "../components/HotelImageManager";
import { NearbyPlacesManager } from "../components/NearbyPlacesManager";

interface HostPropertyEditPageProps {
  mode: "create" | "edit";
}

export default function HostPropertyEditPage({
  mode,
}: HostPropertyEditPageProps) {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [linkedPlaces, setLinkedPlaces] = useState<
    Array<{ place_id: number; name: string; distance_m: number | null }>
  >([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    price_per_night: 0,
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: "",
  });

  useEffect(() => {
    async function load() {
      if (mode === "edit" && hotelId) {
        const { data, error } = await supabase
          .from("hotels")
          .select(
            "name, description, address, city, country, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, primary_image_url",
          )
          .eq("hotel_id", Number(hotelId))
          .single();

        if (error || !data) return;

        setForm({
          name: data.name,
          description: data.description ?? "",
          address: data.address,
          city: data.city,
          country: data.country,
          price_per_night: data.price_per_night,
          max_guests: data.max_guests,
          bedrooms: data.bedrooms ?? 0,
          bathrooms: data.bathrooms ?? 0,
          amenities: Array.isArray(data.amenities)
            ? data.amenities.join(", ")
            : "",
        });

        setImages(
          Array.isArray(data.images)
            ? data.images.map((image: any) => image as string)
            : [],
        );
        setPrimaryImageUrl(data.primary_image_url ?? null);

        // Load linked places
        const { data: placesData } = await supabase
          .from("hotel_nearby_places")
          .select("place_id, name, distance_m")
          .eq("hotel_id", Number(hotelId));

        if (placesData) {
          setLinkedPlaces(
            placesData.map((p) => ({
              place_id: p.place_id!,
              name: p.name!,
              distance_m: p.distance_m,
            })),
          );
        }
      }
    }

    void load();
  }, [mode, hotelId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    if (form.price_per_night <= 0 || form.max_guests <= 0) {
      toast.error("Price per night and max guests must be greater than 0.");
      setIsSaving(false);
      return;
    }

    const amenitiesArray = form.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const { data: userId, error: userErr } = await supabase.rpc("auth_user_id");
    if (userErr || typeof userId !== "number") {
      toast.error("Could not resolve host.");
      setIsSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      address: form.address,
      city: form.city,
      country: form.country,
      price_per_night: form.price_per_night,
      max_guests: form.max_guests,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      amenities: amenitiesArray,
      images: images,
      primary_image_url: primaryImageUrl,
      host_id: userId,
    };

    if (mode === "create") {
      const { data: newHotel, error } = await supabase
        .from("hotels")
        .insert(payload)
        .select("hotel_id")
        .single();
      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }
      toast.success("Property created.");
      if (newHotel) {
        navigate(`/host/dashboard/properties/${newHotel.hotel_id}/edit`);
        return;
      }
    } else if (mode === "edit" && hotelId) {
      const { error } = await supabase
        .from("hotels")
        .update(payload)
        .eq("hotel_id", Number(hotelId));
      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }
      toast.success("Property updated.");
    }

    setIsSaving(false);
    navigate("/host/dashboard/properties");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {mode === "create" ? "Add property" : "Edit property"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(event) =>
                    setForm({ ...form, country: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per night</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  value={form.price_per_night}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price_per_night: Number(event.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="max_guests">Max guests</Label>
                <Input
                  id="max_guests"
                  type="number"
                  min={1}
                  value={form.max_guests}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      max_guests: Number(event.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      bedrooms: Number(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  value={form.bathrooms}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      bathrooms: Number(event.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <Input
                id="amenities"
                placeholder="wifi, breakfast, parking"
                value={form.amenities}
                onChange={(event) =>
                  setForm({ ...form, amenities: event.target.value })
                }
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Comma-separated list. Saved as a JSON array in the database.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/host/dashboard/properties")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-6">
        <HotelImageManager
          hotelId={Number(hotelId)}
          currentImages={images}
          primaryImageUrl={primaryImageUrl}
          onImagesChange={async (newImages, newPrimary) => {
            setImages(newImages);
            setPrimaryImageUrl(newPrimary);
            await supabase
              .from("hotels")
              .update({
                images: newImages,
                primary_image_url: newPrimary,
              })
              .eq("hotel_id", Number(hotelId));
          }}
        />
        {mode === "edit" && hotelId && (
          <NearbyPlacesManager
            hotelId={Number(hotelId)}
            hotelCity={form.city}
            linkedPlaces={linkedPlaces}
            onLinkedPlacesChange={setLinkedPlaces}
          />
        )}
      </div>
    </div>
  );
}
