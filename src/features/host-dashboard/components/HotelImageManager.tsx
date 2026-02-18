import { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import supabase from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface HotelImageManagerProps {
  hotelId: number | null;
  currentImages: string[];
  primaryImageUrl: string | null;
  onImagesChange: (images: string[], primaryUrl: string | null) => void;
}

export function HotelImageManager({
  hotelId,
  currentImages,
  primaryImageUrl,
  onImagesChange,
}: HotelImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [authUid, setAuthUid] = useState<string | null>(null);

  useEffect(() => {
    async function getUid() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUid(user?.id ?? null);
    }
    void getUid();
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !hotelId || !authUid) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed.", {
        richColors: true,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.", {
        richColors: true,
      });
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${authUid}/${hotelId}/${crypto.randomUUID()}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from("hotel-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log(data);

    if (uploadError) {
      console.error(uploadError);
      toast.error("Upload failed: " + uploadError.message, {
        richColors: true,
      });
      setUploading(false);
      return;
    }

    const newImages = [
      ...currentImages,
      `https://wioqwjtugcniwbwcaefa.supabase.co/storage/v1/object/public/${data.fullPath}`,
    ];
    const newPrimary =
      primaryImageUrl ||
      `https://wioqwjtugcniwbwcaefa.supabase.co/storage/v1/object/public/${data.fullPath}`;

    onImagesChange(newImages, newPrimary);

    setUploading(false);
    toast.success("Image uploaded.", {
      richColors: true,
    });
  }

  async function handleRemove(imagePath: string) {
    if (!hotelId || !authUid) return;

    const { error } = await supabase.storage
      .from("hotel-images")
      .remove([imagePath]);

    if (error) {
      console.error(error);
      toast.error("Failed to remove image.", {
        richColors: true,
      });
      return;
    }

    const newImages = currentImages.filter((p) => p !== imagePath);
    const newPrimary =
      primaryImageUrl === imagePath
        ? newImages.length > 0
          ? newImages[0]
          : null
        : primaryImageUrl;

    onImagesChange(newImages, newPrimary);
    toast.success("Image removed.", {
      richColors: true,
    });
  }

  function setPrimary(imagePath: string) {
    onImagesChange(currentImages, imagePath);
  }

  if (!hotelId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Save the property first to upload images.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <Label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="mr-2 size-4" />
                {uploading ? "Uploading…" : "Upload image"}
              </span>
            </Button>
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Max 5MB. JPEG, PNG, or WebP.
          </p>
        </div>

        {currentImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentImages.map((path) => {
              const url = path;
              const isPrimary = primaryImageUrl === path;

              return (
                <div key={path} className="group relative">
                  <div className="relative aspect-video overflow-hidden rounded-md border bg-[hsl(var(--muted))]">
                    <img
                      src={url}
                      alt="Hotel"
                      className="h-full w-full object-cover"
                    />
                    {isPrimary && (
                      <div className="absolute left-2 top-2 rounded bg-[hsl(var(--primary))] px-1.5 py-0.5 text-xs font-medium text-[hsl(var(--primary-foreground))]">
                        Primary
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleRemove(path)}
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  {!isPrimary && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-1 w-full text-xs"
                      onClick={() => setPrimary(path)}
                    >
                      Set primary
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {currentImages.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <ImageIcon className="mb-2 size-8 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No images yet. Upload your first image.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
