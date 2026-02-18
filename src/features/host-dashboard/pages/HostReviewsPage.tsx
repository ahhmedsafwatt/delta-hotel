import { useEffect, useState } from "react";
import supabase from "@/utils/supabase-browser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface HostReviewRow {
  review_id: number;
  rating: number;
  comment: string | null;
  guest_first_name: string | null;
  guest_last_name: string | null;
  hotel_name: string | null;
}

export default function HostReviewsPage() {
  const [rows, setRows] = useState<HostReviewRow[]>([]);

  useEffect(() => {
    async function load() {
      const { data: userId, error: userErr } = await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") return;

      const hostHotelIds =
        (
          await supabase
            .from("hotels")
            .select("hotel_id")
            .eq("host_id", userId)
        ).data?.map((h) => h.hotel_id) ?? [];

      const { data, error } = await supabase
        .from("reviews")
        .select(
          "review_id, rating, comment, guest_id, hotel_id, hotels!inner(name), users!reviews_guest_id_fkey(first_name, last_name)",
        )
        .in("hotel_id", hostHotelIds)
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error(error);
        return;
      }

      setRows(
        data.map((row: any) => ({
          review_id: row.review_id,
          rating: row.rating,
          comment: row.comment,
          guest_first_name: row.users?.first_name ?? null,
          guest_last_name: row.users?.last_name ?? null,
          hotel_name: row.hotels?.name ?? null,
        })),
      );
    }

    void load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Feedback from guests across your properties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Recent reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]"
                  >
                    No reviews yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.review_id}>
                    <TableCell className="text-sm font-medium">
                      {row.guest_first_name} {row.guest_last_name}
                    </TableCell>
                    <TableCell className="text-sm">{row.hotel_name}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent))] px-2 py-1 text-xs font-medium">
                        <Star className="size-3 text-yellow-500" />
                        <span>{row.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md text-sm">
                      {row.comment ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

